/* Imports */
var AWS = require('aws-sdk');
var CSV = require('csv-string');
var crypto = require('crypto');
var dateTime = require('node-datetime');
var es = require('elasticsearch');

const constChunkReadBytes = 64 * 1024; //64kb
const delaySelfInvoke = 50; // 0.05 seconds

// Set ElasticSearch location and port, other settings
//TODO: Use environment vars || defaults

var client = new es.Client({
    host: process.env.host,
    requestTimeout: 60000 //60 seconds, default is 30 seconds
});

var s3 = new AWS.S3();

/*
 * Add the given document to the ES domain.
 * If all records are successfully added, indicate success to lambda
 * (using the "context" parameter).
 */
function postDocumentsToES(batch, bucket, key, fileSize, rangeStart, rangeEnd, lineFragment, csvHeaders, importDate, totRecords, invokeCount, context) {
    client.bulk(
        {
            body: batch
        }, function (err, resp) {
            if (err) {
                console.log("Bulk insert response, something went wrong");
                console.log(err);
                context.fail();
            } else {
                console.log("Bulk insert response- time Taken: " + resp.took + "ms, errors: " + resp.errors);

                //Recursive call to self
                if (fileSize > rangeEnd) {
                    rangeStart = parseInt(rangeEnd) + 1;
                    rangeEnd = rangeStart + constChunkReadBytes;
                    setTimeout(callMySelfAndQuit(bucket, key, fileSize, rangeStart, rangeEnd, lineFragment, csvHeaders, importDate, totRecords, parseInt(invokeCount) + 1, context), delaySelfInvoke);
                }else {
                    //We are all done, no more recursion
                    context.succeed({});
                }
            }
        });
}

function callMySelfAndQuit(bucket, key, fileSize, rangeStart, rangeEnd, lineFragment, csvHeaders, importDate, totRecords, invokeCount, context) {
    var lambda = new AWS.Lambda();
    lambda.invoke({
        FunctionName: context.functionName,
        InvocationType: 'Event',
        LogType: 'None',
        Payload: JSON.stringify({
            bucket: bucket,
            key: key,
            fileSize: fileSize,
            rangeStart: rangeStart,
            rangeEnd: rangeEnd,
            lineFragment: lineFragment,
            csvHeaders: csvHeaders,
            importDate: importDate,
            totRecords: totRecords,
            invokeCount: invokeCount,
            parent: context.awsRequestId
        })
    }, function (err, d) {
        if (err) {
            console.log(err, err.stack);
            context.fail();
        }
        else {
            console.log('Calling my-self success, response: ', JSON.stringify(d, null, 2));
        }
        context.succeed({});
    });
}

/**
 * Get the file from the given S3 bucket and key using range header
 * Parse lines and add each log record to the ES domain.
 * @param bucket
 * @param key
 * @param context
 */
function s3CsvToES(bucket, key, fileSize, rangeStart, rangeEnd, lineFragment, csvHeaders, importDate, totRecords, invokeCount, context) {

    var batch = [];

    if (fileSize < rangeEnd) rangeEnd = fileSize;

    var s3Stream = s3.getObject({
        Bucket: bucket,
        Key: key,
        Range: 'bytes=' + rangeStart + '-' + rangeEnd
    }).createReadStream();

    s3Stream.on('data', function (data) {

        var lines = (lineFragment + data.toString('utf8')).split(/(?:\n|\r\n|\r)/g);
        lineFragment = lines.pop() || '';
        data = null;

        if (!csvHeaders) {
            console.log("CSV headers not found, assuming first row as header");
            csvHeaders = CSV.parse(lines.shift())[0];
            console.log(csvHeaders);
        }

        console.log("Processing records: " + lines.length);

        while (lines.length) {
            var row = CSV.parse(lines.shift())[0];
            var recordId = crypto.createHash('md5').update(row.join()).digest("hex");

            var parsedEntry = {};
            for (var j = 0; j < csvHeaders.length; j++) {
                parsedEntry[csvHeaders[j]] = row[j];
            }

            //Add custom fields
            parsedEntry.__CreatedDate = importDate;
            if (parsedEntry["AvailabilityZone"] && parsedEntry["AvailabilityZone"] != "")
                parsedEntry.__AvailabilityRegion = parsedEntry["AvailabilityZone"].replace(/[a-z]{1}$/, '');

            if (!parsedEntry["BlendedCost"] && parsedEntry["Cost"]) {
                parsedEntry.BlendedCost = parsedEntry["Cost"];
            }

            if (!parsedEntry["BlendedRate"] && parsedEntry["Rate"]) {
                parsedEntry.BlendedRate = parsedEntry["Rate"];
            }

            totRecords++;
            batch.push({"index": {"_id": recordId}});
            batch.push(parsedEntry);
        }
    }).on('end', function () {
        console.log("Batch read end, records processed so far: " + totRecords);
        postDocumentsToES(batch, bucket, key, fileSize, rangeStart, rangeEnd, lineFragment, csvHeaders, importDate, totRecords, invokeCount, context);
    });

    s3Stream.on('error', function (err) {
        console.log(
            'Error getting object "' + key + '" from bucket "' + bucket + '".  ' +
            'Make sure they exist and your bucket is in the same region as this function.');

        console.log(err);
        context.fail();
    });
}

/**
 * Lambda "main": Execution starts here
 * @param event
 * @param context
 */
exports.handler = function (event, context) {

    //context.succeed({}); //enable to fix throttle issue or infinite runs
    if (event["Records"]) {
        console.log('S3 event triggered, records count : ', event.Records.length);

        //TODO: use etag and calculate total time taken
        var importDate = dateTime.create().format('Y-m-d H:M:S');

        //TODO: create ES client here reading from environment vars based on bucket which ES to use
        //TODO: Note: The Lambda function should be configured to filter for .log files (as part of the Event Source "suffix" setting).
        event.Records.forEach(function (record) {
            var bucket = record.s3.bucket.name;
            var objKey = decodeURIComponent(record.s3.object.key.replace(/\+/g, ' '));

            s3.headObject({Bucket:bucket, Key: objKey}, function(err, data) {
                if (err) console.log(err,err.code); // an error occurred
                else
                {
                    console.log('Processing file: "' + objKey + '" from bucket: "' + bucket + '"');
                    s3CsvToES(bucket, objKey, data.ContentLength, 0, constChunkReadBytes, '', null, importDate, 0, 1, context);
                }
            });
        });
    } else {
        console.log('Recursively triggered self, invocation count: ' + event.invokeCount);
        //console.log(event);
        s3CsvToES(event.bucket, event.key, event.fileSize, event.rangeStart, event.rangeEnd, event.lineFragment, event.csvHeaders, event.importDate, event.totRecords, event.invokeCount, context);
    }
};
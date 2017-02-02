var AWS = require('aws-sdk');
var csv = require('fast-csv');
var unzip = require('unzip');
var elastic = require('../model/elasticsearch');

//update AWS instance with config
AWS.config.update({
    accessKeyId: "AKIAJLX65J62ZYSKJDFA",
    secretAccessKey: "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"
});

//create S3 object
var s3 = new AWS.S3();


var today = new Date();
var updatedDate = (today.getFullYear() + "-" +
    ("0" + (today.getMonth() + 1)).slice(-2) + "-" +
    ("0" + today.getDate()).slice(-2) + " " +
    ("0" + today.getHours()).slice(-2) + ":" +
    ("0" + today.getMinutes()).slice(-2) + ":" +
    ("0" + today.getSeconds()).slice(-2));
today.setDate(today.getDate() - 1);
var currentYear = today.getFullYear();
var currentMonth = ("0" + today.getMonth() + 1).slice(-2);


//elastic index config
var accountId = 356967975209;
var indexName = "aws-billing";
var typeName = `${currentYear}-${currentMonth}`;
var year = currentYear;
var month = currentMonth;
var bucketName = 'report-aws-billing';
var bucketKeyName = accountId + '-aws-billing-detailed-line-items-with-resources-and-tags-' + year + '-' + month + '.csv.zip';

console.log(currentYear + " == " + currentMonth + " == " + today);
console.log(indexName + " == " + typeName + " == " + bucketKeyName);

elastic.isIndexExists(indexName).then(function (exists) {
    console.log(`index exist : ${exists}`);
    if (!exists) {
        console.log("idex creation initiated");
        return elastic.initIndex(indexName)
    } else {
        console.log("index already exist");
        return;
    }
}, function (indexError) {
    console.trace(`error in checking existance of index ${indexName} : ${indexError.message}`);
}).then(function () {
    console.log("pointer in checking and creating mapping");
    elastic.getMapping(indexName, typeName).then(function (getMappingResult) {
        console.log("in getmapping method");
        if (Object.keys(getMappingResult).length === 0) {
            console.log("mapping initiated");
            return elastic.setMapping(indexName, typeName);
        }
        else {
            console.log("mapping already exist");
            return;
        }
    }, function (getMappingError) {
        console.trace(`error in get mapping of index ${indexName} and type ${typeName} : ${getMappingError.message}`);
    }).then(function () {
        console.log("after mapping document blocks");

        //read csv from s3 bucket and insert in elasticsearch
        //get zip object from bucket and read file data from files
        var zipParams = {
            Bucket: bucketName,
            Key: bucketKeyName
        };

        s3.getObject(zipParams)
            .createReadStream(bucketKeyName)
            .pipe(unzip.Parse())
            .on('entry', function (entry) {
                var fileName = entry.path;
                var type = entry.type; // 'Directory' or 'File' 
                var size = entry.size;
                var pid = 0;

                if (fileName) {
                    csv.fromStream(entry, { headers: true })
                        .on('data', (data) => {
                            if (data['AvailabilityZone']) {
                                pid++;
                                elastic.addDocument(indexName, typeName, data, pid, updatedDate).then(function (docResult) {
                                    console.log(docResult);
                                }, function (docError) {
                                    console.trace(`error in document add in index ${indexName} and type ${typeName} : ${docError.message}`);
                                })
                            }
                        })
                        .on("end", function () {
                            console.log("document add/update operation done");
                        });
                } else {
                    entry.autodrain();
                }

            });

    })
})

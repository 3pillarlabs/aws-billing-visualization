var AWS = require('aws-sdk');
var csv = require('fast-csv');
var unzip = require('unzip');

AWS.config.update({
  accessKeyId: 'AKIAJLX65J62ZYSKJDFA',
  secretAccessKey: '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'
});

var s3 = new AWS.S3();

/* read csv from s3 bucket */
function getAwsData(year, month){
    var keyName = '356967975209-aws-billing-detailed-line-items-with-resources-and-tags-'+year+'-'+month+'.csv.zip';
    //get zip object from bucket and read file data from files
    var zipParams = {
    Bucket: 'report-aws-billing',
    Key: keyName
    };

    return new Promise(function (fulfill, reject){
        s3.getObject(zipParams)
        .createReadStream(keyName)
        .pipe(unzip.Parse())
        .on('entry', function (entry) {
            var fileName = entry.path;
            var type = entry.type; // 'Directory' or 'File' 
            var size = entry.size;
            var csvData = [];
            //console.log(entry);
            
            if (fileName) {
                csv.fromStream(entry, {headers: true})
                .on('data', (data) => {
                    console.log(data);
                    csvData.push(data);
                })
                .on("end", function(){
                    try {
                        fulfill(csvData);
                    } catch (ex) {
                        reject(ex);
                    }
                    //console.log("done");
                }, reject);
            } else {
                entry.autodrain();
            }

        });
    });

    
}
exports.getAwsData = getAwsData;
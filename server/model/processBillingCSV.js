var elasticsearch = require('elasticsearch');
const csv = require('csvtojson');
var crypto = require('crypto');

var client = new elasticsearch.Client({
    host: "http://localhost:9200/"
});

var path = require('path');
var multer = require('multer');

var batch = [];


function processBillingCsv(filePath) {
    return new Promise((resolve, reject) => {
        csv()
        .fromFile(filePath)
        .on('json', (data) => {
            var dataString = JSON.stringify(data);
            var recordId = crypto.createHash('md5').update(dataString).digest("hex");
            batch.push({ "index": { "_index": "aws-billing", "_type": "billing", "_id": recordId } });
            batch.push(data);
        })
        .on('done', (error) => {
            console.log('done');
            client.bulk(
                {
                    body: batch
                }, function (err, resp) {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(resp);
                        console.log("Bulk insert response- time Taken: " + resp.took + "ms, errors: " + resp.errors);
                    }
                });

        });
    })
}


var storage = multer.diskStorage({ //multers disk storage settings
    destination: function (req, file, cb) {
        cb(null, './uploads/');
    },
    filename: function (req, file, cb) {
        var datetimestamp = Date.now();
        cb(null, file.fieldname + '-' + datetimestamp + '.' + file.originalname.split('.')[file.originalname.split('.').length - 1]);
    }
});
var upload = multer({ //multer settings
    storage: storage
}).single('file');

function customUpload(req) {
    return new Promise((resolve, reject) => {
        upload(req, resolve, function (err) {
            console.log(req.file);
            if (err) {
                reject(err);
            } else {
                var filePath = path.resolve('uploads/' + req.file.filename);
                resolve(filePath);
            }
        })

    })
}

exports.processBillingCsv = processBillingCsv;
exports.customUpload = customUpload;

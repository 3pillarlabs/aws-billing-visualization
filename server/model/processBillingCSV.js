var elasticsearch = require('elasticsearch');
const csv = require('csvtojson');
var crypto = require('crypto');

var client = new elasticsearch.Client({
    host: "http://localhost:9200/"
});

var path = require('path');
var multer = require('multer');

var batch = [];

var batches = [];
function processBillingCsv(filePath) {
    return new Promise((resolve, reject) => {
        csv()
        .fromFile(filePath)
        .on('json', (data) => {
            var dataString = JSON.stringify(data);
            var recordId = crypto.createHash('md5').update(dataString).digest("hex");
            if (data.ProductName != '') {
                if (data.AvailabilityZone && data.AvailabilityZone != "") {
                    data.__AvailabilityRegion = data.AvailabilityZone;
                }
                batch.push({ "index": { "_index": "aws-billing", "_type": "billing", "_id": recordId } });
                batch.push(data);
            }
        })
        .on('done', (error) => {
            console.log('done');

            var records = 50000;
            if (batch.length > records) {
                batches = split(batch, records);
                for (var i = 0; i < batches.length; i++) {
                    console.log("batch count", i + 1, batches[i].length);
                }
                insertBulk(reject, resolve);
            } else {
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
            }
        });
    })
}

function split(arr, n) {
    var res = [];
    while (arr.length) {
        res.push(arr.splice(0, n));
    }
    return res;
}

function insertBulk(reject, resolve) {
    var data = batches.next();
    if (data) {
        console.log("bulk Data", data.length);
        client.bulk(
               {
                   body: data
               }, function (err, resp) {
                   if (err) {
                       reject(err);
                   } else {
                       insertBulk(reject, resolve);
                       //resolve(resp);
                       console.log("Bulk insert response- time Taken: " + resp.took + "ms, errors: " + resp.errors);
                   }
               });
    } else {
        resolve("All records uploaded");
    }
}

Array.prototype.current = -1;
Array.prototype.next = function () {
    var item = ++this.current;
    console.log("Current", item);
    return this[item];
};


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

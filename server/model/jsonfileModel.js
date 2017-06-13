var jsonfile = require('jsonfile');

/**
 * Create a new json file
 * @param {*} filePath 
 * @param {*} obj 
 */
function createJsonFile(filePath, obj) {
    return new Promise((fulfill, reject) => {
        jsonfile.writeFile(filePath, obj, function (err) {
            if (err) {
                reject(err);
            } else {
                fulfill('file created successfully..');
            }
        })
    });
}

exports.createJsonFile=createJsonFile;

/**
 * Read json file
 * @param {*} filePath 
 */

function readJsonFile(filePath) {
    return new Promise((fulfill, reject) => {
        jsonfile.readFile(filePath, function (err, obj) {
            if(err){
                reject(err);
            }else{
                fulfill(obj);
            }
        })
    })
}

exports.readJsonFile=readJsonFile;

function writeJsonFile(fileNameWithPath,obj){
    return new Promise((fulfill,reject)=>{
        jsonfile.writeFile(fileNameWithPath, obj, function (err) {
            if(err){
                reject(err);
            }else{
                fulfill('data has been written to json file.');
            }
        })
    })
}
exports.writeJsonFile=writeJsonFile;
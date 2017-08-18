var express = require('express');
var router = express.Router();
var elastic = require('../model/elasticsearch');
var setupESDomain = require('../model/setupelasticsearchdomain');
var AWS = require('aws-sdk');
var path = require('path');
var fs = require('fs');
var awslibrary = require('../model/awslibrary');
var jsonfile = require('../model/jsonfileModel');
var processBillingCsvFile = require('../model/processBillingCSV');
var multer = require('multer');

/**
 * Get AWS resources cost aggregated on regions
 * @param: @Path: string
 * @param: @callback
 * @return: json
 */
router.post('/regions', function (req, res, next) {
    var data = req.body;
    elastic.getRegionsBillingCost(data).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});


/*
 @Purpose: Get all aws resource from elasticsearch
 @Param : @index: companyname e.g:atg ,@type:year_month
 @Return: json of all data
 */
router.post('/getalldata', function (req, res, next) {
    var data = req.body;
    elastic.getResourcesData(data).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});

/* get product wise data from elastic search */
/**
 * Get AWS resources cost aggregated on products
 * @param: @Path: string
 * @param: @callback
 * @return: json
 */
router.post('/getProductWiseData', function (req, res, next) {
    var data = req.body;
    elastic.getProductWiseData(data).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});

/* get Min Max date and totoal record with last created date from elastic search */
/** @param: @Path:
 * @param: @callback
 * @return: json
 */
router.get('/getMinMaxDate/:index', function (req, res) {
    elastic.getMinMaxDate(req.params.index).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});

router.post('/getGroupServicedata', function (req, res, next) {
    var data = req.body;
    elastic.getGroupServicedata(data).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});

router.get('/indexes', function (req, res, next) {
    elastic.getAllIndexes().then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    })
});

router.get('/isIndexExists/:index', function (req, res) {
    elastic.isIndexExists(req.params.index).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});

/* get setup status */
/** @param: @Path:
 * @param: @callback
 * @return: json
 */
router.post('/verifyAndSaveAWSData', function (req, res) {
    var data = req.body;
    if (data.awskey != '' && data.awssecret != '' && data.awsbucket != '') {
        AWS.config.update({
            accessKeyId: data.awskey,
            secretAccessKey: data.awssecret
        });

        var params = {
            Bucket: data.awsbucket
        };
        var s3 = new AWS.S3();
        s3.getBucketAcl(params, function (err, data) {
            if (err) {
                // an error occurred
                res.status(err.statusCode);
                res.json({ 'error': err.message });
            } else {
                // successful response
                res.json(data);
            }
        });
    } else {
        res.status(404);
        res.error('Required Parameter missing');
    }
});

/* Upload sample file to aws bucket */
router.post('/uploadSampleFile', function (req, res) {
    var path = "app/components/setup";
    var file = req.body.file;
    var bucketname = req.body.awsdata.awsbucket;
    AWS.config.update({
        accessKeyId: req.body.awsdata.awskey,
        secretAccessKey: req.body.awsdata.awssecret
    });
    var s3bucket = new AWS.S3({ params: { Bucket: bucketname } });
    s3bucket.createBucket(function () {
        var params = {
            Key: 'samplefile.csv',
            Body: path + "/" + file
        };
        s3bucket.upload(params, function (err, data) {
            if (err) {

                res.json({ 'error': err });
            } else {
                res.status(200);
                res.json({ 'success': true, 'data': data });
            }
        });
    });
});

/* get setup status */
/** @param: @Path:
 * @param: @callback
 * @return: json
 */
router.get('/isElasticConnected', function (req, res) {
    elastic.isElasticConnected().then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});


router.post('/validateAndSaveAccessKey', function (req, res) {
    var jsonObj = {
        accessKeyId: req.body.accesskey,
        secretAccessKey: req.body.secretkey,
        region: req.body.region
    };

    var filepath = './awsconfig.json';
    jsonfile.createJsonFile(filepath, jsonObj).then(function (result) {
        awslibrary.updateConfig();
        awslibrary.listBucket().then(function (result) {
            res.status(200);
            res.json(result);
        }, function (err) {
            res.json(err);
        })
    }, function (err) {
        res.json(err);
    });
});

router.post('/createESDomain', function (req, res) {
    var domainName = req.body.domainName;
    awslibrary.createESDomain(domainName).then(function (result) {
        res.status(200);
        res.json(result);
    }, function (err) {

        res.json(err);
    })
})

router.get('/getElasticsearchDomainInfo/:domainName', function (req, res) {
    awslibrary.describeElasticsearchDomain(req.params.domainName).then(function (result) {
        res.status(200);
        res.json(result);
    }, function (error) {

        res.json(error);
    })
})

router.post('/createESIndex', function (req, res) {
    var host = req.body.Endpoint;
    var indexName = req.body.indexName;
    var doctype = req.body.doctype;
    setupESDomain.setClientHost(host);

    setupESDomain.createIndex(indexName).then(function (result) {
        setupESDomain.createMapping(indexName, doctype).then(function (result) {
            res.json(result);
        }, function (error) {
            res.json(err);
        })
    }, function (error) {
        res.json(err);
    })
})

router.get('/createRolewithPermission', function (req, res) {
    awslibrary.updateConfig();
    var roleARN = '';
    var roleId = '';
    var roleName = 'awsBilling';
    var path = '/aws-billing/';
    var logGroup = '/aws/lambda/billingCsv';
    //Code Start: For Creating Role and Policy with attaching policy with the created Role
    awslibrary.createRole(roleName, path).then(function (result) {
        //Get created role detail
        awslibrary.getRole(roleName).then(function (result) {
            roleARN = result.Role.Arn;
            roleId = result.Role.RoleId;

            awslibrary.createPolicy(1, null, null).then(function (result) {
                var policyArn = result.Policy.Arn;
                awslibrary.attachRolePolicy(policyArn, roleName).then(function (result) {

                    awslibrary.createPolicy(2, null, null).then(function (result) {
                        var policyArn = result.Policy.Arn;
                        awslibrary.attachRolePolicy(policyArn, roleName).then(function (result) {
                            //Create Cloud watch group to capture lambda logs
                            awslibrary.createLogGroup(logGroup).then(function (result) {
                                awslibrary.describeLogGroups(logGroup).then(function (result) {
                                    var logGroupArn = result.logGroups[0].arn;
                                    var logGroupResource = logGroupArn.substring(0, logGroupArn.indexOf('log-group'));

                                    awslibrary.createPolicy(3, logGroupResource, logGroupArn).then(function (result) {
                                        var policyArn = result.Policy.Arn;
                                        awslibrary.attachRolePolicy(policyArn, roleName).then(function (result) {
                                            var AWSLambdaExecute = "arn:aws:iam::aws:policy/AWSLambdaExecute";
                                            awslibrary.attachRolePolicy(AWSLambdaExecute, roleName).then(function (result) {
                                                var responseRes = {
                                                    roleARN: roleARN,
                                                    roleId: roleId
                                                }
                                                res.json(responseRes);
                                            }, function (error) {
                                                res.json(error);
                                            })

                                        }, function (error) {
                                            res.json(error);
                                        })
                                    }, function (error) {
                                        res.json(error);
                                    });

                                }, function (error) {
                                    res.json(error);
                                })
                            }, function (error) {
                                res.json(error);
                            })

                        }, function (error) {
                            res.json(error);
                        })
                    }, function (error) {
                        res.json(error);
                    })

                }, function (error) {
                    res.json(error);
                })
            }, function (error) {
                res.json(error);
            })
            /*var AWSLambdaFullAccess = "arn:aws:iam::aws:policy/AWSLambdaFullAccess";
            awslibrary.attachRolePolicy(AWSLambdaFullAccess, roleName).then(function (result) {
            }, function (error) {
              res.json(error);
            })*/

        }, function (error) {
            res.json(error);
        })
    }, function (error) {
        res.json(error);
    })

    //Code End: For Creating Role and Policy with attaching policy with the created Role
})

router.post('/createLambdasForSetup', function (req, res) {
    var indexName = req.body.indexName;
    var doctype = req.body.doctype;
    var host = req.body.esHost;
    var lambdaBucket = req.body.buckets.lambdazipbucket;
    var websiteSetupbucket = req.body.buckets.websiteSetupbucket;
    var lambdaZipDir = './lambdaZip/';
    var awskeyfile = "awsconfig.json";

    //Create Role for creating lambda and executive lambda
    var roleName = 'awsBilling';
    var path = '/aws-billing/';
    var ProcessBillingCSVLambdaARN = '';
    var roleARN = req.body.roleARN;
    var roleId = req.body.roleId;
    var logGroup = '/aws/lambda/billingCsv';



    //Creating Bucket for Lambda function upload
    awslibrary.createBucket(lambdaBucket).then(function (result) {
        //Read AWS Key from json file
        jsonfile.readJsonFile(awskeyfile).then(function (result) {
            //Upload lambda zips to Bucket
            var accessKeyId = result.accessKeyId;
            var secretAccessKey = result.secretAccessKey;
            awslibrary.uploadDirInBucket(lambdaBucket, lambdaZipDir, accessKeyId, secretAccessKey).then(function (result) {
                //read lambda zip directory to create lambda function
                fs.exists(lambdaZipDir, (exists) => {
                    fs.readdir(lambdaZipDir, (err, files) => {
                        var enviromentHost = host;
                        //Iterate lambda function container files
                        var memmorysize = 128;
                        var lambdaFunsArn = [];

                        files.forEach((file) => {
                            if (file === 'processBillingCsv.zip') {
                                enviromentHost = host + '/' + indexName + '/' + doctype;
                                memmorysize = 512;
                            }
                            var funName = file.slice(0, -4);
                            var lambdaFunName = funName + 'test';
                            var desc = funName;
                            //Creating Lambda function
                            awslibrary.createFunction(lambdaBucket, file, lambdaFunName, roleARN, desc, enviromentHost, memmorysize).then(function (result) {
                                //Condition for process billing csv file
                                var obj = {
                                    funName: lambdaFunName,
                                    arn: result.FunctionArn
                                }
                                lambdaFunsArn.push(obj);
                                var requiredApiCount = lambdaFunsArn.length;
                                if (requiredApiCount === 5) {
                                    res.status(200).json(lambdaFunsArn);
                                }
                            }, function (error) {
                                res.status(500).json(error);
                            })
                        });
                    });
                });
            }, function (err) {
                res.status(500).json(err);
            })
        }, function (err) {
            res.status(500).json(err);
        })
    }, function (error) {
        res.status(500).json(error);
    })
})

router.post('/setupBillingBucket', function (req, res) {
    var billingCsvbucket = req.body.bucket;
    var lambdafunArn = req.body.arn;
    //Creating Bucket For Billing CSV File
    awslibrary.createBucket(billingCsvbucket).then(function (result) {
        //Adding Permission to lambda function
        awslibrary.addPermissionToS3(lambdafunArn, billingCsvbucket).then(function (result) {
            //Set Notification for when object created lambda function will be called
            awslibrary.putBucketNotificationConfiguration(billingCsvbucket, lambdafunArn).then(function (result) {
                //Conditional If upload Sample file checked
                var samplefile = 'billingsample.csv';
                var filepath = './';
                awslibrary.uploadfileInBucket(samplefile, filepath, billingCsvbucket).then(function (result) {
                    res.status(200).json(result);
                }, function (error) {
                    res.status(500).json(error);
                })
            }, function (error) {
                res.status(500).json(error);
            })
        }, function (error) {
            res.status(500).json(error);
        })
    }, function (error) {
        res.status(500).json(error);
    });
})

router.post('/createApisForSetup', function (req, res) {
    // Lambda functions that need api Gateway to expose data
    var funName = req.body.funName;
    var lambdafunArn = req.body.arn;
    var lambdaFunName = req.body.funName;
    var lambdafunArnArr = lambdafunArn.split(":");
    var region = lambdafunArnArr[3];
    var accountId = lambdafunArnArr[4];
    var apiGName = '';
    var apiDesc = '';
    switch (funName) {
        case 'detailReportDatatest':
            apiGName = 'getBilling';
            apiDesc = 'Get aws billing data from elasticsearch. Created for AWS Billing Visualization.';
            break;
        case 'getIndexestest':
            apiGName = 'getIndexes';
            apiDesc = 'Get all stored indexed in elasticsearch. Created for AWS Billing Visualization.';
            break;
        case 'groupedServiceDatatest':
            apiGName = 'getGroupedRecord';
            apiDesc = 'Get product and region wise group data from elasticsearch. Created for AWS Billing Visualization.';
            break;
        case 'recordInfotest':
            apiGName = 'getRecordInfo';
            apiDesc = 'Get total number of record and last imported billing file info. Created for AWS Billing Visualization.';
            break;
    }

    /*Api Gateway Start Here*/
    if (apiGName !== '') {
        var tempapiName = apiGName + 'test';
        awslibrary.createRestApi(tempapiName, apiDesc).then(function (result) {
            var apiName = result.name;
            var apiId = result.id;
            awslibrary.getResources(apiId).then(function (result) {
                var rootId = result.items[0].id;
                var path = result.items[0].path;
                awslibrary.createResource(rootId, tempapiName, apiId).then(function (result) {
                    var resourceId = result.id;
                    var resourcePath = result.path;
                    var resourcePathPart = result.pathPart;
                    var resourceParentid = result.parentId;
                    awslibrary.putMethod('NONE', 'POST', resourceId, apiId).then(function (result) {
                        var uniqueIdentifier = "arn:aws:apigateway:" + region + ":lambda:path/2015-03-31/functions/" + lambdafunArn + "/invocations";
                        awslibrary.putIntegration('POST', resourceId, apiId, 'AWS', uniqueIdentifier).then(function (result) {
                            var responsemodel = {
                                "application/json": "Empty"
                            }
                            var responseParameters = {
                                "method.response.header.Access-Control-Allow-Origin": false
                            };
                            awslibrary.putMethodResponse('POST', resourceId, apiId, responsemodel, responseParameters).then(function (result) {
                                var responseTemplate = {
                                    "application/json": ""
                                };
                                var responseParameters = {
                                    "method.response.header.Access-Control-Allow-Origin": '\'*\'',
                                };
                                awslibrary.putIntegrationResponse('POST', resourceId, apiId, responseTemplate, responseParameters).then(function (result) {
                                    var stage = 'prod';
                                    awslibrary.createDeployment(apiId, stage).then(function (result) {
                                        var apiGatewayArn = 'arn:aws:execute-api:' + region + ':' + accountId + ':' + apiId + '/*/POST/' + tempapiName;
                                        awslibrary.addPermission(apiGatewayArn, lambdaFunName).then(function (result) {
                                            var apiUrl = awslibrary.getApiInvokeUrl(apiId, region, stage);
                                            res.status(200).json({ url: apiUrl, apiId: apiId, resourceId: resourceId });
                                        }, function (error) {
                                            res.status(500).json(error);
                                        })
                                    }, function (error) {
                                        res.status(500).json(error);
                                    })
                                }, function (error) {
                                    res.status(500).json(error);
                                })
                            }, function (error) {
                                res.status(500).json(error);
                            })
                        }, function (error) {
                            res.status(500).json(error);
                        })
                    }, function (error) {
                        res.status(500).json(error);
                    })
                }, function (error) {
                    res.status(500).json(error);
                })
            }, function (error) {
                res.status(500).json(error);
            })
        }, function (error) {
            res.status(500).json(error);
        })
        /*Api Gateway End Here*/
    }
});

router.post('/enableCorsForApi', function (req, res) {
    awslibrary.updateConfig();
    var apiId = req.body.apiId;
    var resourceId = req.body.resourceId;
    var httpMethod = 'OPTIONS';

    awslibrary.putMethod('NONE', httpMethod, resourceId, apiId).then(function (result) {
        var requestTemplates = {
            "application/json": "{\"statusCode\": 200}"
        };
        awslibrary.putIntegrationForCors(httpMethod, resourceId, apiId, 'MOCK', requestTemplates).then(function (result) {
            var responsemodel = {
                "application/json": "Empty"
            };
            var responseParameters = {
                "method.response.header.Access-Control-Allow-Headers": false,
                "method.response.header.Access-Control-Allow-Origin": false,
                "method.response.header.Access-Control-Allow-Methods": false,
            };
            awslibrary.putMethodResponseForCors(httpMethod, resourceId, apiId, responsemodel, responseParameters).then(function (result) {
                var responseTemplate = {
                    "application/json": ""
                };

                var responseParameters = {
                    "method.response.header.Access-Control-Allow-Headers": '\'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token\'',
                    "method.response.header.Access-Control-Allow-Origin": '\'*\'',
                    "method.response.header.Access-Control-Allow-Methods": '\'*\''
                };

                awslibrary.putIntegrationResponseForCors(httpMethod, resourceId, apiId, responseTemplate, responseParameters).then(function (result) {
                    var stage = 'prod';
                    awslibrary.createDeployment(apiId, stage).then(function (result) {
                        res.status(200).json(result);
                    }, function (error) {
                        res.status(500).json(error);
                    })
                }, function (error) {
                    res.status(500).json(error);
                })
            }, function (error) {
                res.status(500).json(error);
            })
        }, function (error) {
            res.status(500).json(error);
        })
    }, function (error) {
        res.status(500).json(error);
    })
})

router.post('/creatApisJsonFile', function (req, res) {
    var apiUrls = req.body.apiUrls;
    var pathForApiJsonFile = './src/assets/awsApi.json';
    jsonfile.writeJsonFile(pathForApiJsonFile, apiUrls).then(function (result) {
        res.status(200).json(result);
    }, function (error) {
        res.status(500).json(error);
    })
    var pathForDistApiJsonFile = './dist/assets/awsApi.json';
    jsonfile.writeJsonFile(pathForDistApiJsonFile, apiUrls).then(function (result) {
        res.status(200).json(result);
    }, function (error) {
        res.status(500).json(error);
    })
})

router.post('/setupAwsStaticWebsite', function (req, res) {
    var awsWebsiteBucket = req.body.websiteBucket;
    var dirtPath = "./dist";
    var awskeyfile = "awsconfig.json";
    awslibrary.createBucket(awsWebsiteBucket).then(function (result) {
        jsonfile.readJsonFile(awskeyfile).then(function (result) {
            //Upload lambda zips to Bucket
            var accessKeyId = result.accessKeyId;
            var secretAccessKey = result.secretAccessKey;
            var region = result.region;
            awslibrary.uploadDirInBucket(awsWebsiteBucket, dirtPath, accessKeyId, secretAccessKey).then(function (result) {
                awslibrary.putBucketPolicy(awsWebsiteBucket).then(function (result) {
                    awslibrary.configureBucketAsWebsite(awsWebsiteBucket).then(function (result) {
                        var websiteEndPoint = "http://" + awsWebsiteBucket + ".s3-website-" + region + ".amazonaws.com/";
                        res.status(200).json(websiteEndPoint);
                    }, function (error) {
                        res.status(500).json(error);
                    })
                }, function (error) {
                    res.status(500).json(error);
                })
            }, function (error) {
                res.status(500).json(error);
            })
        }, function (error) {
            res.status(500).json(error);
        });
    }, function (error) {
        res.status(500).json(error);
    })
})

router.post('/upload', function (req, res) {
    processBillingCsvFile.customUpload(req).then(function (filePath) {
        processBillingCsvFile.processBillingCsv(filePath).then(function (result) {
            res.json({ error_code: 0, err_desc: null });
            console.log(result);
        }, function (error) {
            console.log(error);
        });
    }, function (err) {
        
        console.log(err);
    })
});

router.post('/getDetailedData', function (req, res) {
    var data = req.body;
    elastic.getDetailedData(data).then(function (result) {
        res.json(result);
    }, function (error) {
        res.status(error.status || 500);
        res.json({
            'error': error.message
        });
    });
});

module.exports = router;

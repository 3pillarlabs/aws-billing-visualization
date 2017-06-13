var express = require('express');
var router = express.Router();
var elastic = require('../model/elasticsearch');
var setupESDomain = require('../model/setupelasticsearchdomain');
var AWS = require('aws-sdk');
var path = require('path');
var fs = require('fs');
var awslibrary = require('../model/awslibrary');
var jsonfile = require('../model/jsonfileModel');


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
        console.log('error');
        console.log(err);
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

router.post('/setupLambdaApiWebsite', function (req, res) {
  var indexName = req.body.indexName;
  var doctype = req.body.doctype;
  var host = req.body.esHost;
  var lambdaBucket = req.body.buckets.lambdazipbucket;
  var billingCsvbucket = req.body.buckets.billingCsvbucket;
  var websiteSetupbucket = req.body.buckets.websiteSetupbucket;
  var lambdaZipDir = './lambdaZip/';
  var awskeyfile = "awsconfig.json";
  awslibrary.updateConfig();

  //Create Role for creating lambda and executive lambda
  var roleName = 'awsBilling';
  var path = '/aws-billing/';
  var ProcessBillingCSVLambdaARN = '';
  var roleARN = '';
  var roleId = '';
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
        }, function (error) {
          res.json(error);
        })
      }, function (error) {
        res.json(error);
      })

      awslibrary.createPolicy(2, null, null).then(function (result) {
        var policyArn = result.Policy.Arn;
        awslibrary.attachRolePolicy(policyArn, roleName).then(function (result) {
        }, function (error) {
          res.json(error);
        })
      }, function (error) {
        res.json(error);
      })

      //Create Cloud watch group to capture lambda logs
      awslibrary.createLogGroup(logGroup).then(function (result) {
        awslibrary.describeLogGroups(logGroup).then(function (result) {
          var logGroupArn = result.logGroups[0].arn;
          var logGroupResource = logGroupArn.substring(0, logGroupArn.indexOf('log-group'));

          awslibrary.createPolicy(3, logGroupResource, logGroupArn).then(function (result) {
            var policyArn = result.Policy.Arn;
            awslibrary.attachRolePolicy(policyArn, roleName).then(function (result) {
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


      var AWSLambdaExecute = "arn:aws:iam::aws:policy/AWSLambdaExecute";
      awslibrary.attachRolePolicy(AWSLambdaExecute, roleName).then(function (result) {
      }, function (error) {
        res.json(error);
      })

    }, function (error) {
      res.json(error);
    })
  }, function (error) {
    res.json(error);
  })

  //Code End: For Creating Role and Policy with attaching policy with the created Role

  var apiUrlObj={
    getBilling:"",
    getIndexes:"",
    getGroupedRecord:"",
    getRecordInfo:""
  };

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
                var lambdafunArn = result.FunctionArn;
                var lambdafunArnArr = lambdafunArn.split(":");
                var region = lambdafunArnArr[3];
                var accountId = lambdafunArnArr[4];

                if (file === 'processBillingCsv.zip') {
                  ProcessBillingCSVLambdaARN = result.FunctionArn;
                  //Creating Bucket For Billing CSV File
                  awslibrary.createBucket(billingCsvbucket).then(function (result) {
                    //Adding Permission to lambda function
                    awslibrary.addPermission(ProcessBillingCSVLambdaARN, billingCsvbucket).then(function (result) {
                      //Set Notification for when object created lambda function will be called
                      awslibrary.putBucketNotificationConfiguration(billingCsvbucket, ProcessBillingCSVLambdaARN).then(function (result) {
                        //Conditional If upload Sample file checked
                        var samplefile = 'billingsample.csv';
                        var filepath = './';
                        awslibrary.uploadfileInBucket(samplefile, filepath, billingCsvbucket).then(function (result) {
                          //res.status(200);
                          //res.json(result);
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
                  });
                }

                var apiGName = '';
                var apiDesc = '';
                switch (funName) {
                  case 'detailReportData':
                    apiGName = 'getBilling';
                    apiDesc = 'Get aws billing data from elasticsearch. Created for AWS Billing Visualization.';
                    break;
                  case 'getIndexes':
                    apiGName = 'getIndexes';
                    apiDesc = 'Get all stored indexed in elasticsearch. Created for AWS Billing Visualization.';
                    break;
                  case 'groupedServiceData':
                    apiGName = 'getGroupedRecord';
                    apiDesc = 'Get product and region wise group data from elasticsearch. Created for AWS Billing Visualization.';
                    break;
                  case 'recordInfo':
                    apiGName = 'getRecordInfo';
                    apiDesc = 'Get total number of record and last imported billing file info. Created for AWS Billing Visualization.';
                    break;
                }
                /*Api Gateway Start Here*/
                var tempapiName = apiGName + 'test';
                awslibrary.createRestApi(tempapiName, apiDesc).then(function (result) {
                  var apiName = result.name;
                  var apiId = result.id;
                  awslibrary.getResources(apiId).then(function (result) {
                    var rootId = result.items[0].id;
                    var path = result.items[0].path;
                    awslibrary.createResource(rootId, apiGName, apiId).then(function (result) {
                      var resourceId = result.id;
                      var resourcePath = result.path;
                      var resourcePathPart = result.pathPart;
                      var resourceParentid = result.parentId;
                      awslibrary.putMethod('NONE', 'POST', resourceId, apiId).then(function (result) {
                        var uniqueIdentifier = 'arn:aws:apigateway:' + region + ':lambda:path/2015-03-31/functions:' + lambdafunArn + '/invocations';
                        awslibrary.putIntegration('POST', resourceId, apiId, 'AWS', uniqueIdentifier).then(function (result) {
                          var responsemodel = {
                            "application/json": "Empty"
                          }
                          awslibrary.putMethodResponse('POST', resourceId, apiId, responsemodel).then(function (result) {
                            var responseTemplate = {
                              "application/json": ""
                            };
                            awslibrary.putIntegrationResponse('POST', resourceId, apiId, responseTemplate).then(function (result) {
                              var stage='prod';
                              awslibrary.createDeployment(apiId,stage).then(function (result) {
                                var apiGatewayArn='arn:aws:execute-api:'+region+':'+accountId+':'+apiId+'/*/POST/'+apiGName;
                                awslibrary.addPermission(apiGatewayArn,lambdaFunName).then(function(result){
                                  awslibrary.getApiInvokeUrl(apiId,region,stage).then(function(result){
                                    apiUrlObj.funName=result;
                                    console.log(result);
                                  },function(error){
                                    console.log(error);
                                  })
                                },function(error){
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
                    }, function (error) {
                      res.json(error);
                    })
                  }, function (error) {
                    res.json(error);
                  })
                }, function (error) {
                  res.json(error);
                })
                /*Api Gateway End Here*/

              }, function (error) {
                res.json(error);
              })
            });
          });
        });

      }, function (err) {
        res.json(err);
      })
    }, function (err) {
      res.json(err);
    })
  }, function (error) {
    res.json(error);
  })


  var pathForApiJsonFile='./src/awsApi.json';
  jsonfile.writeJsonFile(pathForApiJsonFile,apiUrlObj).then(function(result){
    console.log(result);
  },function(error){
    console.log(error);
  })
})


module.exports = router;

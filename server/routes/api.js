var express = require('express');
var router = express.Router();
var elastic = require('../model/elasticsearch');
var AWS = require('aws-sdk');

/**
 * Get AWS resources cost aggregated on regions
 * @param: @Path: string
 * @param: @callback
 * @return: json
 */
router.post('/regions',function(req,res,next){
  var data=req.body;
  elastic.getRegionsBillingCost(data).then(function(result){
    res.json(result);
  },function(error){
    res.status(error.status || 500);
    res.json({
      'error':error.message
    });
  });
});


/*
 @Purpose: Get all aws resource from elasticsearch
 @Param : @index: companyname e.g:atg ,@type:year_month
 @Return: json of all data
 */
router.post('/getalldata', function(req, res, next){
  var data=req.body;
  elastic.getResourcesData(data).then(function(result){
    res.json(result);
  },function(error){
    res.status(error.status || 500);
    res.json({
      'error':error.message
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
router.post('/getProductWiseData',function(req,res,next){
  var data=req.body;
  elastic.getProductWiseData(data).then(function(result){
    res.json(result);
  },function(error){
    res.status(error.status || 500);
    res.json({
      'error':error.message
    });
  });
});

/* get Min Max date and totoal record with last created date from elastic search */
/** @param: @Path:
 * @param: @callback
 * @return: json
 */
router.get('/getMinMaxDate/:index',function(req,res){
  elastic.getMinMaxDate(req.params.index).then(function(result){
    res.json(result);
  },function(error){
    res.status(error.status || 500);
    res.json({
      'error':error.message
    });
  });
});

router.post('/getGroupServicedata',function(req,res,next){
  var data=req.body;
  elastic.getGroupServicedata(data).then(function(result){
    res.json(result);
  },function(error){
    res.status(error.status || 500);
    res.json({
      'error':error.message
    });
  });
});

router.get('/indexes',function(req,res,next){
  elastic.getAllIndexes().then(function(result){
    res.json(result);
  },function(error){
    res.status(error.status || 500);
    res.json({
      'error':error.message
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
        res.json({'error':err.message});
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
router.post('/uploadSampleFile',function(req,res){
  var path="app/components/setup";
  var file = req.body.file;
  var bucketname = req.body.awsdata.awsbucket;
  AWS.config.update({
    accessKeyId: req.body.awsdata.awskey,
    secretAccessKey: req.body.awsdata.awssecret
  });
  var s3bucket = new AWS.S3({params: {Bucket: bucketname}});
  s3bucket.createBucket(function() {
    var params = {
      Key: 'samplefile.csv',
      Body: path+"/"+file
    };
    s3bucket.upload(params, function(err, data) {
      if (err) {
        res.status(500);
        res.json({'error':err});
      } else {
        res.status(200);
        res.json({'success':true,'data':data});
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

module.exports = router;

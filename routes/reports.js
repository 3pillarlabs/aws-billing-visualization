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
})

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
router.get('/issetup', function (req, res) {
    res.json(elastic.isSetup());
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
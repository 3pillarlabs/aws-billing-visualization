var express = require('express');  
var router = express.Router();

var elastic = require('../model/elasticsearch');
var awssdk = require('../model/awssdk');


/* Create index with indexname if not exist */
router.get('/addindex/:indexname', function(req, res, next){
    elastic.initIndex(req.params.indexname)
        .then(function(result){
            res.json(result);
        })
})

/* get data from s3 bucket */
router.get('/getcsvdata/:year/:month', function(req, res, next){   
    awssdk.getAwsData(req.params.year,req.params.month)
        .then(function(result){
            res.json(result);
        })
})

/* get regions from elastic search */
router.post('/regions',function(req,res,next){
	var data=req.body;
    elastic.getRegions(data).then(function(result){
        console.log(result);
        res.json(result);
    },function(error){
        res.send(400);
        res.error(error);
    });
})


/*
@Purpose: Get all aws resource from elasticsearch
@Param : @index: companyname e.g:atg ,@type:year_month  
@Return: json of all data
 */
router.post('/getalldata', function(req, res, next){
    var data=req.body;   
    elastic.getAllData(data)
        .then(function(result){
            res.json(result);
        })
})

module.exports = router;
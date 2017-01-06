var express = require('express');  
var router = express.Router();
var elastic = require('../model/elasticsearch');

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
    elastic.getResourcesData(data).then(function(result){
        res.json(result);
    },function(error){
        res.send(400);
        res.error(error);
    });
})

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
        console.log(result);
        res.json(result);
    },function(error){
        res.send(400);
        res.error(error);
    });
})

module.exports = router;
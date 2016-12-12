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

module.exports = router;
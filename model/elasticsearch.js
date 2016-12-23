var elasticsearch = require('elasticsearch');

//create elsaticsearch client
var elasticClient = new elasticsearch.Client({  
    host: 'http://172.20.38.132:9200/'
});

//var indexName = "randomindex";

/**
* create the index
*/
function initIndex(indexName) {  
    console.log("index : "+indexName);
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/**
* Delete an existing index
*/
function deleteIndex(indexName) {  
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
* check if the index exists
*/
function indexExists(indexName) {  
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.indexExists = indexExists;

function initMapping(indexName, typeName) {  
    return elasticClient.indices.putMapping({
        index: indexName,
        type: typeName,
        body: {
            properties: {
                invoice_id: { type: "text" },
                payer_account_id: { type: "text" },
                linked_account_id: { type: "text" },
                record_type: { type: "text" },
                record_id: { type: "text" },
                product_name: { type: "text" },
                rate_id: { type: "integer" },
                subscription_id: { type: "integer" },
                pricing_plan_id: { type: "integer" },
                usage_type: { type: "text" },
                operation: { type: "text" },
                availability_zone: { type: "keyword" },
                reserved_instance: { type: "text" },
                item_description: { type: "text" },
                usage_start_date: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                usage_end_date: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                usage_quantity: { type: "double" },
                blended_rate: { type: "double" },
                blended_cost: { type: "double" },
                un_blended_rate: { type: "double" },
                un_blended_cost: {type: "double"},
                resource_id: { type: "text" }
            }
        }
    });
}
exports.initMapping = initMapping;

function getMapping(indexName, typeName) {  
    return elasticClient.indices.getMapping({
        index: indexName,
        type: typeName
    });
}
exports.getMapping = getMapping;

function addDocument(indexName, typeName, data, pid) {
    return elasticClient.index({
        index: indexName,
        id: pid,
        type: typeName,
        body: {
            "invoice_id": data['InvoiceID'],
            "payer_account_id": data['PayerAccountId'],
            "linked_account_id": data['LinkedAccountId'],
            "record_type": data['RecordType'],
            "record_id": data['RecordId'],
            "product_name": data['ProductName'],
            "rate_id": data['RateId'],
            "subscription_id": data['SubscriptionId'],
            "pricing_plan_id": data['PricingPlanId'],
            "usage_type": data['UsageType'],
            "operation": data['Operation'],
            "availability_zone": data['AvailabilityZone'],
            "reserved_instance": data['ReservedInstance'],
            "item_description": data['ItemDescription'],
            "usage_start_date": data['UsageStartDate'],
            "usage_end_date": data['UsageEndDate'],
            "usage_quantity": data['UsageQuantity'],
            "blended_rate": data['BlendedRate'],
            "blended_cost": data['BlendedCost'],
            "un_blended_rate": data['UnBlendedRate'],
            "un_blended_cost":data['UnBlendedCost'],
            "resource_id": data['ResourceId']
        }
    });
}
exports.addDocument = addDocument;

function getAllRegionsCost(indexName, typeName){
    return elasticClient.search({
        index: indexName,
        type: typeName,
        body: {
            "size": 0,
            "aggs": {
                "availability_zone": {
                    "terms": {
                        "field": "availability_zone",
                         "order": { "blended_cost": "desc" }
                    },
                    "aggs": {
                        "blended_cost": {
                            "sum": {
                                "field": "blended_cost"
                            }
                        }
                    }
                }
            }
        }
        
    });
}
exports.getAllRegionsCost = getAllRegionsCost;

function getRegionData(indexName, typeName, regionName){
    return elasticClient.search({
        index: indexName,
        type: typeName,
        body: {
            "query" : {
                "constant_score" : { 
                    "filter" : {
                        "bool" : {
                        "should" : { 
                            "term" : {"availability_zone" : regionName}
                        },
                        "must_not" : {
                            "term" : {"blended_cost" : 0} 
                        }
                    }
                    }
                }
            },
            "_source": [
                "record_id", 
                "product_name", 
                "subscription_id",
                "pricing_plan_id",
                "usage_type",
                "availability_zone",
                "item_description",
                "usage_start_date",
                "usage_end_date",
                "usage_quantity",
                "blended_rate",
                "blended_cost",
                "resource_id",
                "operation"
                ]
        }
    })

}
exports.getRegionData = getRegionData;

function getAllData(data){
    var indexName=data.company;
    var startdate=data.strdate;
	var enddate=data.enddate;
    var from =0;
    if(data.currentpage){
        from=((data.currentpage-1) * 10);
    }
    
    var size =10;
    if(data.size){
        size=data.size;
    }
    var filter={};
    if(data.filter){
         filter={   "match_phrase_prefix" : {   "operation" : data.filter } };
    }
        
    return elasticClient.search({
        index: indexName,
        body: {
            "from" : from, 
            "size" : size,
            "query" : {
                "bool": {
    		            "must": [
    		                {
    		                    "range": {
			                        "usage_start_date": {
			                            "gte": startdate,
			                            "lte": enddate,
			                            "format": "yyyy-MM-dd"
			                        }
			                    }
			                },
			                {
			                    "range": {
			                        "usage_end_date": {
			                            "gte": startdate,
			                            "lte": enddate,
			                            "format": "yyyy-MM-dd"
			                        }
			                    }
			                },
                            {
    		                    "range": {
			                        "blended_cost": {
			                            "gt": 0
			                        }
			                    }
			                },
                            filter
                            
			            ]
                    
			        }
            },
            "_source": [
                "record_id", 
                "product_name", 
                "subscription_id",
                "pricing_plan_id",
                "usage_type",
                "availability_zone",
                "item_description",
                "usage_start_date",
                "usage_end_date",
                "usage_quantity",
                "blended_rate",
                "blended_cost",
                "resource_id",
                "operation"
                ]
        }
    })

}
exports.getAllData = getAllData;

/**
 * @Purpose: Return regions wise totla cost and resouces
 * @Param : postdata obj e.g: awsdata = {
    		company: 'tpg',
    		year: year,
    		month: month
		};
 */

function getRegions(postdata){
        var data=postdata;
		var startdate=data.strdate;
		var enddate=data.enddate;

        var indexval=data.company;

		return elasticClient.search({  
		  index: indexval,
		  size: 0,
		  body: {
		  		"query": {
			        "bool": {
			            "must": [
			                {
			                    "range": {
			                        "usage_start_date": {
			                            "gte": startdate,
			                            "lte": enddate,
			                            "format": "yyyy-MM-dd"
			                        }
			                    }
			                },
			                {
			                    "range": {
			                        "usage_end_date": {
			                            "gte": startdate,
			                            "lte": enddate,
			                            "format": "yyyy-MM-dd"
			                        }
			                    }
			                }
			            ]
			        }
			    },
			    "aggs":{
		       		"availability_zone":{
			           "terms":{
			               "field":"availability_zone",
			               "order":{"total_blended_cost":"desc"} 

			           },
           				"aggs":{
		               		"total_blended_cost":{
		                   		"sum":{
		                       		"field":"blended_cost"
		                   		}
		                	}
		          		 }
		       		}
		   		}
				    
			  }
			});
}

exports.getRegions = getRegions;
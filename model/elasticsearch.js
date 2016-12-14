var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({  
    host: 'http://172.20.38.132:9200/',
    log: 'info'
});

//var indexName = "randomindex";

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
                "invoice_id":{  "type": "text" },
                "payer_account_id":{ "type": "text" },
                "linked_account_id":{ "type": "text" },
                "record_type": { "type": "text" },
                "record_id": { "type": "text" },
                "product_name": { "type": "text" },
                "rate_id": {  "type": "integer" },
                "subscription_id": { "type": "integer" },
                "pricing_plan_id": { "type": "integer" },
                "usage_type": { "type": "text" },
                "operation": {  "type": "text" },
                "availability_zone": {  "type": "keyword"},
                "reserved_instance": { "type": "text" },
                "item_description": { "type": "text" },
                "usage_start_date": { "type": "date", "format": "yyy-MM-dd HH:mm:ss" },
                "usage_end_date": { "type": "date","format": "yyy-MM-dd HH:mm:ss" },
                "usage_quantity": { "type": "double" },
                "blended_rate": { "type": "double" },
                "blended_cost": { "type": "double" },
                "un_blended_rate": { "type": "double" },
                "un_blended_cost": { "type": "double" },
                "resource_id": { "type": "text" }
            }
        }
    });
}
exports.initMapping = initMapping;

function addDocument(indexName, typeName, document) {
    if(document['AvailabilityZone']){
        return elasticClient.index({
            index: indexName,
            type: typeName,
            body: {
                "invoice_id": document['InvoiceID'],
                "payer_account_id": document['PayerAccountId'],
                "linked_account_id": document['LinkedAccountId'],
                "record_type": document['RecordType'],
                "record_id": document['RecordId'],
                "product_name": document['ProductName'],
                "rate_id": document['RateId'],
                "subscription_id": document['SubscriptionId'],
                "pricing_plan_id": document['PricingPlanId'],
                "usage_type": document['UsageType'],
                "operation": document['Operation'],
                "availability_zone": document['AvailabilityZone'],
                "reserved_instance": document['ReservedInstance'],
                "item_description": document['ItemDescription'],
                "usage_start_date": document['UsageStartDate'],
                "usage_end_date": document['UsageEndDate'],
                "usage_quantity": document['UsageQuantity'],
                "blended_rate": document['BlendedRate'],
                "blended_cost": document['BlendedCost'],
                "un_blended_rate": document['UnBlendedRate'],
                "un_blended_cost":document['UnBlendedCost'],
                "resource_id": document['ResourceId']
            }
        });
    }  
    
}
exports.addDocument = addDocument;
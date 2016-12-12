var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({  
    host: 'http://172.20.36.122:9200/',
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
                InvoiceID: { type: "integer" },
                PayerAccountId: { type: "integer" },
                LinkedAccountId: { type: "integer" },
                RecordType: { type: "text" },
                RecordId: { type: "long" },
                ProductName: { type: "text" },
                RateId: { type: "integer" },
                SubscriptionId: { type: "integer" },
                PricingPlanId: { type: "integer" },
                UsageType: { type: "text" },
                Operation: { type: "text" },
                AvailabilityZone: { type: "text" },
                ReservedInstance: { type: "text" },
                ItemDescription: { type: "text" },
                UsageStartDate: { type: "date" },
                UsageEndDate: { type: "date" },
                UsageQuantity: { type: "double" },
                BlendedRate: { type: "double" },
                BlendedCost: { type: "double" },
                UnBlendedRate: { type: "double" },
                UnBlendedCost: {type: "text"},
                ResourceId: { type: "text" }
            }
        }
    });
}
exports.initMapping = initMapping;

function addDocument(indexName, typeName, document) {  
    return elasticClient.index({
        index: indexName,
        type: typeName,
        body: {
            "InvoiceID": data['InvoiceID'],
            "PayerAccountId": data['PayerAccountId'],
            "LinkedAccountId": data['LinkedAccountId'],
            "RecordType": data['RecordType'],
            "RecordId": data['RecordId'],
            "ProductName": data['ProductName'],
            "RateId": data['RateId'],
            "SubscriptionId": data['SubscriptionId'],
            "PricingPlanId": data['PricingPlanId'],
            "UsageType": data['UsageType'],
            "Operation": data['Operation'],
            "AvailabilityZone": data['AvailabilityZone'],
            "ReservedInstance": data['ReservedInstance'],
            "ItemDescription": data['ItemDescription'],
            "UsageStartDate": data['UsageStartDate'],
            "UsageEndDate": data['UsageEndDate'],
            "UsageQuantity": data['UsageQuantity'],
            "BlendedRate": data['BlendedRate'],
            "BlendedCost": data['BlendedCost'],
            "UnBlendedRate": data['UnBlendedRate'],
            "UnBlendedCost":data['UnBlendedCost'],
            "ResourceId": data['ResourceId']
        }
    });
}
exports.addDocument = addDocument;
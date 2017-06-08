var elasticsearch = require('elasticsearch');
var elasticClient;

/**
 * Setup host for elastic search
 * @param {*} esHost 
 */
function setClientHost(esHost) {
    elasticClient = new elasticsearch.Client({
        host: esHost
    });

}
exports.setClientHost = setClientHost;

/**
 * Create Index in elastic search
 * @param {*} indexName 
 */
function createIndex(indexName) {
    return elasticClient.indices.create({
        index: indexName,
    });
}
exports.createIndex = createIndex;

/**
 * Create Mapping for elastic search
 * @param {*} indexName 
 * @param {*} doctype 
 */
function createMapping(indexName, doctype) {
    return elasticClient.indices.putMapping({
        index: indexName,
        type: doctype,
        body: {
            "properties": {
                "ProductName": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "AvailabilityZone": {
                    "type": "string",
                    "index": "not_analyzed"
                },
                "UsageStartDate": {
                    "type": "date",
                    "format": "yyyy-MM-dd HH:mm:ss"
                },
                "UsageEndDate": {
                    "type": "date",
                    "format": "yyyy-MM-dd HH:mm:ss"
                },
                "BlendedCost": {
                    "type": "double"
                },
                "UsageQuantity": {
                    "type": "double"
                },
                "__CreatedDate": {
                    "type": "date",
                    "format": "yyyy-MM-dd HH:mm:ss"
                },
                "__AvailabilityRegion": {
                    "type": "string",
                    "index": "not_analyzed"
                }
            }
        }
    })
}
exports.createMapping = createMapping;
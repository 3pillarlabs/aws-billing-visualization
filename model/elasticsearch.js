var elasticsearch = require('elasticsearch');
var fs = require('fs');
var nconf = require('nconf');

// Setup nconf to use (in-order): 
//   1. Command-line arguments 
//   2. Environment variables 
//   3. A file located at 'path/to/config.json' 
nconf.argv().env().file({ file: '../config/config.json' });
var env = nconf.get('NODE_ENV') || "development";

//console.log(nconf.get(env).elasticsearch.host);

var elasticClient = new elasticsearch.Client({
    host: "http://atg.3pillarglobal.com/es/"
});

function getConfig() {
    console.log(env);
    console.log(nconf.get(env));
    return nconf.get(env);
}
exports.getConfig = getConfig;

/**
 * Create an index
 * @param: @string indexName
 * @returns: @object
 */
function initIndex(indexName) {
    console.log("index : " + indexName);
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;

/**
 * Delete an index
 * @param: @string indexName
 * @returns: @object
 */
function deleteIndex(indexName) {
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;

/**
 * Checks an index exist or not
 * @param: @string indexName
 * @returns: @boolean
 */
function isIndexExists(indexName) {
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.isIndexExists = isIndexExists;

/**
 * Set the mapping of index type 
 * @param: @string indexName
 * @param: @string typeName
 * @returns: @object
 */
/*function setMapping(indexName, typeName) {
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
                product_name: { type: "keyword" },
                rate_id: { type: "integer" },
                subscription_id: { type: "integer" },
                pricing_plan_id: { type: "integer" },
                usage_type: { type: "text" },
                operation: { type: "text" },
                AvailabilityZone: { type: "keyword" },
                AvailabilityZone: { type: "keyword" },
                reserved_instance: { type: "text" },
                item_description: { type: "text" },
                UsageStartDate: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                UsageEndDate: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                usage_quantity: { type: "double" },
                blended_rate: { type: "double" },
                BlendedCost: { type: "double" },
                un_blended_rate: { type: "double" },
                un_BlendedCost: { type: "double" },
                resource_id: { type: "text" }
            }
        }
    });
}
exports.setMapping = setMapping;*/

/**
 * Get the mapping of index type 
 * @param: @string indexName
 * @param: @string typeName
 * @returns: @object
 */
/*function getMapping(indexName, typeName) {
    return elasticClient.indices.getMapping({
        index: indexName,
        type: typeName
    });
}
exports.getMapping = getMapping;*/

/**
 * Add document in index 
 * @param: @string indexName
 * @param: @string typeName
 * @param: @object data
 * @param: @number pid
 * @returns: @object
 */
/*function addDocument(indexName, typeName, data, pid) {
    let AvailabilityZone_val = data['AvailabilityZone'].replace(/[a-z]$/, '');
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
            "AvailabilityZone": data['AvailabilityZone'],
            "AvailabilityZone": AvailabilityZone_val,
            "reserved_instance": data['ReservedInstance'],
            "item_description": data['ItemDescription'],
            "UsageStartDate": data['UsageStartDate'],
            "UsageEndDate": data['UsageEndDate'],
            "usage_quantity": data['UsageQuantity'],
            "blended_rate": data['BlendedRate'],
            "BlendedCost": data['BlendedCost'],
            "un_blended_rate": data['UnBlendedRate'],
            "un_BlendedCost": data['UnBlendedCost'],
            "resource_id": data['ResourceId']
        }
    });
}
exports.addDocument = addDocument;*/

/**
 * Calculate resource cost aggregated on regions within a date range filter
 * @param: @Object data - contains index, start date, end date
 * @return: @Object
 */
function getRegionsBillingCost(data) {
    var startDate = data.strdate;
    var endDate = data.enddate;
    var indexName = data.company;

    var query = {
        "query": {
            "bool": {
                "must": [
                    {
                        "range": {
                            "UsageStartDate": {
                                "gte": startDate,
                                "format": "yyyy-MM-dd"
                            }
                        }
                    },
                    {
                        "range": {
                            "UsageEndDate": {
                                "lte": endDate,
                                "format": "yyyy-MM-dd"
                            }
                        }
                    },
                    {
                        "range": {
                            "BlendedCost": {
                                "gte": 0
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "AvailabilityZone": {
                "terms": {
                    "field": "AvailabilityZone",
                    "order": { "TotalBlendedCost": "desc" }
                },
                "aggs": {
                    "TotalBlendedCost": {
                        "sum": {
                            "field": "BlendedCost"
                        }
                    }
                }
            }
        }
    };


    return elasticClient.search({
        index: indexName,
        size: 0,
        body: query
    });
}

exports.getRegionsBillingCost = getRegionsBillingCost;

/**
 * Get resources data within a date range filter
 * @param: @Object data contains index, start date, end date, filter, region etc
 * @return: @Object
 */
function getResourcesData(data) {
    var indexName = data.company;
    var startdate = data.strdate;
    var enddate = data.enddate;
    var from = 0;
    var size = 10;
    var filter = {};
    var regionfilter = {};
    var sorting_order = data.shortingorder;
    var sorting_field = data.sortingfield;

    if (data.size) {
        size = data.size;
    }

    if (data.currentpage) {
        from = ((data.currentpage - 1) * size);
    }

    if (data.filter) {
        filter = {
            "multi_match": {
                "query": data.filter,
                "fields": ["Operation", "ProductName","AvailabilityZone","UsageType"],
                "type": "phrase_prefix"
            }
        };
    }

    if (data.region != "") {
        regionfilter = { "match": { "AvailabilityZone": data.region } };
    }
    var sort = {};
    sort[sorting_field] = { "order": sorting_order };

    var query = {
        "from": from,
        "size": size,
        "sort": [sort],
        "query": {
            "bool": {
                "must": [
                    {
                        "range": {
                            "UsageStartDate": {
                                "gte": startdate,
                                "format": "yyyy-MM-dd"
                            }
                        }
                    },
                    {
                        "range": {
                            "UsageEndDate": {
                                "lte": enddate,
                                "format": "yyyy-MM-dd"
                            }
                        }
                    },
                    {
                        "range": {
                            "BlendedCost": {
                                "gte": 0
                            }
                        }
                    },
                    filter,
                    regionfilter

                ]

            }
        },
        "_source": [
            "ProductName",
            "UsageType",
            "AvailabilityZone",
            "ItemDescription",
            "UsageStartDate",
            "UsageEndDate",
            "UsageQuantity",
            "BlendedRate",
            "BlendedCost",
            "Operation"
        ]
    };

    console.log('-------------' + JSON.stringify(query));
    return elasticClient.search({
        index: indexName,
        body: query
    })

}
exports.getResourcesData = getResourcesData;

/**
 * Calculate resource cost aggregated on products within a date range filter
 * @param: @Object data contains index, start date, end date, filter, region etc
 * @return: @Object 
 */
function getProductWiseData(postdata) {
    var data = postdata;
    var startdate = data.strdate;
    var enddate = data.enddate;
    var indexval = data.company;
    var regionfilter = {};

    if (data.region != "") {
        regionfilter = { "match": { "AvailabilityZone": data.region } };
    }

    var query={
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "UsageStartDate": {
                                    "gte": startdate,
                                    "format": "yyyy-MM-dd"
                                }
                            }
                        },
                        {
                            "range": {
                                "UsageEndDate": {
                                    "lte": enddate,
                                    "format": "yyyy-MM-dd"
                                }
                            }
                        },
                        {
                            "range": {
                                "BlendedCost": {
                                    "gt": 0
                                }
                            }
                        },
                        regionfilter
                    ]
                }
            },
            "aggs": {
                "product_name": {
                    "terms": {
                        "field": "ProductName",
                        "order": { "TotalBlendedCost": "desc" }

                    },
                    "aggs": {
                        "TotalBlendedCost": {
                            "sum": {
                                "field": "BlendedCost"
                            }
                        }
                    }
                }
            }

        };

    return elasticClient.search({
        index: indexval,
        size: 0,
        body: query
    });
}
exports.getProductWiseData = getProductWiseData;


function getMinMaxDate(indexval) {
    return elasticClient.search({
        index: indexval,
        size: 0,
        body: {
            "aggs": {
                "max_date": { "max": { "field": "UsageEndDate", "format": "YYYY-MM-dd" } },
                "min_date": { "min": { "field": "UsageStartDate", "format": "YYYY-MM-dd" } },
                "last_created": { "max": { "field": "__createDate" } }
            }

        }
    });
}

exports.getMinMaxDate = getMinMaxDate;
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
    host: "http://172.20.38.132:9200/"
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
function setMapping(indexName, typeName) {
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
                availability_zone: { type: "keyword" },
                availability_region: { type: "keyword" },
                reserved_instance: { type: "text" },
                item_description: { type: "text" },
                usage_start_date: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                usage_end_date: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                usage_quantity: { type: "double" },
                blended_rate: { type: "double" },
                blended_cost: { type: "double" },
                un_blended_rate: { type: "double" },
                un_blended_cost: { type: "double" },
                resource_id: { type: "text" }
            }
        }
    });
}
exports.setMapping = setMapping;

/**
 * Get the mapping of index type 
 * @param: @string indexName
 * @param: @string typeName
 * @returns: @object
 */
function getMapping(indexName, typeName) {
    return elasticClient.indices.getMapping({
        index: indexName,
        type: typeName
    });
}
exports.getMapping = getMapping;

/**
 * Add document in index 
 * @param: @string indexName
 * @param: @string typeName
 * @param: @object data
 * @param: @number pid
 * @returns: @object
 */
function addDocument(indexName, typeName, data, pid) {
    let availability_region_val = data['AvailabilityZone'].replace(/[a-z]$/, '');
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
            "availability_region": availability_region_val,
            "reserved_instance": data['ReservedInstance'],
            "item_description": data['ItemDescription'],
            "usage_start_date": data['UsageStartDate'],
            "usage_end_date": data['UsageEndDate'],
            "usage_quantity": data['UsageQuantity'],
            "blended_rate": data['BlendedRate'],
            "blended_cost": data['BlendedCost'],
            "un_blended_rate": data['UnBlendedRate'],
            "un_blended_cost": data['UnBlendedCost'],
            "resource_id": data['ResourceId']
        }
    });
}
exports.addDocument = addDocument;

/**
 * Calculate resource cost aggregated on regions within a date range filter
 * @param: @Object data - contains index, start date, end date
 * @return: @Object
 */
function getRegionsBillingCost(data) {
    var startDate = data.strdate;
    var endDate = data.enddate;
    var indexName = data.company;

    return elasticClient.search({
        index: indexName,
        size: 0,
        body: {
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "usage_start_date": {
                                    "gte": startDate,
                                    "format": "yyyy-MM-dd"
                                }
                            }
                        },
                        {
                            "range": {
                                "usage_end_date": {
                                    "lte": endDate,
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
                        }
                    ]
                }
            },
            "aggs": {
                "availability_zone": {
                    "terms": {
                        "field": "availability_region",
                        "order": { "total_blended_cost": "desc" }
                    },
                    "aggs": {
                        "total_blended_cost": {
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
    var sorting_order=data.shortingorder;
    var sorting_field=data.sortingfield;

    if (data.size) {
        size = data.size;
    }

    if (data.currentpage) {
        from = ((data.currentpage - 1) * size);
    }

    if (data.filter) {
        filter = { "match_phrase_prefix": { "operation": data.filter } };
    }

    if (data.region != "") {
        regionfilter = { "match": { "availability_region": data.region } };
    }
    var sort={};
    sort[sorting_field]={ "order" : sorting_order };
    return elasticClient.search({
        index: indexName,
        body: {
            "from": from,
            "size": size,
            "sort" : [  sort ],
            "query": {
                "bool": {
                    "must": [
                        {
                            "range": {
                                "usage_start_date": {
                                    "gte": startdate,
                                    "format": "yyyy-MM-dd"
                                }
                            }
                        },
                        {
                            "range": {
                                "usage_end_date": {
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
                        filter,
                        regionfilter

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
                "availability_region",
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
        regionfilter = { "match": { "availability_region": data.region } };
    }

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
                                    "format": "yyyy-MM-dd"
                                }
                            }
                        },
                        {
                            "range": {
                                "usage_end_date": {
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
                        regionfilter
                    ]
                }
            },
            "aggs": {
                "product_name": {
                    "terms": {
                        "field": "product_name",
                        "order": { "total_blended_cost": "desc" }

                    },
                    "aggs": {
                        "total_blended_cost": {
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
exports.getProductWiseData = getProductWiseData;


function getMinMaxDate(indexval) {
    return elasticClient.search({
        index: indexval,
        size: 0,
        body: {
            "aggs": {
                "max_date": { "max": { "field": "usage_end_date","format": "YYYY-MM-dd" } },
                "min_date": { "min": { "field": "usage_start_date","format": "YYYY-MM-dd" } },
                "last_created": { "max": { "field": "__createDate" } }
            }

        }
    });
}

exports.getMinMaxDate = getMinMaxDate;
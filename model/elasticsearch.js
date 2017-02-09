var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
    host: "http://atg.3pillarglobal.com/es/"
    //host:"http://172.20.38.132:9200/"
});

/**
 * Create an index
 * @param: @string indexName
 * @returns: @object
 */
/*function initIndex(indexName) {
    return elasticClient.indices.create({
        index: indexName
    });
}
exports.initIndex = initIndex;*/

/**
 * Delete an index
 * @param: @string indexName
 * @returns: @object
 */
/*function deleteIndex(indexName) {
    return elasticClient.indices.delete({
        index: indexName
    });
}
exports.deleteIndex = deleteIndex;*/

/**
 * Checks an index exist or not
 * @param: @string indexName
 * @returns: @boolean
 */
/*function isIndexExists(indexName) {
    return elasticClient.indices.exists({
        index: indexName
    });
}
exports.isIndexExists = isIndexExists;*/

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
                InvoiceID: { type: "string" },
                PayerAccountId: { type: "string" },
                LinkedAccountId: { type: "string" },
                RecordType: { type: "string" },
                RecordId: { type: "string" },
                ProductName: { type: "string", "index": "not_analyzed" },
                RateId: { type: "integer" },
                SubscriptionId: { type: "integer" },
                PricingPlanId: { type: "integer" },
                UsageType: { type: "string" },
                Operation: { type: "string" },
                AvailabilityZone: { type: "string", "index": "not_analyzed" },                
                ReservedInstance: { type: "string" },
                ItemDescription: { type: "string" },
                UsageStartDate: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                UsageEndDate: { type: "date", "format": "yyy-MM-dd HH:mm:ss" },
                UsageQuantity: { type: "double" },
                BlendedRate: { type: "double" },
                BlendedCost: { type: "double" },
                UnBlendedRate: { type: "double" },
                UnBlendedCost: { type: "double" },
                ResourceId: { type: "string" },
                __AvailabilityRegion: { type: "string", "index": "not_analyzed" },
                __CreatedDate: { type: "date", "format": "yyy-MM-dd HH:mm:ss" }
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
/*function addDocument(indexName, typeName, data, pid, updatedDate) {
    let availabilityRegion = data['AvailabilityZone'].replace(/[a-z]$/, '');
    return elasticClient.index({
        index: indexName,
        id: pid,
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
            "UnBlendedCost": data['UnBlendedCost'],
            "ResourceId": data['ResourceId'],
            "__AvailabilityRegion": availabilityRegion,
            __CreatedDate: updatedDate
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
                                "gt": 0
                            }
                        }
                    }
                ]
            }
        },
        "aggs": {
            "AvailabilityRegion": {
                "terms": {
                    "field": "__AvailabilityRegion",
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
                "fields": ["Operation", "ProductName", "__AvailabilityRegion", "UsageType"],
                "type": "phrase_prefix"
            }
        };
    }

    if (data.region != "") {
        regionfilter = { "match": { "__AvailabilityRegion": data.region } };
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
            "ProductName",
            "UsageType",
            "__AvailabilityRegion",
            "ItemDescription",
            "UsageStartDate",
            "UsageEndDate",
            "UsageQuantity",
            "BlendedRate",
            "BlendedCost",
            "Operation"
        ]
    };


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
        regionfilter = { "match": { "__AvailabilityRegion": data.region } };
    }

    var query = {
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
                "last_created": { "max": { "field": "__CreatedDate" } }
            }

        }
    });
}

exports.getMinMaxDate = getMinMaxDate;


function getGroupServicedata(data) {

    console.log(data);
    var indexName = data.company;
    var startdate = data.strdate;
    var enddate = data.enddate;
    var filter = {};
    var regionfilter = {};
    var tablefilter = {};
    var aggs = {};

    /* Condition for aggregation start here */
        if (data.product == "" && data.region == "" && data.detailreport == "" ) {

            aggs = {
                "AvailabilityRegion": {
                    "terms": {
                        "field": "__AvailabilityRegion",
                        "order": { "TotalBlendedCost": "desc" }
                    },
                    "aggs": {
                        "TotalBlendedCost": {
                            "sum": {
                                "field": "BlendedCost"
                            }
                        }
                    }
                },
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
            };
        } else if (data.product != "" && data.region == ""  && data.detailreport == "") {
            aggs = {
                "AvailabilityRegion": {
                    "terms": {
                        "field": "__AvailabilityRegion",
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
            };
        }

    if (data.product != '') {
        filter = { "match": { "ProductName": data.product } };
        if (data.region != '') {
            filter = {
                "match": {
                    "ProductName": data.product
                }
            }, { "match": { "__AvailabilityRegion": data.region } };
        }
    }

    if (data.product != '' && data.region != '') {
        regionfilter = { "match": { "__AvailabilityRegion": data.region } };
    }

    var from = 0;
    var size = 10;
    var sort = {};
    var sorting_order = "asc";
    var sorting_field = "ProductName";
    if (data.detailreport != '') {

        from = data.detailreport.start;
        size = data.detailreport.limit;

        sorting_order = data.detailreport.shortorder;
        sorting_field = data.detailreport.shortfield;
        sort[sorting_field] = { "order": sorting_order };

        if (data.detailreport.filtervalue != '') {
            tablefilter = {
                "multi_match": {
                    "query": data.detailreport.filtervalue,
                    "fields": ["Operation", "ProductName", "__AvailabilityRegion", "UsageType"],
                    "type": "phrase_prefix"
                }
            };
        }

    }

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
                                "gt": 0
                            }
                        }
                    },
                    filter,
                    regionfilter,
                    tablefilter

                ]

            }
        },
        "aggs": aggs,
        "_source": [
            "ProductName",
            "UsageType",
            "__AvailabilityRegion",
            "ItemDescription",
            "UsageStartDate",
            "UsageEndDate",
            "UsageQuantity",
            "BlendedRate",
            "BlendedCost",
            "Operation"
        ]
    };

    debugQuery(query)
    return elasticClient.search({
        index: indexName,
        body: query
    });
}

exports.getGroupServicedata = getGroupServicedata;


function debugQuery(query) {
    console.log('--------------------Query Log-------------------------------');
    console.log(JSON.stringify(query));
}
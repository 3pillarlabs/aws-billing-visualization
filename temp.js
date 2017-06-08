'use strict';
var elasticsearch = require("elasticsearch");
var elasticClient = new elasticsearch.Client({
    host: "http://atg.3pillarglobal.com/es/"
});
var agglimit = 10; //Default limit set for aggregation
exports.handler = (event, context, callback) => {
    var indexName = data.company;
    var startdate = data.strdate + ' 00:00:00';
    var enddate = data.enddate + ' 23:59:59';
    var from = 0;
    var size = 10;
    var filter = {};
    var regionfilter = {};
    var productfilter = {};
    var sorting_order = data.shortingorder;
    var sorting_field = data.sortingfield;

    if (data.size) {
        size = data.size;
    }

    if (data.currentpage) {
        from = ((data.currentpage - 1) * size);
    }

    if (data.filter != "") {
        filter = {
            "multi_match": {
                "query": data.filter,
                "fields": ["ResourceId", "aws:*", "user:*"],
                "type": "phrase_prefix"
            }
        };
    }

    if (data.region != "") {
        regionfilter = { "match": { "__AvailabilityRegion": data.region } };
    }

    if (data.product != "") {
        productfilter = { "match": { "ProductName": data.product } };
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
                                "format": "yyyy-MM-dd HH:mm:ss"
                            }
                        }
                    },
                    {
                        "range": {
                            "UsageEndDate": {
                                "lte": enddate,
                                "format": "yyyy-MM-dd HH:mm:ss"
                            }
                        }
                    },
                    filter,
                    productfilter,
                    regionfilter

                ]

            }

        },
        "aggs": {
            "total_cost": {
                "sum": {
                    "field": "BlendedCost"
                }
            },
            "total_quantity": {
                "sum": {
                    "field": "UsageQuantity"
                }
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
            "Operation",
            "aws:*",
            "user:*",
            "ResourceId"
        ]
    };

    //debugQuery(query);

    var res= elasticClient.search({
        index: indexName,
        body: query
    })

    res.then(data => {
        callback(null, data);
    }, error => {
        callback(error, null);
    });
};
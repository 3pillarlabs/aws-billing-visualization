var elasticsearch = require('elasticsearch');

var elasticClient = new elasticsearch.Client({
  host: "http://atg.3pillarglobal.com/es/"
  //host: "http://172.20.38.132:9200/"
});

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
 * Get All indexes
 */
function getAllIndexes() {
  return elasticClient.indices.stats({
    index: "_all",
    level: "indices"
  });
}
exports.getAllIndexes = getAllIndexes;


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
  var agglimit = 10;
  return elasticClient.search({
    index: indexval,
    size: 0,
    body: {
      "aggs": {
        "max_date": { "max": { "field": "UsageEndDate", "format": "YYYY-MM-dd" } },
        "min_date": { "min": { "field": "UsageStartDate", "format": "YYYY-MM-dd" } },
        "last_created": { "max": { "field": "__CreatedDate" } },
        "availability_regions": {
          "terms": {
            "field": "__AvailabilityRegion",
            "order": {
              "TotalBlendedCost": "desc"
            },
            "size": agglimit
          },
          "aggs": {
            "TotalBlendedCost": {
              "sum": {
                "field": "BlendedCost"
              }
            }
          }
        },
        "product_names": {
          "terms": {
            "field": "ProductName",
            "order": {
              "TotalBlendedCost": "desc"
            },
            "size": agglimit
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

    }
  });
}

exports.getMinMaxDate = getMinMaxDate;

//TODO:Use moment js
function getGroupServicedata(data) {
  var agglimit = 10;
  var indexName = data.company;
  var startdate = data.strdate + ' 00:00:00';
  var enddate = data.enddate + ' 23:59:59';
  var filter = {};
  var regionfilter = {};
  var tablefilter = {};
  var aggs = {
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
  };

  /* Condition for aggregation start here */
  if (data.product == "" && data.region == "" && data.detailreport == "") {
    aggs = {
      "AvailabilityRegion": {
        "terms": {
          "field": "__AvailabilityRegion",
          "order": { "TotalBlendedCost": "desc" },
          "size": agglimit
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
          "order": { "TotalBlendedCost": "desc" },
          "size": agglimit
        },
        "aggs": {
          "TotalBlendedCost": {
            "sum": {
              "field": "BlendedCost"
            }
          }
        }
      },
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
    };
  } else if (data.product != "" && data.region == "" && data.detailreport == "") {
    aggs = {
      "AvailabilityRegion": {
        "terms": {
          "field": "__AvailabilityRegion",
          "order": { "TotalBlendedCost": "desc" },
          "size": agglimit
        },
        "aggs": {
          "TotalBlendedCost": {
            "sum": {
              "field": "BlendedCost"
            }
          }
        }
      },
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
    };
  }

  if (data.product != '') {
    filter = { "match": { "ProductName": data.product } };
  }

  if (data.region != '') {
    regionfilter = { "match": { "__AvailabilityRegion": data.region } };
  }

  var from = 0;
  var size = 10;
  var sort = {};
  var sorting_order = "asc";
  var sorting_field = "ProductName";

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
          regionfilter
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
      "Operation",
      "aws:*",
      "user:*",
      "ResourceId"
    ]
  };
  //debugQuery(query);
  return elasticClient.search({
    index: indexName,
    body: query
  });
}

exports.getGroupServicedata = getGroupServicedata;

function isElasticConnected() {
  return elasticClient.ping({
    // ping usually has a 3000ms timeout
    requestTimeout: Infinity,
    // undocumented params are appended to the query string
    hello: "elasticsearch!"
  })
}
exports.isElasticConnected = isElasticConnected;

function debugQuery(query) {
  console.log('--------------------Query Log-------------------------------');
  console.log(JSON.stringify(query));
}

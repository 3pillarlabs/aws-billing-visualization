"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var http_1 = require("@angular/http");
var awsdata_service_1 = require("./../../services/awsdata.service");
var config_service_1 = require("./../../services/config.service");
var DatatableComponent = (function () {
    function DatatableComponent(http, _awsdata, _config) {
        this.http = http;
        this._awsdata = _awsdata;
        this._config = _config;
        this.detailReportChange = new core_1.EventEmitter();
        this.isloading = new core_1.EventEmitter();
        this.data = [];
        this.filterQuery = "";
        this.rowsOnPage = 10;
        this.sortBy = "blandedcost";
        this.sortOrder = "asc";
        this.currentPage = 1;
        this.totalItems = 0; // total numbar of page not items 
        this.maxSize = 10; // max page size 
        this.filter = '';
        this.appdataloaded = false;
        this.totalBlendedCost = 0;
        this.showingfrom = this.currentPage;
        this.dataTableLenth = [10, 25, 50, 100];
        this.product = '';
        this.region = '';
        this.alltags = '';
        this.length = 10;
        this.columns = [
            {
                display: 'Product Name',
                variable: 'ProductName',
                sortable: true
            },
            {
                display: 'Availability Region',
                variable: '__AvailabilityRegion',
                sortable: true
            },
            {
                display: 'Operation',
                variable: 'Operation',
                sortable: false
            },
            {
                display: 'Tags',
                variable: 'user:*',
                sortable: false
            },
            {
                display: 'Resourse ID',
                variable: 'ResourceId',
                sortable: false
            },
            {
                display: 'Usage Description',
                variable: 'ItemDescription',
                sortable: false
            },
            {
                display: 'Usage Type',
                variable: 'UsageType',
                sortable: false
            },
            {
                display: 'Usage Quantity',
                variable: 'UsageQuantity',
                sortable: false
            },
            {
                display: 'Blended Rate',
                variable: 'BlendedRate',
                sortable: false
            },
            {
                display: 'Blended Cost',
                variable: 'BlendedCost',
                sortable: true
            },
            {
                display: 'Usage Duration',
                variable: 'UsageStartDate',
                sortable: false
            }
        ];
        this.sorting = {
            column: 'ProductName',
            descending: false
        };
        this.company = this._config.company;
        this.showingto = this.length;
    }
    DatatableComponent.prototype.ngOnChanges = function () {
        var data = this.appcomponentdata.allServiceData;
        if (data.aggregations && data.aggregations.product_name && data.aggregations.product_name.buckets.length > 0) {
            this.ProductList = data.aggregations.product_name.buckets;
        }
        if (data.aggregations && data.aggregations.AvailabilityRegion && data.aggregations.AvailabilityRegion.buckets.length > 0) {
            this.regionList = data.aggregations.AvailabilityRegion.buckets;
        }
        if (this.appcomponentdata.allServiceData) {
            this.setupInfo();
            this.parseDetailData(this.appcomponentdata.allServiceData);
        }
    };
    DatatableComponent.prototype.setupInfo = function () {
        this.currentPage = this.appcomponentdata.inputdata.detaildata.start;
        this.length = this.appcomponentdata.inputdata.detaildata.limit;
        this.product = this.appcomponentdata.inputdata.product;
        this.region = this.appcomponentdata.inputdata.region;
        this.startdate = this.appcomponentdata.startdate;
        this.enddate = this.appcomponentdata.enddate;
        this.filter = "";
        this.pageInfo();
    };
    DatatableComponent.prototype.parseDetailData = function (data) {
        var jsondata = [];
        if (data.aggregations) {
            if (data.aggregations.total_cost) {
                this.totalBlendedCost = data.aggregations.total_cost.value;
            }
            if (data.aggregations.total_quantity) {
                this.totalQuantity = data.aggregations.total_quantity.value;
            }
        }
        if (data.hits.total) {
            this.totalItems = data.hits.total;
        }
        for (var _i = 0, _a = data.hits.hits; _i < _a.length; _i++) {
            var hit = _a[_i];
            jsondata.push(hit._source);
        }
        this.data = jsondata;
        this.pageInfo();
    };
    DatatableComponent.prototype.filterbyOperation = function (val) {
        this.filter = val;
        this.getResourceData();
        //this.callDetailReportFilter();
    };
    DatatableComponent.prototype.tags = function (item) {
        var obj = item;
        var tagsarr = [];
        var alltags = '';
        var awscreatedtag = '';
        for (var key in obj) {
            if (key.startsWith('user:') || key.startsWith('aws:')) {
                if (obj[key] != "") {
                    var tag = {
                        'key': key,
                        'val': obj[key]
                    };
                    tagsarr.push(tag);
                }
            }
        }
        return tagsarr;
    };
    DatatableComponent.prototype.setPage = function (pageNo) {
        this.currentPage = pageNo;
    };
    ;
    DatatableComponent.prototype.pageChanged = function (event) {
        this.getResourceData();
        //this.callDetailReportFilter();
    };
    ;
    DatatableComponent.prototype.pageInfo = function () {
        this.showingfrom = ((this.currentPage - 1) * this.length) + 1;
        var calshowingTo = this.currentPage * this.length;
        this.showingto = calshowingTo > this.totalItems ? this.totalItems : calshowingTo;
    };
    DatatableComponent.prototype.selectedClass = function (columnName) {
        return columnName == this.sorting.column ? 'sort-' + this.sorting.descending : 'false';
    };
    DatatableComponent.prototype.changeSorting = function (columnName) {
        var sort = this.sorting;
        if (sort.column == columnName) {
            sort.descending = !sort.descending;
        }
        else {
            sort.column = columnName;
            sort.descending = false;
        }
        this.currentPage = 1;
        this.getResourceData();
        //this.callDetailReportFilter();
    };
    DatatableComponent.prototype.getResourceData = function () {
        var _this = this;
        this.isloading.emit(true);
        var shortingorder = 'asc';
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }
        var awsdata = {
            "company": this.company,
            "strdate": this.startdate,
            "enddate": this.enddate,
            "size": this.length,
            "currentpage": this.currentPage,
            "filter": this.filter,
            "product": this.product,
            "sortingfield": this.sorting.column,
            "shortingorder": shortingorder,
            "region": this.region
        };
        this._awsdata.getAllAwsResource(awsdata).subscribe(function (data) {
            _this.parseDetailData(data);
            _this.isloading.emit(false);
            _this.pageInfo();
        }, function (error) {
            console.log(error);
            _this.isloading.emit(false);
        });
    };
    DatatableComponent.prototype.onChangeProduct = function (product) {
        this.currentPage = 1;
        this.product = product;
        this.getResourceData();
        //this.callDetailReportFilter();
    };
    DatatableComponent.prototype.onChangeRegion = function (region) {
        this.currentPage = 1;
        this.region = region;
        this.getResourceData();
        //this.callDetailReportFilter();
    };
    DatatableComponent.prototype.onClearFilter = function () {
        this.currentPage = 1;
        this.filter = '';
        this.getResourceData();
        //this.callDetailReportFilter();
    };
    DatatableComponent.prototype.clearFilter = function () {
        this.product = '';
        this.region = '';
        this.filter = '';
        //this.callDetailReportFilter();
        this.getResourceData();
    };
    DatatableComponent.prototype.callDetailReportFilter = function () {
        var shortingorder = 'asc';
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }
        var obj = {
            "company": this.company,
            "strdate": this.startdate,
            "enddate": this.enddate,
            "size": this.length,
            "currentpage": this.currentPage,
            "filter": this.filter,
            "product": this.product,
            "sortingfield": this.sorting.column,
            "shortingorder": shortingorder,
            "region": this.region
        };
        this.detailReportChange.emit(obj);
    };
    DatatableComponent.prototype.onDateSelect = function (stDate, endDate) {
        this.startdate = stDate.substr(0, 10);
        this.enddate = endDate.substr(0, 10);
        this.callDetailReportFilter();
    };
    DatatableComponent.prototype.onlengthChange = function (tablelen) {
        this.currentPage = 1;
        this.length = tablelen;
        this.clearFilter();
    };
    return DatatableComponent;
}());
DatatableComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'aws-billing-datatable',
        templateUrl: 'datatable.component.html',
        styleUrls: ['datatable.component.css'],
        outputs: ['detailReportChange', 'isloading'],
        inputs: ['appcomponentdata']
    }),
    __metadata("design:paramtypes", [http_1.Http, awsdata_service_1.AwsdataService, config_service_1.ConfigService])
], DatatableComponent);
exports.DatatableComponent = DatatableComponent;
//# sourceMappingURL=datatable.component.js.map
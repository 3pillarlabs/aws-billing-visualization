import { Component, EventEmitter, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';

@Component({
    moduleId: module.id,
    selector: 'aws-billing-datatable',
    templateUrl: 'datatable.component.html',
    styleUrls: ['datatable.component.css'],
    outputs: ['detailReportChange','isloading'],
    inputs: ['appcomponentdata']
})
export class DatatableComponent implements OnChanges {
    company: string;
    detailReportOption: any;
    startdate: string;
    enddate: string;

    appcomponentdata: any; //Data from App Component
    detailReportChange: EventEmitter<any> = new EventEmitter<string>();
    isloading:EventEmitter<boolean>=new EventEmitter<boolean>();
    public data: any[] = [];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "blandedcost";
    public sortOrder = "asc";

    public currentPage: number = 1;
    public totalItems: number = 0; // total numbar of page not items 
    public maxSize: number = 10; // max page size 
    filter: string = '';
    appdataloaded = false;
    totalBlendedCost: number = 0;
    totalQuantity: number;
    showingfrom = this.currentPage;
    showingto = this.rowsOnPage;
    dataTableLenth: any = [10, 25, 50, 100];
    product: string = '';
    region: string = '';
    alltags: string = '';
    regionList:any;
    ProductList:any;


    columns: any[] = [

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

    sorting: any = {
        column: 'ProductName', //to match the variable of one of the columns
        descending: false
    };

    constructor(private http: Http, private _awsdata: AwsdataService, private _config: ConfigService) {
        this.company = this._config.company;
    }

    ngOnChanges(): void {
        let data=this.appcomponentdata.allServiceData;
        if(data.aggregations && data.aggregations.product_name && data.aggregations.product_name.buckets.length > 0){
            this.ProductList=data.aggregations.product_name.buckets;
        }
        if(data.aggregations && data.aggregations.AvailabilityRegion && data.aggregations.AvailabilityRegion.buckets.length > 0){
            this.regionList=data.aggregations.AvailabilityRegion.buckets;
        }
        if (this.appcomponentdata.allServiceData) {
            this.setupInfo();
            this.parseDetailData(this.appcomponentdata.allServiceData);
        }
    }

    setupInfo(): void {
        this.currentPage = this.appcomponentdata.inputdata.detaildata.start;
        this.rowsOnPage = this.appcomponentdata.inputdata.detaildata.limit;
        this.product = this.appcomponentdata.inputdata.product;
        this.region = this.appcomponentdata.inputdata.region;
        this.startdate = this.appcomponentdata.startdate;
        this.enddate = this.appcomponentdata.enddate;
        this.filter = "";
        this.pageInfo();
    }

    parseDetailData(data: any): void {
     
        var jsondata: any = [];
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
        for (let hit of data.hits.hits) {
            jsondata.push(hit._source);
        }

        this.data = jsondata;
        this.pageInfo();
    }

    filterbyOperation(val: string) {
        this.filter = val;
        this.getResourceData();
        //this.callDetailReportFilter();
    }

    tags(item: any): any {
        var obj = item;
        var tagsarr = [];
        var alltags = '';
        var awscreatedtag = '';

        for (var key in obj) {
            if (key.startsWith('user:') || key.startsWith('aws:')) {
                if (obj[key] != "") {
                    let tag = {
                        'key': key,
                        'val': obj[key]
                    };
                    tagsarr.push(tag);
                }
            }
        }
        return tagsarr;
    }

    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
    };

    public pageChanged(event: any): void {
        this.getResourceData();
        //this.callDetailReportFilter();
    };

    pageInfo() {
        this.showingfrom = ((this.currentPage - 1) * this.rowsOnPage) + 1;
        var calshowingTo = this.currentPage * this.rowsOnPage;
        this.showingto = calshowingTo > this.totalItems ? this.totalItems : calshowingTo;
    }


    selectedClass(columnName): string {
        return columnName == this.sorting.column ? 'sort-' + this.sorting.descending : 'false';
    }

    changeSorting(columnName): void {
        var sort = this.sorting;
        if (sort.column == columnName) {
            sort.descending = !sort.descending;
        } else {
            sort.column = columnName;
            sort.descending = false;
        }

        this.currentPage = 1;
        this.getResourceData();
        //this.callDetailReportFilter();

    }

    getResourceData(): void {
        this.isloading.emit(true);
        var shortingorder = 'asc';
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }

        let awsdata = {
            "company": this.company,
            "strdate": this.startdate,
            "enddate": this.enddate,
            "size": this.rowsOnPage,
            "currentpage": this.currentPage,
            "filter": this.filter,
            "product": this.product,
            "sortingfield": this.sorting.column,
            "shortingorder": shortingorder,
            "region": this.region
        };
        this._awsdata.getAllAwsResource(awsdata).subscribe((data) => {
            this.parseDetailData(data);
            this.isloading.emit(false);
            this.pageInfo();
        }, (error) => {
            console.log(error);
            this.isloading.emit(false);
        })
    }

    onChangeProduct(product: string) {
        this.currentPage = 1;
        this.product = product;
        this.getResourceData();
        //this.callDetailReportFilter();
    }

    onChangeRegion(region: string) {
        this.currentPage = 1;
        this.region = region;
        this.getResourceData();
        //this.callDetailReportFilter();
    }

    onClearFilter(): void {
        this.currentPage = 1;
        this.filter = '';
        this.getResourceData();
        //this.callDetailReportFilter();
    }

    clearFilter(): void {
        this.product = '';
        this.region = '';
        this.filter = '';
        //this.callDetailReportFilter();
        this.getResourceData();
    }

    callDetailReportFilter() {
        var shortingorder = 'asc';
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }

        let obj = {
            "company": this.company,
            "strdate": this.startdate,
            "enddate": this.enddate,
            "size": this.rowsOnPage,
            "currentpage": this.currentPage,
            "filter": this.filter,
            "product": this.product,
            "sortingfield": this.sorting.column,
            "shortingorder": shortingorder,
            "region": this.region
        }

        this.detailReportChange.emit(obj);
    }

    onDateSelect(stDate: string, endDate: string) {
        this.startdate=stDate.substr(0,10);
        this.enddate=endDate.substr(0,10);
        this.callDetailReportFilter();
    }

}
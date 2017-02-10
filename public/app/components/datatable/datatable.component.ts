import { Component, EventEmitter, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';


@Component({
    moduleId: module.id,
    selector: 'aws-billing-datatable',
    templateUrl: 'datatable.component.html',
    styleUrls: ['datatable.component.css'],
    inputs: ['appcomponentdata', 'productsRegionsData'],
    outputs: ['isloading','selectedDetailReportOption']
})
export class DatatableComponent implements OnChanges {
    company: string;
    detailReportOption: any;

    isloading = new EventEmitter();
    selectedDetailReportOption= new EventEmitter();
    
    appcomponentdata:any; //Data from App Component
    productsRegionsData:any;

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
    showingfrom=this.currentPage;
    showingto=this.rowsOnPage;
    dataTableLenth:any=[10,25,50,100];


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
            sortable: false
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
        if (this.appcomponentdata.allServiceData) {
            this.parseDetailData(this.appcomponentdata.allServiceData);
        }
    }


    parseDetailData(data: any): void {
        var jsondata: any = [];
        if (data.aggregations) {
            if (data.aggregations.total_cost) {
                this.totalBlendedCost = data.aggregations.total_cost.value;
            }
        }


        if (data.hits.total) {
            this.totalItems = data.hits.total;
        }
        for (let hit of data.hits.hits) {
            jsondata.push(hit._source);
        }

        this.data = jsondata;
    }

    filterbyOperation(val: string) {
        this.filter = val
        let data = {
            "start": this.currentPage,
            "limit": this.rowsOnPage,
            "filterfield": '',
            "filtervalue": this.filter,
            "shortorder": this.sorting.descending,
            "shortfield": this.sorting.column
        }
        this.callEmitData(data);
    }



    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
    };

    public onLengthChange(length:number):void{
      this.rowsOnPage=length;
      let data = {
            "start": this.currentPage,
            "limit": this.rowsOnPage,
            "filterfield": '',
            "filtervalue": this.filter,
            "shortorder": this.sorting.descending,
            "shortfield": this.sorting.column
      }
      this.callEmitData(data);
    }

    public pageChanged(event: any): void {
        let data = {
            "start": this.currentPage,
            "limit": this.rowsOnPage,
            "filterfield": '',
            "filtervalue": this.filter,
            "shortorder": this.sorting.descending,
            "shortfield": this.sorting.column
        }

        this.showingfrom=((this.currentPage-1)*this.rowsOnPage)+1;
        var calshowingTo=this.currentPage*this.rowsOnPage;
        this.showingto=calshowingTo > this.totalItems ?  this.totalItems : calshowingTo;

        this.callEmitData(data);
    };


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
        
        let data = {
            "start": this.currentPage,
            "limit": this.rowsOnPage,
            "filterfield": '',
            "filtervalue": this.filter,
            "shortorder": this.sorting.descending,
            "shortfield": this.sorting.column
        }
        this.callEmitData(data);
        
    }

    callEmitData(data:any){
        var awsdata=data;
        var shortingorder = 'asc';
        awsdata.shortfield = this.sorting.column;
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }
        awsdata.shortorder = shortingorder;

        console.log(awsdata);
        this.selectedDetailReportOption.emit(awsdata);
    }

}
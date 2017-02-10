import { Component, EventEmitter, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';


@Component({
    moduleId: module.id,
    selector: 'aws-billing-datatable',
    templateUrl: 'datatable.component.html',
    styleUrls: ['datatable.component.css'],
    inputs: ['appcomponentdata'],
    outputs: ['isloading','selectedDetailReportOption']
})
export class DatatableComponent implements OnChanges {
    company: string;
    detailReportOption:any;

    isloading = new EventEmitter();
    selectedDetailReportOption= new EventEmitter();
    
    appcomponentdata:any; //Data from App Component

    public data: any[] = [];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "blandedcost";
    public sortOrder = "asc";

    public currentPage: number = 1;
    public totalItems: number = 200; // total numbar of page not items 
    public maxSize: number = 10; // max page size 
    filter: string = '';
    appdataloaded=false;


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
        if(this.appcomponentdata.allServiceData){
            /*if(this.appdataloaded){
                this.isloading.emit(true);
                this.currentPage = 1;
                let awsdata = {
                    company: this.company,
                    strdate: this.appcomponentdata.startdate,
                    enddate: this.appcomponentdata.enddate,
                    currentpage: this.currentPage,
                    size: this.rowsOnPage,
                    filter: this.filter,
                    region: this.selectedRegion
                };
                this.getAllAwsResourcedata(awsdata);
            }else{
                this.parseDetailData(this.appcomponentdata.allServiceData);
            }
            this.appdataloaded=true;*/
            this.parseDetailData(this.appcomponentdata.allServiceData);
        }
        
    }

    getAllAwsResourcedata(awsdata: any) {
       
        var shortingorder = 'asc';
        awsdata.sortingfield = this.sorting.column;
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }
        awsdata.shortingorder = shortingorder;

        this._awsdata.getAllAwsResource(awsdata).subscribe((data) => {
            this.parseDetailData(data);
            this.isloading.emit(false);
        }, (error) => {
            console.log(error);
            this.isloading.emit(false);
        });


    }

    parseDetailData(data:any):void{
        var jsondata: any = [];
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
            let temp={
                "start":this.currentPage,
                "limit":this.rowsOnPage,
                "filterfield":'',
                "filtervalue":this.filter,
                "shortorder":'asc',
                "shortfield":'ProductName'
            }
            this.selectedDetailReportOption.emit(temp);
            /*this.filter = val;
            this.currentPage = 1;
            let awsdata = {
                company: this.company,
                strdate: this.appcomponentdata.startdate,
                enddate: this.appcomponentdata.enddate,
                currentpage: this.currentPage,
                size: this.rowsOnPage,
                filter: this.filter,
                region: this.selectedRegion
            };
            this.isloading.emit(true);
            this.getAllAwsResourcedata(awsdata);*/
        
        

    }



    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
    };

    public pageChanged(event: any): void {
        //this method will trigger every page click 
        /*let awsdata = {
            company: this.company,
            strdate: this.appcomponentdata.startdate,
            enddate: this.appcomponentdata.enddate,
            currentpage: this.currentPage,
            size: this.rowsOnPage,
            filter: this.filter,
            region: this.selectedRegion
        };
        this.isloading.emit(true);
        this.currentPage = event.itemsPerPage;
        this.getAllAwsResourcedata(awsdata);*/

        let temp={
            "start":this.currentPage,
            "limit":this.rowsOnPage,
            "filterfield":'',
            "filtervalue":this.filter,
            "shortorder":'asc',
            "shortfield":'ProductName'
        }
        
        this.selectedDetailReportOption.emit(temp);
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
        /*let awsdata = {
            company: this.company,
            strdate: this.appcomponentdata.startdate,
            enddate: this.appcomponentdata.enddate,
            currentpage: this.currentPage,
            size: this.rowsOnPage,
            filter: this.filter,
            region: this.selectedRegion
        };
        
        this.isloading.emit(true);
        this.getAllAwsResourcedata(awsdata);*/

        var shortingorder = 'asc';
        let temp={
            "start":this.currentPage,
            "limit":this.rowsOnPage,
            "filterfield":'',
            "filtervalue":this.filter,
            "shortorder":'asc',
            "shortfield":'ProductName'
        }
        temp.shortfield = this.sorting.column;
        if (this.sorting.descending) {
            shortingorder = 'desc';
        }
        temp.shortorder = shortingorder;
        this.selectedDetailReportOption.emit(temp);
    }

}
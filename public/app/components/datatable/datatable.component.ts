import { Component, EventEmitter, OnChanges } from '@angular/core';
import { Http } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';

@Component({
    moduleId: module.id,
    selector: 'aws-billing-datatable',
    templateUrl: 'datatable.component.html',
    styleUrls: ['datatable.component.css'],
    inputs: ['startdate', 'enddate', 'selectedRegion'],
    outputs: ['isloading']
})
export class DatatableComponent implements OnChanges {
    startdate: any;
    enddate: any;
    company: string;
    selectedRegion: string;

    isloading = new EventEmitter();

    public data: any[] = [];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "blandedcost";
    public sortOrder = "asc";

    public currentPage: number = 1;
    public totalItems: number = 200; // total numbar of page not items 
    public maxSize: number = 10; // max page size 
    filter: string = '';


    columns: any[] = [
       
        {
            display: 'Product Name',
            variable: 'product_name',
            sortable: true
        },
        {
            display: 'Operation',
            variable: 'operation',
            sortable: false
        },
        {
            display: 'Item Description',
            variable: 'item_description',
            sortable: false
        },
        {
            display: 'Resource Id',
            variable: 'resource_id',
            sortable: true
        },
        {
            display: 'Availability Zone',
            variable: 'availability_zone',
            sortable: true
        },
        {
            display: 'Usage Quantity',
            variable: 'usage_quantity',
            sortable: false
        },
        {
            display: 'Blended Cost',
            variable: 'blended_cost',
            sortable: true
        },
        {
            display: 'Usage Duration',
            variable: 'usage_start_date',
            sortable: true
        }
    ];

    sorting: any = {
        column: 'product_name', //to match the variable of one of the columns
        descending: false
    };



    constructor(private http: Http, private _awsdata: AwsdataService, private _config: ConfigService) {
        this.company = this._config.company;
    }

    ngOnChanges(): void {
        this.isloading.emit(true);
        this.currentPage = 0;
        let awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size: this.rowsOnPage,
            filter: this.filter,
            region: this.selectedRegion
        };
        this.getAllAwsResourcedata(awsdata);
    }

    getAllAwsResourcedata(awsdata: any) {
        var jsondata: any = [];
        var shortingorder='asc';
        awsdata.sortingfield=this.sorting.column;
        if(this.sorting.descending){
            shortingorder='desc';
        }
        awsdata.shortingorder=shortingorder;
        console.log(awsdata);

        this._awsdata.getAllAwsResource(awsdata).subscribe((data) => {
            if (data.hits.total) {

                this.totalItems = data.hits.total;

            }
            for (let hit of data.hits.hits) {
                jsondata.push(hit._source);
            }

            this.data = jsondata;
            this.isloading.emit(false);
        });


    }

    filterbyOperation(val: string) {
        this.filter = val;
        this.currentPage = 1;
        let awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size: this.rowsOnPage,
            filter: this.filter,
            region: this.selectedRegion
        };
        this.isloading.emit(true);
        this.getAllAwsResourcedata(awsdata);

    }



    public setPage(pageNo: number): void {
        this.currentPage = pageNo;
    };

    public pageChanged(event: any): void {
        //this method will trigger every page click 
        let awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size: this.rowsOnPage,
            filter: this.filter,
            region: this.selectedRegion
        };
        this.isloading.emit(true);
        this.currentPage = event.itemsPerPage;
        this.getAllAwsResourcedata(awsdata);
    };


    selectedClass(columnName): string{
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
        let awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size: this.rowsOnPage,
            filter: this.filter,
            region: this.selectedRegion
        };
        this.isloading.emit(true);
        this.getAllAwsResourcedata(awsdata);
    }

}
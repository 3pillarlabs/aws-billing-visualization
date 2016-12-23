import { Component,OnInit,EventEmitter }  from '@angular/core';
import { Http } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';

@Component({
	moduleId: module.id,
	selector : 'aws-billing-datatable',
	templateUrl: 'datatable.component.html',
	styleUrls: ['datatable.component.css'],
    inputs: ['startdate','enddate'],
    outputs:['isloading']
})
export class DatatableComponent implements OnInit{
    startdate:any;
	enddate:any;
    company:string = 'tpg';

    isloading=new EventEmitter();
    
    public data: any[]=[];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "blandedcost";
    public sortOrder = "asc";

    public currentPage:number = 1;
    public totalItems:number = 200; // total numbar of page not items 
    public maxSize:number = 10; // max page size 
    filter:string='';

    

    constructor(private http: Http,private _awsdata:AwsdataService) { }

    ngOnInit(): void {
        let awsdata={
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size:   this.rowsOnPage,
            filter: this.filter
        };
        this.getAllAwsResourcedata(awsdata);
    }
    
    getAllAwsResourcedata(awsdata:any){
        var jsondata:any=[];
        this._awsdata.getAllAwsResource(awsdata).subscribe((data)=>{
           if(data.hits.total){
               
               this.totalItems=data.hits.total;
            
           }
           for(let hit of data.hits.hits){
                jsondata.push(hit._source);
            }
            
            this.data =jsondata;
            this.isloading.emit(false);
        });


    }

    filterbyOperation(val:string){
        this.filter=val;
        this.currentPage=1;
        let awsdata={
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size:   this.rowsOnPage,
            filter: this.filter
        };
        this.isloading.emit(true);
        this.getAllAwsResourcedata(awsdata);
        
    }

   
   
    public setPage(pageNo:number):void {
        this.currentPage = pageNo;    
    };

    public pageChanged(event:any):void {
        //this method will trigger every page click 
        let awsdata={
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
            currentpage: this.currentPage,
            size:   this.rowsOnPage,
            filter: this.filter
        };
        this.isloading.emit(true);
        this.currentPage= event.itemsPerPage;
         this.getAllAwsResourcedata(awsdata);
    };

}
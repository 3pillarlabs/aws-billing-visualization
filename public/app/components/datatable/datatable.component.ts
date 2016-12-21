import { Component,OnInit }  from '@angular/core';
import { Http } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';

@Component({
	moduleId: module.id,
	selector : 'aws-billing-datatable',
	templateUrl: 'datatable.component.html',
	styleUrls: ['datatable.component.css'],
    inputs: ['startdate','enddate']
})
export class DatatableComponent implements OnInit{
    startdate:any;
	enddate:any;
    company:string = 'tpg';

    
	public data: any[];
    public filterQuery = "";
    public rowsOnPage = 10;
    public sortBy = "blandedcost";
    public sortOrder = "asc";

    constructor(private http: Http,private _awsdata:AwsdataService) { }

    ngOnInit(): void {
        var awsdata = {
    		company: this.company,
    		strdate: this.startdate,
    		enddate: this.enddate
		};

        this.getAllAwsResourcedata(awsdata);
    }

    

    
    getAllAwsResourcedata(awsdata:any){
        var jsondata:any=[];
        this._awsdata.getAllAwsResource(awsdata).subscribe((data)=>{
           for(let hit of data.hits.hits){
                jsondata.push(hit._source);
            }
            console.log(jsondata);
            this.data =jsondata;
        });


    }


}
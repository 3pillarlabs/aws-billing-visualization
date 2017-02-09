import { Component,OnInit } from '@angular/core';
import { ConfigService } from './services/config.service';
import { AwsdataService } from './services/awsdata.service';

declare var $:any;


@Component({
	moduleId: module.id,
	selector: 'my-app',
	templateUrl: 'app.component.html',
	inputs: ['isloading','selectProduct','selectedDetailReportOption']
})

export class AppComponent implements OnInit{
	startdate: any;
	enddate: any;
	isloading: boolean;
	selectedRegion: string = "";
	selectedProduct:string="";
	detailReportOption:any="";

	company: string;
	error:string;

	public calstartDate:string;
	public calendDate:string;

	totalRecord:number;
	lastupdated:string;

	allServiceData:any;
	appcomponentdata={"startdate":'',"enddate":'','allServiceData':''};
	

	constructor(private _config: ConfigService,private _awsdata:AwsdataService) {
		this.company = this._config.company;
		let today = new Date();
		let year = today.getFullYear();
		let month = ("0" + (today.getMonth() + 1)).slice(-2);
		let day = new Date(year, +month, 0).getDate();
		this.startdate = '';
		this.enddate = '';
		this.isloading = false;


	}

	



	ngOnInit(){
		this.isloading = true;
		this._awsdata.getMinMaxDateRange(this.company).subscribe((data)=>{
            if(data){
				this.totalRecord=data.hits.total;
				this.lastupdated=data.aggregations.last_created.value_as_string;
                this.calstartDate=data.aggregations.min_date.value_as_string;
                this.calendDate=data.aggregations.max_date.value_as_string;
				let datesplitearr=this.calendDate.split("-");
				this.startdate = datesplitearr[0] + '-' + datesplitearr[1] + '-01';
				this.enddate = this.calendDate;

				$('.datepicker').datepicker({
					format: 'yyyy-mm-dd',
					autoclose:true,
					startDate:this.calstartDate,
					endDate:this.calendDate
				});

				this.getAllServiceData();
            }
        },(error)=>{
			this.error=error;
		})

		
	}

	getAllServiceData(){
		let awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate,
			product: this.selectedProduct,
			region: this.selectedRegion,
			detailreport: this.detailReportOption
        };


		this._awsdata.getGroupServicedata(awsdata).subscribe((data)=>{
			this.allServiceData=data;
			let newappcomponentdata={
				"startdate": this.startdate,
				"enddate": this.enddate,
				"allServiceData": this.allServiceData
			}
			this.appcomponentdata=newappcomponentdata;
			this.isloading = false;
		},(error)=>{
			this.error=error;
		})

	}

	searchAwsData(startDate: any, endDate: any) {
		if (startDate && endDate) {
			this.isloading=true;
			this.startdate = startDate;
			this.enddate = endDate;
			this.selectedProduct='';
			this.selectedRegion='';
			this.detailReportOption="";
			
			let newappcomponentdata={
				"startdate": this.startdate,
				"enddate": this.enddate,
				"allServiceData": this.allServiceData
			}
			this.getAllServiceData();
			//this.appcomponentdata=newappcomponentdata;
		}else{
			//alert()
		}
	}

	onSelectRegion(region: string): void {
		this.isloading = true;
		this.selectedRegion=region;
		this.detailReportOption="";
		this.getAllServiceData();
	}
	
	onSelectProduct(selectedproduct:string){
		this.isloading = true;
		this.selectedProduct=selectedproduct;
		this.selectedRegion='';
		this.detailReportOption="";
		this.getAllServiceData();
	}

	onselectedDetailReportOption(detailoption:any){
		this.isloading = true;
		this.detailReportOption=detailoption;
		this.getAllServiceData();
	}
}

import { Component,OnInit } from '@angular/core';
import { ConfigService } from './services/config.service';
import { AwsdataService } from './services/awsdata.service';
declare var $:any;


@Component({
	moduleId: module.id,
	selector: 'my-app',
	templateUrl: 'app.component.html',
	inputs: ['isloading']
})

export class AppComponent implements OnInit{
	startdate: any;
	enddate: any;
	isloading: boolean;
	selectedRegion: string = "";
	company: string;

	public calstartDate:string;
	public calendDate:string;

	constructor(private _config: ConfigService,private _awsdata:AwsdataService) {
		this.company = this._config.company;
		let today = new Date();
		let year = today.getFullYear();
		let month = ("0" + (today.getMonth() + 1)).slice(-2);
		let day = new Date(year, +month, 0).getDate();
		this.startdate = year + '-' + month + '-01';
		this.enddate = year + '-' + month + '-' + day;
		this.isloading = false;


	}



	ngOnInit(){
		this._awsdata.getMinMaxDateRange(this.company).subscribe((data)=>{
            if(data){
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
            }
        })

		
	}

	searchAwsData(startDate: any, endDate: any) {
		if (startDate && endDate) {
			this.startdate = startDate;
			this.enddate = endDate;
		}else{
			//alert()
		}
	}

	onSelectRegion(region: string): void {
		this.selectedRegion = region;
	}
}

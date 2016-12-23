import { Component,ViewChild } from '@angular/core';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { DatatableComponent } from './components/datatable/datatable.component';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html',
  inputs:['isloading']
})

export class AppComponent{ 
	@ViewChild(HeatmapComponent) Heatmap: HeatmapComponent;
	@ViewChild(DatatableComponent) Datatable: DatatableComponent;
	startdate:any;
	enddate:any;
	isloading:boolean;
	
	company:string='tpg';
	constructor(){
		let today = new Date();
		let year=today.getFullYear();
		let month=today.getMonth()+1;
		let day=new Date(year, month, 0).getDate();
		this.startdate=year+'-'+month+'-01';
		this.enddate = year+'-'+month+'-'+day;
		this.isloading=false;
	}
	
	

    getAwsdata(){
    	var awsdata = {
    		company: this.company,
    		strdate: this.startdate,
    		enddate: this.enddate
		};
    	this.Heatmap.drawHeatmapAndMarker(awsdata);
    }

	getAwsResourcedata(){
		var awsdata = {
    		company: this.company,
    		strdate: this.startdate,
    		enddate: this.enddate
		};
		this.Datatable.getAllAwsResourcedata(awsdata);
	}

	startdatechange(stdate:any){
		this.isloading=true;
		this.startdate=stdate;
		this.getAwsdata();
		this.getAwsResourcedata();
	}

	enddatechange(endate:any){
		this.isloading=true;
		this.enddate=endate;
		this.getAwsdata();
		this.getAwsResourcedata();
	}


}

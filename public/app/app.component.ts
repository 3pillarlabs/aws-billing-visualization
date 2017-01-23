import { Component } from '@angular/core';
import { ConfigService } from './services/config.service';

@Component({
	moduleId: module.id,
	selector: 'my-app',
	templateUrl: 'app.component.html',
	inputs: ['isloading']
})

export class AppComponent {
	startdate: any;
	enddate: any;
	isloading: boolean;
	selectedRegion: string = "";
	company: string;

	constructor(private _config: ConfigService) {
		this.company = this._config.company;
		let today = new Date();
		let year = today.getFullYear();
		let month = ("0" + today.getMonth() + 1).slice(-2);
		let day = new Date(year, +month, 0).getDate();
		this.startdate = year + '-' + month + '-01';
		this.enddate = year + '-' + month + '-' + day;
		this.isloading = false;
	}

	searchAwsData(startDate: any, endDate: any) {
		if (startDate && endDate) {
			this.startdate = startDate;
			this.enddate = endDate;
			this.isloading = true;
		}else{
			//alert()
		}
	}

	onSelectRegion(region: string): void {
		this.selectedRegion = region;
	}
}

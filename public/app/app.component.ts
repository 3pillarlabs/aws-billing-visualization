import { Component, OnInit } from '@angular/core';
import { ConfigService } from './services/config.service';
import { AwsdataService } from './services/awsdata.service';
declare var $: any;


@Component({
	moduleId: module.id,
	selector: 'my-app',
	templateUrl: 'app.component.html',
	inputs: ['isloading']
})

export class AppComponent implements OnInit {
	startdate: any;
	enddate: any;
	isloading: boolean;
	selectedRegion: string = "";
	company: string;
	dateRange: string;

	public calstartDate: string;
	public calendDate: string;

	totalRecord: number;
	lastupdated: string;

	constructor(private _config: ConfigService, private _awsdata: AwsdataService) {
		this.company = this._config.company;
		let today = new Date();
		let year = today.getFullYear();
		let month = ("0" + (today.getMonth() + 1)).slice(-2);
		let day = new Date(year, +month, 0).getDate();
		this.startdate = year + '-' + month + '-01';
		this.enddate = year + '-' + month + '-' + day;
		this.dateRange = this.startdate+" - "+this.enddate;
		this.isloading = false;


	}



	ngOnInit() {
		this._awsdata.getMinMaxDateRange(this.company).subscribe((data) => {
			if (data) {
				this.totalRecord = data.hits.total;
				this.lastupdated = data.aggregations.last_created.value_as_string;
				this.calstartDate = data.aggregations.min_date.value_as_string;
				this.calendDate = data.aggregations.max_date.value_as_string;
				let datesplitearr = this.calendDate.split("-");
				this.startdate = datesplitearr[0] + '-' + datesplitearr[1] + '-01';
				this.enddate = this.calendDate;
				this.dateRange = this.startdate+" - "+this.enddate;

				$('.datepicker').daterangepicker({
					locale: {
						format: 'YYYY-MM-DD'
					},
					startDate: this.startdate,
					endDate: this.enddate,
					minDate: this.calstartDate,
					maxDate: this.calendDate,
					autoApply: true
				}, function (start, end, label) {
					$('input[name="daterange"]').val(start.format('YYYY-MM-DD') + " - " + end.format('YYYY-MM-DD'));
				});
			}
		})
	}

	searchAwsData(dateRangeStr:string) {
		if (dateRangeStr) {
			let dateArr = dateRangeStr.split(" - ");
			this.startdate = dateArr[0];
			this.enddate = dateArr[1];
		}
	}

	onSelectRegion(region: string): void {
		this.selectedRegion = region;
	}
}

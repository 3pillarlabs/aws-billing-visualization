import { Component, OnInit } from '@angular/core';
import { AwsdataService } from './services/awsdata.service';
declare var $: any; //Define var to access Jquery library
declare var moment: any //Define var to use moment.js library

@Component({
	moduleId: module.id,
	selector: 'my-app',
	templateUrl: 'app.component.html',
	inputs: ['selectProduct', 'companyChange']
})

export class AppComponent implements OnInit {
	startdate: any;
	enddate: any;
	isloading: boolean;
	selectedRegion: string = "";
	selectedProduct: string = "";
	detailReportOption: any = "";

	company: string;
	error: string;
	dateRange: string;
	companyChange: string;

	public calstartDate: string;
	public calendDate: string;

	totalRecord: number;
	lastupdated: string;
	convertedDate: any;
	allServiceData: any;
	inputdata: any;
	appcomponentdata = { "startdate": '', "enddate": '', 'allServiceData': '', 'inputdata': '' };
	noProductData: boolean = false;
	noRegionData: boolean = false;
	productSelectionInfoTxt: string = "Click on bar or product label to select product";
	indiceslist: any = [];

	firstTimeSetup:boolean = false;


	constructor(private _awsdata: AwsdataService) {
		this.inputdata = {
			'region': this.selectedRegion,
			'product': this.selectedProduct,
			'detaildata': {
				"start": 1,
				"limit": 10,
				"filterfield": '',
				"filtervalue": '',
				"shortorder": 'asc',
				"shortfield": 'ProductName'
			}
		};
		this.appcomponentdata.inputdata = this.inputdata;
		//this.company = this._config.company;
		let today = new Date();
		let year = today.getFullYear();
		let month = ("0" + (today.getMonth() + 1)).slice(-2);
		let day = new Date(year, +month, 0).getDate();

		this.startdate = year + '-' + month + '-01';
		this.enddate = year + '-' + month + '-' + day;
		this.dateRange = moment(this.startdate, "YYYY-MM-DD").format('MMMM D, YYYY') + " - " + moment(this.enddate, "YYYY-MM-DD").format('MMMM D, YYYY');
		this.isloading = false;

	}

	ngOnInit() {
		this.isloading = true;
		this._awsdata.getAllIndexes().subscribe((data) => {
			if (data.indices) {
				let indxarr = [];
				for (let indx in data.indices) {
					indxarr.push(indx);
				}
				this.indiceslist = indxarr;
				this.company = this.indiceslist[0];
			}

			this.setupData();

		}, (error) => {
			//this.error = "No data available.";//error;
			this.firstTimeSetup=true;
		})
	}

	setupData() {
		this._awsdata.getMinMaxDateRange(this.company).subscribe((data) => {
			if (data) {
				this.totalRecord = data.hits.total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
				this.lastupdated = data.aggregations.last_created.value_as_string;
				let localtimezoneDate = new Date(this.lastupdated + ' UTC');
				this.convertedDate = moment(localtimezoneDate, "YYYY-MM-DD").format('MMM DD, YYYY hh:mm A');
				this.calstartDate = data.aggregations.min_date.value_as_string;
				this.calendDate = data.aggregations.max_date.value_as_string;
				if (this.calstartDate && this.calendDate) {
					let datesplitearr = this.calendDate.split("-");
					this.startdate = datesplitearr[0] + '-' + datesplitearr[1] + '-01';
					this.enddate = this.calendDate;
					this.dateRange = moment(this.startdate, "YYYY-MM-DD").format('MMMM D, YYYY') + " - " + moment(this.enddate, "YYYY-MM-DD").format('MMMM D, YYYY');
					var that = this;
					$('input[name="daterange"]').daterangepicker({
						locale: {
							format: 'MMMM D, YYYY'
						},
						startDate: moment(this.startdate, "YYYY-MM-DD").format('MMMM D, YYYY'),
						endDate: moment(this.enddate, "YYYY-MM-DD").format('MMMM D, YYYY'),
						minDate: moment(this.calstartDate, "YYYY-MM-DD").format('MMMM D, YYYY'),
						maxDate: moment(this.calendDate, "YYYY-MM-DD").format('MMMM D, YYYY'),
						autoApply: true,
						ranges: {
							'Today': [moment(), moment()],
							'Yesterday': [moment().subtract(1, 'days'), moment().subtract(1, 'days')],
							'Last 7 Days': [moment().subtract(6, 'days'), moment()],
							'Last 30 Days': [moment().subtract(29, 'days'), moment()],
							'This Month': [moment().startOf('month'), moment().endOf('month')],
							'Last Month': [moment().subtract(1, 'month').startOf('month'), moment().subtract(1, 'month').endOf('month')]
						}
					}).on('change', function (e) {
						var dateRangeStr = $('input[name="daterange"]').val();
						that.searchAwsData(dateRangeStr);
					});
					$('.input-glyph').click(function () {
						$('input[name="daterange"]').data("daterangepicker").show();
					});

					this.getAllServiceData();
				}
				else {
					this.error = "No data available."
					
				}

			}
		}, (error) => {
			//this.error = "No data available.";//error;
			this.firstTimeSetup=true;
		})
	}

	getAllServiceData() {
		let awsdata = {
			company: this.company,
			strdate: this.startdate,
			enddate: this.enddate,
			product: this.selectedProduct,
			region: this.selectedRegion,
			detailreport: this.detailReportOption
		};


		this._awsdata.getGroupServicedata(awsdata).subscribe((data) => {
			if (data.aggregations.AvailabilityRegion) {
				if (!data.aggregations.AvailabilityRegion.buckets.length) {
					this.noRegionData = true;
				} else {
					this.noRegionData = false;
				}
			}

			if (data.aggregations.product_name) {
				if (!data.aggregations.product_name.buckets.length) {
					this.noProductData = true;
				} else {
					this.noProductData = false;
				}
			}

			this.allServiceData = data;
			let newappcomponentdata = {
				"startdate": this.startdate,
				"enddate": this.enddate,
				"allServiceData": this.allServiceData,
				"inputdata": this.inputdata
			};
			this.appcomponentdata = newappcomponentdata;
			this.isloading = false;
		}, (error) => {
			this.error = error;
		})

	}

	searchAwsData(dateRangeStr: string) {
		if (dateRangeStr) {
			this.isloading = true;
			let dateArr = dateRangeStr.split(" - ");
			this.startdate = moment(dateArr[0], "MMMM D, YYYY").format('YYYY-MM-DD');
			this.enddate = moment(dateArr[1], "MMMM D, YYYY").format('YYYY-MM-DD');
			this.selectedProduct = '';
			this.selectedRegion = '';
			this.detailReportOption = "";

			this.inputdata.product = "";
			this.inputdata.region = "";
			this.inputdata.detaildata = {
				"start": 1,
				"limit": 10,
				"filterfield": '',
				"filtervalue": '',
				"shortorder": 'asc',
				"shortfield": 'ProductName'
			};

			let newappcomponentdata = {
				"startdate": this.startdate,
				"enddate": this.enddate,
				"allServiceData": this.allServiceData
			}
			this.getAllServiceData();

		} else {
			//alert()
		}
	}


	onSelectRegion(region: string): void {
		this.isloading = true;
		this.selectedRegion = region;
		this.detailReportOption = "";
		this.inputdata.region = region;
		this.inputdata.detaildata = {
			"start": 1,
			"limit": 10,
			"filterfield": '',
			"filtervalue": '',
			"shortorder": 'asc',
			"shortfield": 'ProductName'
		};
		this.getAllServiceData();
	}

	onSelectProduct(selectedproduct: string) {
		if (selectedproduct) {
			this.productSelectionInfoTxt = "Click on selected bar or label to unselect product";
		} else {
			this.productSelectionInfoTxt = "Click on bar or product label to select product";
		}

		this.isloading = true;
		this.selectedProduct = selectedproduct;
		this.selectedRegion = '';
		this.detailReportOption = "";
		this.inputdata.product = selectedproduct;
		this.inputdata.region = "";
		this.inputdata.detaildata = {
			"start": 1,
			"limit": 10,
			"filterfield": '',
			"filtervalue": '',
			"shortorder": 'asc',
			"shortfield": 'ProductName'
		};
		this.getAllServiceData();
	}

	onDetailReportChange(detailData: any) {
		this.isloading = true;
		this.startdate = detailData.strdate;
		this.enddate = detailData.enddate;
		this.dateRange = moment(this.startdate, "YYYY-MM-DD").format('MMMM D, YYYY') + " - " + moment(this.enddate, "YYYY-MM-DD").format('MMMM D, YYYY');

		this.selectedProduct = '';
		this.selectedRegion = '';
		this.detailReportOption = "";

		this.inputdata.product = "";
		this.inputdata.region = "";
		this.inputdata.detaildata = {
			"start": 1,
			"limit": 10,
			"filterfield": '',
			"filtervalue": '',
			"shortorder": 'asc',
			"shortfield": 'ProductName'
		};

		let newappcomponentdata = {
			"startdate": this.startdate,
			"enddate": this.enddate,
			"allServiceData": this.allServiceData
		}
		this.getAllServiceData();

	}

	onCompanyChange(companyValue: string) {
		this.isloading = true;
		if(companyValue=='AddIndex'){
			this.firstTimeSetup=true;
			this.isloading = false;
		}else{
			this.company = companyValue;
			this.companyChange = companyValue;
			this.setupData();
			this.firstTimeSetup=false;
		}
		
	}
}

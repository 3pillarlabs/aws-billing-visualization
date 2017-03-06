import { Component, OnInit } from '@angular/core';
import { ConfigService } from './services/config.service';
import { AwsdataService } from './services/awsdata.service';
declare var $: any;
declare var moment: any

@Component({
	moduleId: module.id,
	selector: 'my-app',
	templateUrl: 'app.component.html',
	inputs: ['selectProduct']
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


	public calstartDate: string;
	public calendDate: string;

	totalRecord: number;
	lastupdated: string;
	allServiceData: any;
	inputdata: any;
	appcomponentdata = { "startdate": '', "enddate": '', 'allServiceData': '', 'inputdata': '' };
	productsRegionsData = { "regions": "", "products": "" };
	noProductData:boolean = false;
	noRegionData:boolean = false;



	constructor(private _config: ConfigService, private _awsdata: AwsdataService) {
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
		this.company = this._config.company;
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
		this._awsdata.getMinMaxDateRange(this.company).subscribe((data) => {
			if (data) {
				this.totalRecord = data.hits.total;
				this.lastupdated = data.aggregations.last_created.value_as_string;
				this.calstartDate = data.aggregations.min_date.value_as_string;
				this.calendDate = data.aggregations.max_date.value_as_string;
				if (this.calstartDate && this.calendDate) {
					let datesplitearr = this.calendDate.split("-");
					this.startdate = datesplitearr[0] + '-' + datesplitearr[1] + '-01';
					this.enddate = this.calendDate;
					this.dateRange = moment(this.startdate, "YYYY-MM-DD").format('MMMM D, YYYY') + " - " + moment(this.enddate, "YYYY-MM-DD").format('MMMM D, YYYY');

					this.productsRegionsData.regions = data.aggregations.availability_regions.buckets;
					this.productsRegionsData.products = data.aggregations.product_names.buckets;

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
				else{
					this.error = "No data available."
				}

			}
		}, (error) => {
			this.error = "No data available.";//error;
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
			if(!data.aggregations.AvailabilityRegion.buckets.length){
				this.noRegionData = true;
			}else{
				this.noRegionData = false;
			}
			if(!data.aggregations.product_name.buckets.length){
				this.noProductData = true;
			}else{
				this.noProductData = false;
			}
			this.allServiceData = data;
			let newappcomponentdata = {
				"startdate": this.startdate,
				"enddate": this.enddate,
				"allServiceData": this.allServiceData,
				"inputdata": this.inputdata
			}
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
			//this.appcomponentdata=newappcomponentdata;
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
		//console.log(detailData);
		this.isloading = true;
		this.startdate = detailData.strdate;
		this.enddate = detailData.enddate;
		/*this.selectedProduct=detailData.product;
		this.selectedRegion=detailData.region;
		this.detailReportOption={
			"limit":detailData.size,
			"start":detailData.currentpage,
			"shortorder":detailData.shortingorder,
			"shortfield":detailData.sortingfield,
			"filtervalue":detailData.filter
		}*/
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
}

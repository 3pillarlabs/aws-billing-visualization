import { Injectable } from '@angular/core';
import { Http,Headers } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class AwsdataService{

    constructor(private _http:Http){
        console.log('awsservice data initalized');
    }

    getAwsRegions(data:any){
		var regiondata:any = [];
		var headers= new Headers();
        headers.append('Content-Type','application/json');
        return this._http.post('/reports/regions',JSON.stringify(data),{headers:headers}).map((res)=>{
        	var data= res.json();
        	for (let region of data.aggregations.availability_zone.buckets) {
  				if(region.total_blended_cost.value > 0){
  					var latlonginfo = this.getLatLongFromRegions(region.key);
  					var regiondoc = {
  						'name': latlonginfo.name,
  						'code': region.key,
  						'lat' : latlonginfo.lat,
  						'lng': latlonginfo.lng,
  						'totalcost': parseFloat(region.total_blended_cost.value).toFixed(2),
  						'totalresource': region.doc_count
  					}
  					regiondata.push(regiondoc);
  					
  				}
			}
			return regiondata;
        });
	}

	getRegionsData(data:any){
		let regionData = {};
		var headers= new Headers();
        headers.append('Content-Type','application/json');
		let maxval = 0;
        return this._http.post('/reports/regions',JSON.stringify(data),{headers:headers}).map((res)=>{
        	var data= res.json();
        	for (let region of data.aggregations.availability_zone.buckets) {				
  				if(region.total_blended_cost.value > 0){
					  if(maxval < region.total_blended_cost.value){
						  maxval = Math.ceil(region.total_blended_cost.value);
					  }
					  regionData[region.key] = {
						  name: region.key,
						  totalcost: parseFloat(region.total_blended_cost.value).toFixed(2),
						  totalresource: region.doc_count,
						  color: "red"
					  }  					
  				}
			}
			regionData['us-east-2'] = {
				name: 'us-east-2',
				totalcost: 200,
				totalresource: 200,
				color: "red"
			}
			regionData['us-west-2'] = {
				name: 'us-west-2',
				totalcost: 400,
				totalresource: 300,
				color: "red"
			}
			regionData['us-west-1'] = {
				name: 'us-west-1',
				totalcost: 600,
				totalresource: 400,
				color: "red"
			}
			regionData['ca-central-1'] = {
				name: 'ca-central-1',
				totalcost: 800,
				totalresource: 500,
				color: "red"
			} 
			regionData['sa-east-1'] = {
				name: 'sa-east-1',
				totalcost: 1000,
				totalresource: 600,
				color: "red"
			}
			regionData['eu-west-1'] = {
				name: 'eu-west-1',
				totalcost: 1200,
				totalresource: 700,
				color: "red"
			}
			regionData['eu-west-2'] = {
				name: 'eu-west-2',
				totalcost: 1400,
				totalresource: 800,
				color: "red"
			}
			regionData['eu-central-1'] = {
				name: 'eu-central-1',
				totalcost: 1600,
				totalresource: 900,
				color: "red"
			}
			regionData['ap-northeast-1'] = {
				name: 'ap-northeast-1',
				totalcost: 1800,
				totalresource: 1000,
				color: "red"
			}
			regionData['ap-northeast-2'] = {
				name: 'ap-northeast-2',
				totalcost: 2000,
				totalresource: 1100,
				color: "red"
			}
			regionData['ap-southeast-1'] = {
				name: 'ap-southeast-1',
				totalcost: 2200,
				totalresource: 1200,
				color: "red"
			}
			regionData['ap-southeast-2'] = {
				name: 'ap-southeast-2',
				totalcost: 2400,
				totalresource: 1400,
				color: "red"
			}
			regionData['ap-south-1'] = {
				name: 'ap-south-1',
				totalcost: 2600,
				totalresource: 1600,
				color: "red"
			}
			regionData['maxval'] = 3000;//maxval;
			return regionData;
        });
	}

    getLatLongFromRegions(region:string){

		var regionslatlong={
			
				'ap-southeast-1' : { 'lat': 1.338659 ,'lng': 103.647403,'name':'Asia Pacific (Singapore)'},
				'ap-northeast-2' : { 'lat': 37.566535 ,'lng': 126.977969,'name':'Asia Pacific (Seoul)'},
				'eu-west-1' : { 'lat': 32.780106 ,'lng': -92.412277,'name':'EU (Ireland)'},
				'ap-southeast-2' : { 'lat': -33.86882 ,'lng': 151.209296,'name':'Asia Pacific (Sydney)'},
				'sa-east-1' : { 'lat': -23.55052 ,'lng': -46.633309,'name':'South America (Sao Paulo)'},
				'eu-central-1' : { 'lat': 50.109492 ,'lng': 8.673965,'name':'EU (Frankfurt)'},
				'us-west-2' : { 'lat': 43.804133 ,'lng': -120.554201,'name':'US West (Oregon)'},
				'us-east-2' : { 'lat': 40.694654 ,'lng': -80.953948,'name':'US East (Ohio)'},
				'ap-northeast-1' : { 'lat': 35.689487 ,'lng': 139.691706,'name':'Asia Pacific (Tokyo)'},
				'us-east-1' : { 'lat': 37.431573 ,'lng': -78.656894,'name':'US East (N. Virginia)'},
				'us-east-1d': { 'lat': 37.431573 ,'lng': -78.656894,'name':'US East (N. Virginia)'},
				'us-east-1e' : { 'lat': -33.86882 ,'lng': 151.209296,'name':'Asia Pacific (Sydney)'}
		};

		return regionslatlong[region];

	}

	getAllAwsResource(awsdata:any){
		var headers= new Headers();
        headers.append('Content-Type','application/json');
		return this._http.post('/reports/getalldata',JSON.stringify(awsdata),{headers:headers}).map(data=>data.json());
	}

	getUniqueProduct(data:any){
		var productdata:any = [];
		var headers= new Headers();
        headers.append('Content-Type','application/json');
        return this._http.post('/reports/getProductWiseData',JSON.stringify(data),{headers:headers}).map((res)=>{
        	var data= res.json();
        	for (let product of data.aggregations.product_name.buckets) {
  				if(product.total_blended_cost.value > 0){
  					var productdoc = {
  						'name': product.key,
  						'totalcost': Math.round(product.total_blended_cost.value),
  						'totalresource': product.doc_count
  					}
  					productdata.push(productdoc);
  					
  				}
			}
			return productdata;
        });
	}
}
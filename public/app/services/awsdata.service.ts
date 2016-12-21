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
  						'totalcost': Math.round(region.total_blended_cost.value),
  						'totalresource': region.doc_count
  					}
  					regiondata.push(regiondoc);
  					
  				}
			}
			return regiondata;
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
}
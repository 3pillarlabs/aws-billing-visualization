import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()

export class AwsdataService {
	serverless:boolean;
	constructor(private _http: Http) { 
		this.serverless=environment.serverless;
		/*this.getApiJson().subscribe((data)=>{
			console.log('get api json data');
			console.log(data);
		},(error)=>{
			console.log(error);
		})*/

	}

	getApiJson(){
		return this._http.get('./../../tsconfig.json').map((res)=>{
			res.json();
		})
	}

	getAllAwsResource(awsdata: any) {
		
		var detailReportApiUrl=this.serverless ? "https://w0bclzi0hb.execute-api.us-east-1.amazonaws.com/prod/detailreport" : "api/getalldata";
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post(detailReportApiUrl, JSON.stringify(awsdata), { headers: headers }).map(data => data.json());
	}

	getMinMaxDateRange(index: string) {
		var getRecordInfoApiUrl=this.serverless ? "https://he6ltrs6rj.execute-api.us-east-1.amazonaws.com/prod/getrecordinfo?index="+ index : "api/getMinMaxDate/"+ index;
		return this._http.get(getRecordInfoApiUrl).map((res) => res.json());
	}

	getGroupServicedata(data: any) {
		var getGroupServiceDataApiUrl=this.serverless ? "https://427mmwiwse.execute-api.us-east-1.amazonaws.com/prod/groupedservicedata" : "api/getGroupServicedata";
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post(getGroupServiceDataApiUrl, JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	getAllIndexes(){
		var getIndexApiUrl=this.serverless ? "https://39th8ocsog.execute-api.us-east-1.amazonaws.com/prod/indexes" : "api/indexes";
		return this._http.get(getIndexApiUrl).map((res)=> res.json());
	}

	verifyAndSaveAWSData(data: any) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/verifyAndSaveAWSData', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	verifyElasticConnection() {
		if(this.serverless){
			var setupApiUrl="https://spyk0l1ihj.execute-api.us-east-1.amazonaws.com/prod/setup";
			var headers = new Headers();
			headers.append('Content-Type', 'application/json');
			var data={
				"methodNo":1
			}
			return this._http.post(setupApiUrl,JSON.stringify(data), { headers: headers }).map((res) => res.json());
		}else{
			return this._http.get('api/isElasticConnected').map((res) => res.json());
		}
		
	}

	verifyElasticIndex(index:string){
		if(this.serverless){
			var setupApiUrl="https://spyk0l1ihj.execute-api.us-east-1.amazonaws.com/prod/setup";
			var headers = new Headers();
			headers.append('Content-Type', 'application/json');
			var data={
				"methodNo":2,
				"index":index
			}
			return this._http.post(setupApiUrl,JSON.stringify(data), { headers: headers }).map((res) => res.json());
		}else{
			return this._http.get('api/isIndexExists/'+index).map((res) => res.json());
		}
		
	}

	uploadSampleFile(data:any){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/uploadSampleFile', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	setupStaticWebsite(data:any){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/setupStaticWebsite', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	validateAndSaveAccessKey(data:any){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/validateAndSaveAccessKey', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	createESDomain(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/createESDomain', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	getESEndPoint(domainName){
		return this._http.get('api/getElasticsearchDomainInfo/'+domainName).map(res => res.json());
	}

	createESIndex(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/createESIndex', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	uploadLambdaAndSeupWebsite(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/setupLambdaApiWebsite', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}
}

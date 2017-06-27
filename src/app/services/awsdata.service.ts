import { Injectable } from '@angular/core';
import { environment } from './../../environments/environment';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()

export class AwsdataService {
	serverless:boolean;
	apiUrls:any={
		detailReportData:"",
		getIndexes:"",
		groupedServiceData:"",
		recordInfo:""
	};
	constructor(private _http: Http) { 
		this.serverless=environment.serverless;
		this.getApiUrls().subscribe((data)=>{
			console.log(data);
			this.apiUrls=data;
		},(error)=>{
			console.log(error);
		})

	}

	getApiUrls(){
		var awsApiFile="/assets/awsApi.json";
		return this._http.get(awsApiFile).map(data => data.json());
	}

	getAllAwsResource(awsdata: any) {
		var detailReportApiUrl=this.serverless ? this.apiUrls.detailReportData : "api/getalldata";
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post(detailReportApiUrl, JSON.stringify(awsdata), { headers: headers }).map(data => data.json());
	}

	getMinMaxDateRange(index: string) {
		if(this.serverless){
			var data={
				indexValue:index
			};
			var getRecordInfoApiUrl=this.apiUrls.recordInfo;
			var headers = new Headers();
			headers.append('Content-Type', 'application/json');
			return this._http.post(getRecordInfoApiUrl, JSON.stringify(data), { headers: headers }).map(data => data.json());
		}else{
			return this._http.get("api/getMinMaxDate/"+index).map((res) => res.json());
		}
	}

	getGroupServicedata(data: any) {
		var getGroupServiceDataApiUrl=this.serverless ? this.apiUrls.groupedServiceData : "api/getGroupServicedata";
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post(getGroupServiceDataApiUrl, JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	getAllIndexes(){
		console.log(this.serverless);
		console.log('get all indexes');
		var getIndexApiUrl=this.serverless ? this.apiUrls.getIndexes : "api/indexes";
		console.log('URL:'+getIndexApiUrl);
		if(this.serverless){
			var data={
				index:'aws-billing'
			};
			var headers = new Headers();
			headers.append('Content-Type', 'application/json');
			return this._http.post(getIndexApiUrl, JSON.stringify(data), { headers: headers }).map(res => res.json());
		}else{
			return this._http.get(getIndexApiUrl).map((res)=> res.json());
		}
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

	createLambdasForSetup(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/createLambdasForSetup', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	createAwsRole(){
		return this._http.get('api/createRolewithPermission').map(res=>res.json());
	}

	createApisForSetup(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/createApisForSetup', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	creatApisJsonFile(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/creatApisJsonFile', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	setupAwsStaticWebsite(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/setupAwsStaticWebsite', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	setupAwsBillingCSVBucket(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/setupBillingBucket', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	enableCorsForApi(data){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('api/enableCorsForApi', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}
}

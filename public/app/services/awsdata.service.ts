import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()

export class AwsdataService {

	constructor(private _http: Http) { }

	getRegionsData(data: any) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('reports/regions', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	getAllAwsResource(awsdata: any) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('reports/getalldata', JSON.stringify(awsdata), { headers: headers }).map(data => data.json());
	}

	getUniqueProduct(data: any) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('reports/getProductWiseData', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	getMinMaxDateRange(index: string) {
		return this._http.get('reports/getMinMaxDate/' + index).map((res) => res.json());
	}

	getGroupServicedata(data: any) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('reports/getGroupServicedata', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	getAllIndexes(){
		return this._http.get('reports/indexes').map((res)=> res.json());
	}

	getSetupStatus() {
		return this._http.get('reports/issetup').map((res) => res.json());
	}

	verifyAndSaveAWSData(data: any) {
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('reports/verifyAndSaveAWSData', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

	verifyElasticConnection() {
		return this._http.get('reports/isElasticConnected').map((res) => res.json());
	}

	verifyElasticIndex(index:string){
		return this._http.get('reports/isIndexExists/'+index).map((res) => res.json());
	}

	uploadSampleFile(data:any){
		var headers = new Headers();
		headers.append('Content-Type', 'application/json');
		return this._http.post('reports/uploadSampleFile', JSON.stringify(data), { headers: headers }).map(res => res.json());
	}

}
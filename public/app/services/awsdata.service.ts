import { Injectable } from '@angular/core';
import { Http,Headers } from '@angular/http';
import 'rxjs/add/operator/map';


@Injectable()
export class AwsdataService{

    constructor(private _http:Http){
        console.log('aws-service data initialized');
    }

	getRegionsData(data:any){
		let regionData = {};
		var headers= new Headers();
        headers.append('Content-Type','application/json');
		let maxval = 0;
		let priceArr =  [0];
        return this._http.post('reports/regions',JSON.stringify(data),{headers:headers}).map((res)=>{
        	var data= res.json();
        	for (let region of data.aggregations.AvailabilityRegion.buckets) {				
  				if(region.TotalBlendedCost.value > 0){
					  if(maxval < region.TotalBlendedCost.value){
						  maxval = Math.ceil(region.TotalBlendedCost.value);
					  }
					  priceArr.push(Math.ceil(region.TotalBlendedCost.value));
					  regionData[region.key] = {
						  name: region.key,
						  totalcost: parseFloat(region.TotalBlendedCost.value).toFixed(2),
						  totalresource: region.doc_count,
						  color: "red"
					  }  					
  				}
			}			
			regionData['maxval'] = maxval;
			priceArr.sort(function(a, b){return a-b});
			regionData['pricedata'] = priceArr;
			return regionData;
        });
	}

	getAllAwsResource(awsdata:any){
		var headers= new Headers();
        headers.append('Content-Type','application/json');
		return this._http.post('reports/getalldata',JSON.stringify(awsdata),{headers:headers}).map(data=>data.json());
	}

	getUniqueProduct(data:any){
		var productdata:any = [];
		var headers= new Headers();
        headers.append('Content-Type','application/json');
        return this._http.post('reports/getProductWiseData',JSON.stringify(data),{headers:headers}).map((res)=>{
        	var data= res.json();
        	for (let product of data.aggregations.product_name.buckets) {
  				if(product.TotalBlendedCost.value > 0){
  					var productdoc = {
  						'name': product.key,
  						'totalcost': Math.round(product.TotalBlendedCost.value),
  						'totalresource': product.doc_count
  					};
  					productdata.push(productdoc);
  					
  				}
			}
			return productdata;
        });
	}

	getMinMaxDateRange(index:string){
		return this._http.get('reports/getMinMaxDate/'+index).map((res)=>res.json());
	}
}
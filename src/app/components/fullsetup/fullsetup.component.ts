import { Component } from "@angular/core";
import { AwsdataService } from './../../services/awsdata.service';

@Component({
    templateUrl: "fullsetup.component.html",
    styleUrls: ['fullsetup.component.css']
})

export class FullsetupComponent {
    stepValue: number = 1;
    s3: any;
    isloading: boolean = false;
    errorMessage: string;
    esDomainName: string;
    awskeys: any = {
        accesskey: "",
        secretkey: "",
        region: ""
    };
    //es:Elastic Search
    es: any = {
        domainName: "",
        index: "",
        doctype: ""
    };
    esDomainStatus: any;
    awsbuckets: any = {
        lambdazipbucket: "",
        billingCsvbucket: "",
        websiteSetupbucket: ""
    }
    intervalId: any;
    intervalValue: number = 60000;
    awsApiUrls: any = {
        detailReportData: "",
        groupedServiceData: "",
        getIndexes: "",
        recordInfo: ""
    };
    websiteEndPoint:string="";
    constructor(private _awsdata: AwsdataService) { }

    moveTo(step: number) {
        this.stepValue = step;
    }

    validateAwsKey() {
        if (this.awskeys.accesskey !== '' && this.awskeys.accesskey !== '' && this.awskeys.region !== '') {
            return false;
        } else {
            return true;
        }
    }

    savekeys() {
        this.isloading = true;
        this._awsdata.validateAndSaveAccessKey(this.awskeys).subscribe(res => {
            this.stepValue = 2;
            this.isloading = false;
            this.errorMessage = '';
        }, error => {
            this.isloading = false;
            this.errorMessage = 'Wrong Keys value.';
        })
    }

    validateESValues() {
        if (this.es.domainName !== '' && this.es.index !== '' && this.es.doctype !== '') {
            return false;
        } else {
            return true;
        }
    }

    createESDomain() {
        this.isloading = true;
        this._awsdata.createESDomain(this.es).subscribe(res => {
            this.errorMessage = '';
            //Domain take approx 14 min to be ready
            this.intervalId = setInterval(() => {
                this.getESEndPoint();
            }, this.intervalValue);
        }, err => {
            this.isloading = false;
            this.errorMessage = 'Problem in creating domain.';
        })
    }

    getESEndPoint() {
        this.isloading = true;
        this._awsdata.getESEndPoint(this.es.domainName).subscribe(res => {
            this.esDomainStatus = res;
            this.createESIndexAndMapping();
        }, err => {
            this.isloading = false;
            this.errorMessage = 'Problem in getting domain status.';
        })
    }

    createESIndexAndMapping() {
        if (this.esDomainStatus.DomainStatus.Processing === false && this.esDomainStatus.DomainStatus.Endpoint) {
            clearInterval(this.intervalId);
            let createIndexMappingData = {
                'DomainId': this.esDomainStatus.DomainStatus.DomainId,
                'ARN': this.esDomainStatus.DomainStatus.ARN,
                'domainName': this.esDomainStatus.DomainStatus.DomainName,
                'Endpoint': this.esDomainStatus.DomainStatus.Endpoint,
                'indexName': this.es.index,
                'doctype': this.es.doctype
            };
            this._awsdata.createESIndex(createIndexMappingData).subscribe(res => {
                this.stepValue = 3;
                this.isloading = false;
            }, err => {
                this.isloading = false;
                this.errorMessage = 'Problem in creating index for elastic search.';
            })
        }
    }

    validateBuckets() {
        if (this.awsbuckets.lambdazipbucket !== '' && this.awsbuckets.billingCsvbucket !== '' && this.awsbuckets.websiteSetupbucket !== '') {
            return false;
        } else {
            return true;
        }
    }

    save() {
        this.isloading = true;
        this._awsdata.createAwsRole().subscribe(res => {
            var roleARN = res.roleARN;
            var roleId = res.roleId;
            let data = {
                'buckets': this.awsbuckets,
                'indexName': this.es.index,
                'doctype': this.es.doctype,
                'esHost': this.esDomainStatus.DomainStatus.Endpoint,
                'roleARN': roleARN,
                'roleId': roleId
            };
            this._awsdata.createLambdasForSetup(data).subscribe(res => {
                if (res.length > 0) {
                    this.createAwsApi(res, res.length, 0);
                }
            }, function (err) {
                this.isloading = false;
                this.errorMessage = 'Problem in upload lambda and seup website.';
            })
        }, error => {
            this.isloading = false;
            this.errorMessage = 'Problem in creating Role and Policy.';
        })

    }

    createAwsApi(lambdaFuns: any, limit: number, start: number) {
        let lambdafunArn = lambdaFuns;
        setTimeout(() => {
            if (start < limit) {
                var funName = lambdaFuns[start].funName;
                var lambdafunArn = lambdaFuns[start].arn;
                
                if(funName==='processBillingCsvtest'){
                    let data={
                        arn: lambdafunArn,
                        bucket: this.awsbuckets.billingCsvbucket
                    };

                    this._awsdata.setupAwsBillingCSVBucket(data).subscribe((data)=>{

                    },function(error){
                        this.isloading = false;
                        this.errorMessage = 'Problem in setup aws billing Bucket.';
                    })
                }else{
                    let data = {
                        funName: funName,
                        arn: lambdafunArn
                    };
                    this._awsdata.createApisForSetup(data).subscribe(res => {
                        var apiUrl=res.url;
                        var apiId=res.apiId;
                        var resourceId=res.resourceId;
                        switch (funName) {
                            case 'detailReportDatatest':
                                this.awsApiUrls.detailReportData = apiUrl+"getBillingtest";
                                break;
                            case 'groupedServiceDatatest':
                                this.awsApiUrls.groupedServiceData = apiUrl+"getGroupedRecordtest";
                                break;
                            case 'getIndexestest':
                                this.awsApiUrls.getIndexes = apiUrl+"getIndexestest";
                                break;
                            case 'recordInfotest':
                                this.awsApiUrls.recordInfo = apiUrl+"getRecordInfotest";
                                break;
                        }
                        let data={
                            apiId:apiId,
                            resourceId:resourceId
                        };
                        this._awsdata.enableCorsForApi(data).subscribe(res=>{ 
                        })
                    });
                }
                
                let newstart = start + 1;
                this.createAwsApi(lambdaFuns, limit, newstart);
            } else {
                this.writeApiJson();
            }
        }, this.intervalValue);
    }

    writeApiJson(){
        let data={
            apiUrls: this.awsApiUrls
        };
        this._awsdata.creatApisJsonFile(data).subscribe((data)=>{
            this.setupAwsStaticWebsite();
        },function(error){
            this.isloading = false;
            this.errorMessage = 'Problem in creating API Json file.';
        })
    }

    setupAwsStaticWebsite() {
        var data = {
            websiteBucket: this.awsbuckets.websiteSetupbucket
        };
        this._awsdata.setupAwsStaticWebsite(data).subscribe(res => {
            this.stepValue = 4;
            this.isloading = false;
            this.websiteEndPoint=res;
        }, error => {
            this.isloading = false;
            this.errorMessage = 'Problem in setup AWS static Website.';
        })
    }

    enableCors(resourceId='gg3opf',apiId='oykjk3y3ah'){
        let data={
            apiId:apiId,
            resourceId:resourceId
        };
        this._awsdata.enableCorsForApi(data).subscribe(res=>{ 
            console.log(res);
        },error=>{
            console.log(error);
        })
    }
}
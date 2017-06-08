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
    intervalValue:number=60000;
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
            console.log(error);
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
                console.log('function getEs point called');
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

    createTempESIndexAndMapping(){
        let data = {
                'DomainId': "356967975209/testing-aws-billing",
                'ARN': "arn:aws:es:us-east-1:356967975209:domain/testing-aws-billing",
                'domainName': "testing-aws-billing",
                'Endpoint': "search-testing-aws-billing-ov7obkvwgtl6e5hwrzyqcg74ey.us-east-1.es.amazonaws.com",
                'indexName': "awsbilling",
                'doctype': "aws-billing"
            }
            this.esDomainStatus={
                "Endpoint":"search-testing-aws-billing-ov7obkvwgtl6e5hwrzyqcg74ey.us-east-1.es.amazonaws.com"
            };
            this.es={
                "index":"awsbilling",
                "doctype":"aws-billing"
            };
            this._awsdata.createESIndex(data).subscribe(res => {
                this.stepValue = 3;
                this.isloading = false;
            }, err => {
                this.isloading = false;
                this.errorMessage = 'Problem in creating index for elastic search.';
            })
    }

    createTempSave(){
        this.isloading = true;
        this.awsbuckets={
            "lambdazipbucket": "testingawslambdafunction",
            "billingCsvbucket": "testingawsbilling",
            "websiteSetupbucket": "testing-aws-billing"
        }
        this.es={
                "index":"awsbilling",
                "doctype":"aws-billing"
            };
        this.esDomainStatus={
                "Endpoint":"search-testing-aws-billing-ov7obkvwgtl6e5hwrzyqcg74ey.us-east-1.es.amazonaws.com"
            };
        let data = {
            'buckets': this.awsbuckets,
            'indexName': this.es.index,
            'doctype': this.es.doctype,
            'esHost': this.esDomainStatus.Endpoint
        }

        this._awsdata.uploadLambdaAndSeupWebsite(data).subscribe(res => {
            console.log(res);
            this.stepValue = 4;
            this.isloading = false;
        }, function (err) {
            console.log(err);
            this.isloading = false;
            this.errorMessage = 'Problem in upload lambda and seup website.';
        })

    }

    validateBuckets() {
        if (this.awsbuckets.lambdazipbucket !== '' && this.awsbuckets.billingCsvbucket !== '' && this.awsbuckets.websiteSetupbucket !== '') {
            return false;
        } else {
            return true;
        }
    }

    save() {
        let data = {
            'buckets': this.awsbuckets,
            'indexName': this.es.index,
            'doctype': this.es.doctype,
            'esHost': this.esDomainStatus.DomainStatus.Endpoint
        }

        this._awsdata.uploadLambdaAndSeupWebsite(data).subscribe(res => {
            console.log(res);
            this.stepValue = 4;
            this.isloading = false;
        }, function (err) {
            console.log(err);
            this.isloading = false;
            this.errorMessage = 'Problem in upload lambda and seup website.';
        })


    }
}
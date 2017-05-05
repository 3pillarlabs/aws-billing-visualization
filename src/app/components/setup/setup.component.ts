import { Component,Output,EventEmitter } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';

@Component({
    moduleId: module.id,
    selector: 'firest-time-setup',
    templateUrl: 'setup.component.html',
    styleUrls: ['setup.component.css']
})
export class SetupComponent {
    isElsticConnected: boolean = false;
    availableAccountName: string;
    accountNameLoader: boolean;
    awsloader: boolean;
    finishloader: boolean;
    stepstaps: any = {
        'one': {
            'error': true,
            'msg': '',
            'done':false
        },
        'two': {
            'error': true,
            'msg': '',
            'done':false
        },
        'three': {
            'error': true,
            'msg': '',
            'done':false
        },
        'four': {
            'error': true,
            'msg': '',
            'done':false
        }
    }
    model: any = {
        'awsbucket': '',
        'awskey': '',
        'awssecret': ''
    }
    @Output() setupDone: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(private _awsdata: AwsdataService) {
        this._awsdata.verifyElasticConnection().subscribe((response) => {
            this.isElsticConnected = response;
            this.stepstaps.one.error = false;
            this.stepstaps.one.msg = '';
            this.stepstaps.one.done = true;
        }, (error) => {
            this.stepstaps.one.error = true;
            this.stepstaps.one.msg = 'Unable to connect.';
            this.stepstaps.one.done = false;
        })
    }

    checkAccountNameAvailability(accountname: string): void {
        if (accountname != '') {
            this.stepstaps.two.msg = '';
            this.accountNameLoader = true;
            var index = accountname.trim();
            this._awsdata.verifyElasticIndex(index).subscribe((res) => {
                if (res == true) {
                    //Index already Exits
                    this.availableAccountName = '';
                    this.stepstaps.two.error = true;
                    this.stepstaps.two.msg = 'Account name already exists. Try with new name.';
                    this.stepstaps.two.done = false;
                } else {
                    //Index Available
                    this.availableAccountName = index;
                    this.stepstaps.two.error = false;
                    this.stepstaps.two.msg = '';
                    this.stepstaps.two.done = true;
                }
                this.accountNameLoader = false;
            }, (error) => {
                this.availableAccountName = '';
                this.stepstaps.two.error = true;
                this.stepstaps.two.msg = 'Unable to connect.';
                this.stepstaps.two.done = false;
            })
        } else {
            this.stepstaps.two.error = true;
            this.stepstaps.two.msg = 'Please enter account name.';
            this.stepstaps.two.done = false;
        }
    }



    checkAwsConnectivity() {
        this.stepstaps.three.msg = '';
        this.awsloader = true;
        if (this.model.awsbucket != '' && this.model.awskey != '' && this.model.awssecret != '') {
            this._awsdata.verifyAndSaveAWSData(this.model).subscribe((data) => {
                this.stepstaps.three.error = false;
                this.stepstaps.three.msg = '';
                this.stepstaps.three.done = true;
                this.awsloader = false;
            }, (error) => {
                this.awsloader = false;
                this.stepstaps.three.error = true;
                this.stepstaps.three.msg = error;
                this.stepstaps.three.done = false;
            });
        } else {
            this.awsloader = false;
            this.stepstaps.three.error = true;
            this.stepstaps.three.msg = 'Please enter input value.';
            this.stepstaps.three.done = false;
        }

    }

    onFinishSetup(): void {
        this.finishloader = true;
        var data={
            file:'samplefile.csv',
            bucketname: this.availableAccountName,
            awsdata: this.model
        }
        this._awsdata.uploadSampleFile(data).subscribe(res => {
            this.setupDone.emit(true);
            this.finishloader = false;
        }, error => {
            this.setupDone.emit(true);
            this.finishloader = false;
        })
        
    }

    onCancelSetup():void{
        this.setupDone.emit(true);
    }
}
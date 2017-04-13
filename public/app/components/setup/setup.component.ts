import { Component } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';

@Component({
    moduleId: module.id,
    selector: 'firest-time-setup',
    templateUrl: 'setup.component.html',
    styleUrls: ['setup.component.css']
})
export class SetupComponent {
    isElsticConnected:boolean = false;
    availableAccountName:string;
    accountNameLoader:boolean;
    awsloader:boolean;
    finishloader:boolean;
    stepstaps:any={
        'one':{
            'error': true,
            'msg':''
        },
        'two':{
            'error': true,
            'msg':''
        },
        'three':{
            'error': true,
            'msg':''
        },
        'four':{
            'error': true,
            'msg':''
        }
    }
    model:any={
        'awsbucket':'',
        'awskey':'',
        'awssecret':''
    }
    constructor(private _awsdata: AwsdataService) { 
        this._awsdata.verifyElasticConnection().subscribe((response) => {
			this.isElsticConnected = response;
            this.stepstaps.one.error=false;
            this.stepstaps.one.msg='';
		}, (error) => {
			this.stepstaps.one.error=true;
            this.stepstaps.one.msg='Unable to connect.';
		})
    }

    checkAccountNameAvailability(accountname:string):void{
        if(accountname!=''){
            this.stepstaps.two.msg='';
            this.accountNameLoader=true;
            var index=accountname.trim();
            this._awsdata.verifyElasticIndex(index).subscribe((res)=>{
                if(res==true){
                    //Index already Exits
                    this.availableAccountName='';
                    this.stepstaps.two.error=true;
                    this.stepstaps.two.msg='Account name already exists. Try with new name.';
                }else{
                    //Index Available
                    this.availableAccountName=index;
                    this.stepstaps.two.error=false;
                    this.stepstaps.two.msg='';
                }
                console.log(this.stepstaps);
                this.accountNameLoader=false;
            },(error)=>{
                this.availableAccountName='';
                this.stepstaps.two.error=true;
                this.stepstaps.two.msg='Unable to connect.';
            })
        }else{
            this.stepstaps.one.error=true;
            this.stepstaps.one.msg='Please enter account name value.';
        }
    }

    

    checkAwsConnectivity() {
        this.stepstaps.three.msg='';
        this.awsloader=true;
        if(this.model.awsbucket!='' && this.model.awskey!='' && this.model.awssecret!=''){
                this._awsdata.verifyAndSaveAWSData(this.model).subscribe((data) => {
                this.stepstaps.three.error=false;
                this.stepstaps.three.msg='';
                this.awsloader=false;
            }, (error) => {
                this.awsloader=false;
                this.stepstaps.three.error=true;
                this.stepstaps.three.msg=error;
            });
        }else{
            this.awsloader=false;
            this.stepstaps.three.error=true;
            this.stepstaps.three.msg='Please enter input value.';
        }
        
    }

    onFinishSetup(uploadSamplefile:any):void{
        this.finishloader=true;
        console.log(uploadSamplefile);
    }
}
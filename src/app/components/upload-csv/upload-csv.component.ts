import { Component, Output, EventEmitter, Input } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';
import { Http, Headers } from '@angular/http';
const URL = './';
import { Observable } from 'rxjs';
import { FileUploader } from 'ng2-file-upload';
import { Router } from '@angular/router';

@Component({
    selector: 'app-upload-csv',
    templateUrl: './upload-csv.component.html',
    styleUrls: ['./upload-csv.component.css'],
    providers: [AwsdataService]
})
export class UploadCsvComponent {
    public uploader: FileUploader = new FileUploader({ url: 'http://localhost:3000/api/upload' });

    isElsticConnected: boolean = false;
    availableAccountName: string;
    accountNameLoader: boolean;
    isloading: boolean;
    counter: number = 0;

    stepstaps: any = {
        'one': {
            'error': true,
            'msg': '',
            'done': false
        },
        'two': {
            'error': true,
            'msg': '',
            'done': false
        },
        'three': {
            'error': true,
            'msg': '',
            'done': false
        },
        'four': {
            'error': true,
            'msg': '',
            'done': false
        }
    }
    model: any = {
        'awsbucket': '',
        'awskey': '',
        'awssecret': ''
    }

    @Output() setupDone: EventEmitter<boolean> = new EventEmitter<boolean>();
    constructor(private _awsdata: AwsdataService, private _http: Http, private router: Router) {
        this.isloading = false;

        this.uploader.onCompleteAll = () => {
            this.uploader.progress = 100;
            this.showloader(false);
            (function (router) {
                setTimeout(function () {
                    router.navigate(['']);
                }, 100)
            })(this.router);
        };

        this.uploader.onCompleteItem = (item: any, response: any, status: any, headers: any) => {
            console.log("uploaded:", item, status);
        };

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

    upload(event) {
        this.showloader(true);
        this.uploader.progress = 0;
        for (var j = 0; j <= 60; j++) {
            if (this.uploader.progress < 100) {
                this.uploader.progress = j + 0.1;
            }
        } 

        this.uploader.uploadAll();
    }   

    showloader(flag: boolean) {
        this.isloading = flag;
    }
}
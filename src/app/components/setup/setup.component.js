"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require("@angular/core");
var awsdata_service_1 = require("./../../services/awsdata.service");
var awsconfig_1 = require("./awsconfig");
var SetupComponent = (function () {
    function SetupComponent(_awsdata) {
        var _this = this;
        this._awsdata = _awsdata;
        this.isElsticConnected = false;
        this.stepstaps = {
            'one': {
                'error': true,
                'msg': ''
            },
            'two': {
                'error': true,
                'msg': ''
            },
            'three': {
                'error': true,
                'msg': ''
            },
            'four': {
                'error': true,
                'msg': ''
            }
        };
        this.model = new awsconfig_1.AwsConfig("", "", "");
        this._awsdata.verifyElasticConnection().subscribe(function (response) {
            _this.isElsticConnected = response;
            _this.stepstaps.one.error = false;
            _this.stepstaps.one.msg = '';
        }, function (error) {
            _this.stepstaps.one.error = true;
            _this.stepstaps.one.msg = 'Unable to connect.';
        });
    }
    SetupComponent.prototype.checkAccountNameAvailability = function (accountname) {
        var _this = this;
        if (accountname != '') {
            this.stepstaps.two.msg = '';
            this.accountNameLoader = true;
            var index = accountname.trim();
            this._awsdata.verifyElasticIndex(index).subscribe(function (res) {
                if (res == true) {
                    //Index already Exits
                    _this.availableAccountName = '';
                    _this.stepstaps.two.error = true;
                    _this.stepstaps.two.msg = 'Account name already exists. Try with new name.';
                }
                else {
                    //Index Available
                    _this.availableAccountName = index;
                    _this.stepstaps.two.error = false;
                    _this.stepstaps.two.msg = '';
                }
                console.log(_this.stepstaps);
                _this.accountNameLoader = false;
            }, function (error) {
                _this.availableAccountName = '';
                _this.stepstaps.two.error = true;
                _this.stepstaps.two.msg = 'Unable to connect.';
            });
        }
        else {
            this.stepstaps.one.error = true;
            this.stepstaps.one.msg = 'Please enter account name value.';
        }
    };
    SetupComponent.prototype.checkAwsConnectivity = function () {
        var _this = this;
        this.stepstaps.three.msg = '';
        this.awsloader = true;
        if (this.model.awsbucket != '' && this.model.awskey != '' && this.model.awssecret != '') {
            this._awsdata.verifyAndSaveAWSData(this.model).subscribe(function (data) {
                _this.stepstaps.three.error = false;
                _this.stepstaps.three.msg = '';
                _this.awsloader = false;
            }, function (error) {
                _this.awsloader = false;
                _this.stepstaps.three.error = true;
                _this.stepstaps.three.msg = error;
            });
        }
        else {
            this.awsloader = false;
            this.stepstaps.three.error = true;
            this.stepstaps.three.msg = 'Please enter input value.';
        }
    };
    SetupComponent.prototype.onFinishSetup = function (uploadSamplefile) {
        this.finishloader = true;
        console.log(uploadSamplefile);
    };
    return SetupComponent;
}());
SetupComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'setup',
        templateUrl: 'setup.component.html',
        styleUrls: ['setup.component.css']
    }),
    __metadata("design:paramtypes", [awsdata_service_1.AwsdataService])
], SetupComponent);
exports.SetupComponent = SetupComponent;
//# sourceMappingURL=setup.component.js.map
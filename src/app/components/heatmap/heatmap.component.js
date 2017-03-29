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
var config_service_1 = require("./../../services/config.service");
var HeatmapComponent = (function () {
    function HeatmapComponent(_awsregions, _config) {
        this._awsregions = _awsregions;
        this._config = _config;
        this.isloading = new core_1.EventEmitter();
        this.selectRegion = new core_1.EventEmitter();
        this.zoom = 1;
        this.lat = -34.397;
        this.lng = 150.644;
        this.heatmapdata = [];
        this.markers = [];
        this.heatmaps = [];
        this.company = this._config.company;
    }
    HeatmapComponent.prototype.ngOnInit = function () {
        this.map = new google.maps.Map(document.getElementById('map'), {
            zoom: this.zoom,
            center: { lat: this.lat, lng: this.lng }
        });
    };
    HeatmapComponent.prototype.ngOnChanges = function () {
        var awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate
        };
        this.drawHeatmapAndMarker(awsdata);
    };
    HeatmapComponent.prototype.drawHeatmapAndMarker = function (awsdata) {
        var _this = this;
        this._awsregions.getAwsRegions(awsdata).subscribe(function (data) {
            if (data.length > 0) {
                var maxintensity = data[0].totalcost; // Set Max intensity on the basis of region total cost
                for (var _i = 0, data_1 = data; _i < data_1.length; _i++) {
                    var region = data_1[_i];
                    if (region.totalcost > 0) {
                        var heatmaplatlong = { location: new google.maps.LatLng(region.lat, region.lng), weight: region.totalcost };
                        _this.heatmapdata.push(heatmaplatlong);
                        _this.addMarker(region);
                    }
                }
                _this.addHeatmap(maxintensity);
            }
            else {
                _this.removeHeatmap();
                _this.removeMarker();
            }
            _this.isloading.emit(false);
        });
    };
    HeatmapComponent.prototype.addHeatmap = function (maxintensity) {
        this.heatmap = new google.maps.visualization.HeatmapLayer({
            data: this.heatmapdata,
            map: this.map,
            radius: 20,
            maxIntensity: maxintensity
        });
        this.heatmaps.push(this.heatmap);
    };
    HeatmapComponent.prototype.removeHeatmap = function () {
        for (var i = 0; i < this.heatmaps.length; i++) {
            this.heatmaps[i].setMap(null);
        }
    };
    HeatmapComponent.prototype.addMarker = function (region) {
        var _this = this;
        if (region) {
            var marker = new google.maps.Marker({
                position: { lat: region.lat, lng: region.lng },
                map: this.map,
                title: region.name,
                code: region.code
            });
            this.markers.push(marker);
            var infowindowcontent = '<div id="content"><p><label>Region:</label>' + region.name + '</p><p><p><label>Code:</label>' + region.code + '</p><p><label>Total Resouces:</label>' + region.totalresource + '</p><p><label>Total billing Cost:</label>$' + region.totalcost + '</p></div>';
            var infowindow = new google.maps.InfoWindow({
                content: infowindowcontent
            });
            marker.addListener('click', function () {
                _this.isloading.emit(true);
                _this.selectRegion.emit(marker.code);
                infowindow.open(_this.map, marker);
            });
        }
    };
    HeatmapComponent.prototype.removeMarker = function () {
        for (var i = 0; i < this.markers.length; i++) {
            this.markers[i].setMap(null);
        }
    };
    return HeatmapComponent;
}());
HeatmapComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'aws-billing-heatmap',
        templateUrl: 'heatmap.component.html',
        styles: ["#map {\n\t\t\t\t   \theight: 300px;\n\t\t\t\t   \twidth:600px;\n\t\t\t\t    }\n      \t\t"],
        inputs: ['startdate', 'enddate', 'selectedRegion'],
        outputs: ['isloading', 'selectRegion']
    }),
    __metadata("design:paramtypes", [awsdata_service_1.AwsdataService, config_service_1.ConfigService])
], HeatmapComponent);
exports.HeatmapComponent = HeatmapComponent;
//# sourceMappingURL=heatmap.component.js.map
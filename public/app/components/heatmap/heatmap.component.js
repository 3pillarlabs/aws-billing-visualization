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
var HeatmapComponent = (function () {
    function HeatmapComponent() {
        this.zoom = 1;
        this.lat = -34.397;
        this.lng = 150.644;
    }
    HeatmapComponent.prototype.ngOnInit = function () {
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: this.zoom,
            center: { lat: this.lat, lng: this.lng }
        });
        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: this.getPoints(),
            map: map
        });
    };
    HeatmapComponent.prototype.getPoints = function () {
        return [
            { location: new google.maps.LatLng(1.338659, 103.647403), weight: 0.5 },
            { location: new google.maps.LatLng(37.566535, 126.977969), weight: 5 },
            { location: new google.maps.LatLng(32.780106, -92.412277), weight: 8000 },
            { location: new google.maps.LatLng(-33.86882, 151.209296), weight: 10 },
            { location: new google.maps.LatLng(-23.55052, -46.633309), weight: 20 },
            { location: new google.maps.LatLng(50.109492, 8.673965), weight: 500 },
            { location: new google.maps.LatLng(43.804133, -120.554201), weight: 2 },
            { location: new google.maps.LatLng(40.694654, -80.953948), weight: 600 },
            { location: new google.maps.LatLng(35.689487, 139.691706), weight: 200 },
            { location: new google.maps.LatLng(37.431573, -78.656894), weight: 400 }
        ];
    };
    ;
    return HeatmapComponent;
}());
HeatmapComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'aws-billing-heatmap',
        templateUrl: 'heatmap.component.html',
        styles: ["#map {\n\t\t\t\t   \theight: 300px;\n\t\t\t\t   \twidth:500px;\n\t\t\t\t    }\n      \t\t"]
    }),
    __metadata("design:paramtypes", [])
], HeatmapComponent);
exports.HeatmapComponent = HeatmapComponent;
//# sourceMappingURL=heatmap.component.js.map
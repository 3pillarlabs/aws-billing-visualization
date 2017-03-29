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
var HeaderComponent = (function () {
    function HeaderComponent(_awsdata, _config) {
        this._awsdata = _awsdata;
        this._config = _config;
        this.company = this._config.company;
    }
    HeaderComponent.prototype.bootstrapTour = function () {
        var tour = new Tour({
            steps: [
                {
                    element: "#availabledata",
                    title: "Available Data",
                    placement: "bottom",
                    content: "A quick overview of current system being visualized"
                },
                {
                    element: "#datefilter",
                    title: "Date Filters",
                    placement: "bottom",
                    content: "Select a date range to filter the data and simply hit \"Go\". Will only allow selection of date where data is avialable."
                },
                {
                    element: "#d3map",
                    title: "Regional usage distribution",
                    placement: "right",
                    content: "In the selected date range, show the usage in each geographical region. A region in green represent low usage whereas red is the region with high usage of resoruces."
                },
                {
                    element: "#d3piechart",
                    title: "Usage by product categories",
                    placement: "left",
                    content: "In selected date range and for selected region (if clicked from geographical map), represents usage distribution among various products."
                },
                {
                    element: "#datatable",
                    title: "Detailed Report",
                    placement: "top",
                    content: "Detailed report of usage using date range and selected region (if selected from geographical map). You can also filter by operation to see more specific records only."
                }
            ],
            backdrop: true,
            autoscroll: true,
            storage: false
        });
        // Initialize the tour
        tour.init();
        tour.start(true);
    };
    return HeaderComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Number)
], HeaderComponent.prototype, "totalRecord", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], HeaderComponent.prototype, "lastupdated", void 0);
HeaderComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'aws-billing-header',
        templateUrl: 'header.component.html'
    }),
    __metadata("design:paramtypes", [awsdata_service_1.AwsdataService, config_service_1.ConfigService])
], HeaderComponent);
exports.HeaderComponent = HeaderComponent;
//# sourceMappingURL=header.component.js.map
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
var d3 = require("d3");
var awsdata_service_1 = require("./../../services/awsdata.service");
var config_service_1 = require("./../../services/config.service");
var D3mapComponent = (function () {
    function D3mapComponent(element, _awsService, _config) {
        this.element = element;
        this._awsService = _awsService;
        this._config = _config;
        this.isloading = new core_1.EventEmitter();
        this.margin = { top: 80, right: 0, bottom: 0, left: 0 };
        this.rotate = 0; //60;
        this.maxlat = 83;
        this.worldMapJson = "app/components/d3map/worldmap.json";
        this.legendRectSize = 22;
        this.appdataloaded = false;
        this.selectRegion = new core_1.EventEmitter();
        this.colorRange = ["#ffe6e6", "#800000"];
        this.company = this._config.company;
    }
    D3mapComponent.prototype.ngAfterViewInit = function () {
        this.parentNativeElement = this.element.nativeElement.querySelector('div#awsbillingD3Map');
        this.parentNativeElementLegend = this.element.nativeElement.querySelector('div#awsbillingD3MapLegend');
        this.width = this.parentNativeElement.clientWidth - 140;
        this.height = this.parentNativeElement.clientHeight;
        this.legendwidth = this.parentNativeElementLegend.clientWidth;
        this.legendheight = this.parentNativeElementLegend.clientHeight;
        this.initSvg();
    };
    D3mapComponent.prototype.ngOnChanges = function () {
        if (this.appcomponentdata.allServiceData) {
            this.parseD3Data(this.appcomponentdata.allServiceData);
        }
    };
    D3mapComponent.prototype.parseD3Data = function (data) {
        if (data && data.aggregations) {
            if (data.aggregations.AvailabilityRegion) {
                var regionData = {};
                var maxval = 0;
                var priceArr = [0];
                for (var _i = 0, _a = data.aggregations.AvailabilityRegion.buckets; _i < _a.length; _i++) {
                    var region = _a[_i];
                    if (region.TotalBlendedCost.value > 0) {
                        if (maxval < region.TotalBlendedCost.value) {
                            maxval = Math.ceil(region.TotalBlendedCost.value);
                        }
                        priceArr.push(Math.ceil(region.TotalBlendedCost.value));
                        regionData[region.key] = {
                            name: region.key,
                            totalcost: parseFloat(region.TotalBlendedCost.value).toFixed(2),
                            totalresource: region.doc_count
                        };
                    }
                }
                regionData['maxval'] = maxval;
                priceArr.sort(function (a, b) { return a - b; });
                regionData['pricedata'] = priceArr;
                this.svg.html("");
                this.legendSvg.html("");
                this.getProjection();
                this.getPath();
                this.getTooltip();
                this.drawMap(regionData);
            }
        }
    };
    D3mapComponent.prototype.getRegionsData = function () {
        var _this = this;
        var awsdata = {
            company: this.company,
            strdate: this.appcomponentdata.startdate,
            enddate: this.appcomponentdata.enddate
        };
        this._awsService.getRegionsData(awsdata).subscribe(function (regionsData) {
            _this.parseD3Data(regionsData);
        }, function (error) {
            console.log(error);
            _this.isloading.emit(false);
        });
    };
    D3mapComponent.prototype.initSvg = function () {
        if (this.parentNativeElement !== null) {
            this.svg = d3.select(this.parentNativeElement)
                .append('svg')
                .attr("width", '100%')
                .attr("height", '100%')
                .attr('viewBox', '0 0 ' + Math.min(this.width, this.height) + ' ' + Math.min(this.width, this.height))
                .attr('preserveAspectRatio', 'xMidYMid meet')
                .append("g")
                .append("g")
                .attr("width", this.width)
                .attr("height", this.height);
            this.legendSvg = d3.select(this.parentNativeElementLegend).append("svg")
                .attr("class", "legend")
                .attr("width", "100%")
                .attr("height", "100%")
                .attr('viewBox', '0 0 ' + Math.min(this.legendwidth, this.legendheight) + ' ' + Math.min(this.legendwidth, this.legendheight))
                .attr('preserveAspectRatio', 'xMinYMin meet');
        }
    };
    D3mapComponent.prototype.getProjection = function () {
        this.projection = d3.geoMercator()
            .rotate([this.rotate, 0])
            .scale(1)
            .translate([this.width / 2, this.height / 2]);
        // set up the scale extent and initial scale for the projection
        var b = this.mercatorBounds(this.projection, this.maxlat), s = this.width / (b[1][0] - b[0][0]), scaleExtent = [s, 10 * s];
        this.projection
            .scale(scaleExtent[0]);
    };
    D3mapComponent.prototype.getPath = function () {
        this.path = d3.geoPath()
            .projection(this.projection);
    };
    // find the top left and bottom right of current projection
    D3mapComponent.prototype.mercatorBounds = function (projection, maxlat) {
        var yaw = projection.rotate()[0], xymax = projection([-yaw + 180 - 1e-6, -maxlat]), xymin = projection([-yaw - 180 + 1e-6, maxlat]);
        return [xymin, xymax];
    };
    D3mapComponent.prototype.getTooltip = function () {
        this.tooltipGroup = d3.select(this.parentNativeElement)
            .append("div")
            .attr("class", "tooltipcss").style("opacity", 0);
    };
    D3mapComponent.prototype.drawMap = function (data) {
        var _this = this;
        var that = this;
        d3.json(this.worldMapJson, function (error, collection) {
            if (error)
                throw error;
            _this.selectionMap = _this.svg.selectAll("path")
                .data(collection.features);
            var color = d3.scaleLinear()
                .domain([0, data.maxval])
                .range(_this.colorRange);
            _this.legendSvg.html('');
            var legendG = _this.legendSvg.selectAll("g")
                .data(color.ticks(5))
                .enter()
                .append("g")
                .attr('class', 'legend')
                .attr('transform', function (d, i) {
                var height = _this.legendRectSize;
                var vert = (4 - i) * height;
                return 'translate(20,' + vert + ')';
            });
            legendG.append("rect")
                .attr("width", _this.legendRectSize)
                .attr("height", _this.legendRectSize)
                .style("fill", function (d, i) { return color(d); });
            legendG.append("text")
                .attr("x", _this.legendRectSize + 10)
                .attr("y", function (d, i) { return i + 10; })
                .style('font-size', '11px')
                .text(function (d) { return "$" + d; });
            _this.selectionMap.enter().append("path")
                .attr("class", function (d) { return "subunit " + d.id; })
                .attr("d", _this.path)
                .attr("fill", "#ccc")
                .attr("stroke", "#fff");
            _this.svg.append("g")
                .attr("class", "bubble")
                .selectAll("circle")
                .data(collection.features)
                .enter().append("circle")
                .attr("transform", function (d) {
                return "translate(" + _this.path.centroid(d) + ")";
            });
            _this.svg.selectAll("circle")
                .attr("r", function (d) {
                if (data.hasOwnProperty(d.id)) {
                    return 12;
                }
            })
                .attr("circleClicked", "No")
                .attr("class", function (d) {
                if (data.hasOwnProperty(d.id)) {
                    return "resource-region";
                }
            })
                .style("cursor", "pointer")
                .attr("fill", function (d) {
                if (data.hasOwnProperty(d.id)) {
                    return color(data[d.id].totalcost);
                }
            })
                .on("click", function (d, i) {
                if (d3.select(this).attr("circleClicked") == "No") {
                    d3.selectAll("[circleClicked=Yes]")
                        .attr("circleClicked", "No")
                        .transition()
                        .duration(500)
                        .attr("stroke", "none");
                    d3.select(this)
                        .attr("circleClicked", "Yes")
                        .transition()
                        .duration(500)
                        .attr("stroke", "blue")
                        .attr("stroke-width", 2);
                    that.selectRegion.emit(d.id);
                }
                else if (d3.select(this).attr("circleClicked") == "Yes") {
                    d3.select(this)
                        .attr("circleClicked", "No")
                        .transition()
                        .duration(500)
                        .attr("stroke", "none");
                    that.selectRegion.emit("");
                }
            })
                .on("mouseover", function (d) {
                var tooltext = d.properties.name + "<br/>"
                    + "Region : " + d.id + "<br/>";
                if (data.hasOwnProperty(d.id)) {
                    tooltext = d.properties.name + "<br/>"
                        + "Region : " + data[d.id].name + "<br/>"
                        + "Total Hours : " + data[d.id].totalresource + "<br/>"
                        + "Total Cost : $" + data[d.id].totalcost;
                }
                _this.tooltipGroup.transition()
                    .duration(200)
                    .style("opacity", .9);
                _this.tooltipGroup.html(tooltext)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY + 20) + "px");
            })
                .on("mousemove", function (d) {
                _this.tooltipGroup
                    .style("top", (d3.event.pageY + 20) + "px")
                    .style("left", (d3.event.pageX - 100) + "px");
            })
                .on("mouseout", function (d) {
                _this.tooltipGroup.transition()
                    .duration(500)
                    .style("opacity", 0);
            });
        });
    };
    return D3mapComponent;
}());
D3mapComponent = __decorate([
    core_1.Component({
        moduleId: module.id,
        selector: 'd3-map',
        template: "<div id=\"awsbillingD3Map\"></div><div id=\"awsbillingD3MapLegend\"></div>",
        styles: ["#awsbillingD3Map{\n                  width:80%;\n                  height:48%;\n                  float:left;\n                }\n\n                #awsbillingD3MapLegend{\n                    width:20%;\n                    height:48%;\n                    float:left;\n                }"],
        inputs: ['appcomponentdata'],
        outputs: ['isloading', 'selectRegion']
    }),
    __metadata("design:paramtypes", [core_1.ElementRef,
        awsdata_service_1.AwsdataService,
        config_service_1.ConfigService])
], D3mapComponent);
exports.D3mapComponent = D3mapComponent;
//# sourceMappingURL=d3map.component.js.map
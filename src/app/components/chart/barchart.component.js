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
var D3 = require("d3");
var BarchartComponent = (function () {
    function BarchartComponent(element, _awsdata, _config) {
        this.element = element;
        this._awsdata = _awsdata;
        this._config = _config;
        this.selectProduct = new core_1.EventEmitter();
        this.margin = { top: 10, right: 30, bottom: 100, left: 60 };
        this.dataset = [];
        this.barheight = 20;
        this.productDataSet = {};
        this.company = this._config.company;
    }
    BarchartComponent.prototype.ngOnChanges = function () {
        if (this.appcomponentdata.allServiceData) {
            this.parsePieChartData(this.appcomponentdata.allServiceData);
        }
    };
    BarchartComponent.prototype.ngAfterViewInit = function () {
        this.setup();
    };
    BarchartComponent.prototype.onResize = function () {
        this.setup();
        this.buildSVG();
    };
    BarchartComponent.prototype.parsePieChartData = function (data) {
        if (data && data.aggregations) {
            if (data.aggregations.product_name) {
                var productdata = [];
                for (var _i = 0, _a = data.aggregations.product_name.buckets; _i < _a.length; _i++) {
                    var product = _a[_i];
                    var TotalBlendedCost = Math.round(product.TotalBlendedCost.value);
                    var originalCost = (product.TotalBlendedCost.value).toFixed(2);
                    if (TotalBlendedCost > 0) {
                        var productname = product.key.replace(/AWS |Amazon /gi, "");
                        var productTag = productname.replace(/[ ()]/g, '');
                        var productdoc = {
                            'name': productname,
                            'totalcost': TotalBlendedCost,
                            'totalresource': product.doc_count,
                            'orignalname': product.key,
                            'producttag': productTag,
                            'originalCost': originalCost
                        };
                        this.productDataSet[productname] = {
                            'name': productname,
                            'totalcost': TotalBlendedCost,
                            'totalresource': product.doc_count,
                            'orignalname': product.key,
                            'producttag': productTag,
                            'originalCost': originalCost
                        };
                        productdata.push(productdoc);
                    }
                }
                this.dataset = productdata;
                this.setup();
                this.buildSVG();
            }
        }
    };
    BarchartComponent.prototype.getProduct = function (awsdata) {
        var _this = this;
        this._awsdata.getUniqueProduct(awsdata).subscribe(function (data) {
            _this.parsePieChartData(data);
        }, function (error) {
            console.log(error);
        });
    };
    BarchartComponent.prototype.setup = function () {
        var _this = this;
        D3.select(this.element.nativeElement.querySelector('svg#awsbillingbarchart')).html("");
        this.width = parseInt(D3.select(this.element.nativeElement.querySelector('div#awsbillingbarchartcontainer')).style("width")) - this.margin.left - this.margin.right,
            this.height = parseInt(D3.select(this.element.nativeElement.querySelector('div#awsbillingbarchartcontainer')).style("height")) - this.margin.top - this.margin.bottom;
        this.xScale = D3.scaleBand().range([0, this.width]).padding(0.1);
        this.yScale = D3.scaleLinear().range([this.height, 0]);
        this.y1Scale = D3.scaleLinear().range([this.height, 0]);
        this.dollarFormatter = D3.format(",.0f");
        this.percentFormatter = D3.format(".0%");
        this.xAxis = D3.axisBottom(this.xScale);
        this.yAxis = D3.axisLeft(this.yScale).tickFormat(function (d) { return "$" + _this.dollarFormatter(d); });
        this.yAxisRight = D3.axisRight(this.y1Scale).tickFormat(function (d) { return _this.percentFormatter(d); });
        this.color = D3.scaleOrdinal(D3.schemeCategory20);
        this.tooltip = D3.select(this.element.nativeElement.querySelector('div#barcharttoolTip'));
    };
    BarchartComponent.prototype.buildSVG = function () {
        var _this = this;
        var that = this;
        if (this.dataset.length > 0) {
            var tots = D3.sum(this.dataset, function (d) {
                return d.totalcost;
            });
            this.svg = D3.select(this.element.nativeElement.querySelector('svg#awsbillingbarchart'))
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
            this.xScale.domain(this.dataset.map(function (d) { return d.name; }));
            this.yScale.domain([0, D3.max(this.dataset, function (d) { return d.totalcost; })]);
            this.y1Scale.domain([0, D3.max(this.dataset, function (d) { return (d.totalcost / tots); })]);
            // append the rectangles for the bar chart
            this.svg.selectAll(".bar")
                .data(this.dataset)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("rectClicked", "No")
                .attr("productAttrName", function (d, i) { return d.producttag; })
                .attr("x", function (d, i) { return _this.xScale(d.name); })
                .attr("width", this.xScale.bandwidth())
                .attr("y", function (d, i) { return _this.yScale(d.totalcost); })
                .attr("height", function (d) { return _this.height - _this.yScale(d.totalcost); })
                .attr("fill", function (d, i) { return _this.color(i); })
                .on("click", function (d, i) {
                if (D3.select(this).attr("rectClicked") == "No") {
                    D3.selectAll("[rectClicked=Yes]")
                        .attr("rectClicked", "No")
                        .transition()
                        .duration(500)
                        .attr("stroke", "none");
                    D3.select(this)
                        .attr("rectClicked", "Yes")
                        .transition()
                        .duration(500)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .style("opacity", 1);
                    D3.selectAll("[rectClicked=No]")
                        .transition()
                        .duration(500)
                        .style("opacity", .4);
                    D3.selectAll("[productClcked=Yes]")
                        .attr("productClcked", "No")
                        .transition()
                        .duration(500)
                        .style("font-weight", "normal");
                    D3.selectAll("[productClcked=No]").filter("[txtProductAttrName=" + d.producttag + "]")
                        .attr("productClcked", "Yes")
                        .transition()
                        .duration(500)
                        .style("font-weight", "bold");
                    that.selectProduct.emit(d.orignalname);
                }
                else if (D3.select(this).attr("rectClicked") == "Yes") {
                    D3.select(this)
                        .attr("rectClicked", "No")
                        .transition()
                        .duration(500)
                        .attr("stroke", "none");
                    D3.selectAll("[rectClicked=No]")
                        .transition()
                        .duration(500)
                        .style("opacity", 1);
                    D3.selectAll("[productClcked=Yes]").filter("[txtProductAttrName=" + d.producttag + "]")
                        .attr("productClcked", "No")
                        .transition()
                        .duration(500)
                        .style("font-weight", "normal");
                    that.selectProduct.emit("");
                }
            })
                .on("mousemove", function (d, i) {
                _this.tooltip
                    .style("left", D3.event.pageX - 50 + "px")
                    .style("top", D3.event.pageY - 100 + "px")
                    .style("display", "inline-block")
                    .html((d.name) + "<br>" + "$" + (d.originalCost) + "<br/>" + Math.round((d.originalCost / tots) * 100) + '%');
            })
                .on("mouseout", function (d) { _this.tooltip.style("display", "none"); });
            // add the x Axis
            this.svg.append("g")
                .attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxis)
                .selectAll("text")
                .attr("productClcked", "No")
                .attr("txtProductAttrName", function (d, i) { return _this.productDataSet[d].producttag; })
                .style("text-anchor", "end")
                .style("cursor", "pointer")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-50)")
                .on("mousemove", function (d, i) {
                var toolname = "";
                if (_this.productDataSet.hasOwnProperty(d)) {
                    toolname = (d) + "<br>" + "$" + (_this.productDataSet[d].originalCost) + "<br/>" + Math.round((_this.productDataSet[d].originalCost / tots) * 100) + '%';
                }
                else {
                    toolname = (d) + "<br>" + "$0" + "<br/>" + '0%';
                }
                _this.tooltip
                    .style("left", D3.event.pageX - 50 + "px")
                    .style("top", D3.event.pageY - 100 + "px")
                    .style("display", "inline-block")
                    .html(toolname);
            })
                .on("mouseout", function (d) { _this.tooltip.style("display", "none"); })
                .on("click", function (d, i) {
                if (D3.select(this).attr("productClcked") == "No") {
                    D3.selectAll("[productClcked=Yes]")
                        .attr("productClcked", "No")
                        .transition()
                        .duration(500)
                        .style("font-weight", "normal");
                    D3.select(this)
                        .attr("productClcked", "Yes")
                        .transition()
                        .duration(500)
                        .style("font-weight", "bold");
                    D3.selectAll("[rectClicked=Yes]")
                        .attr("rectClicked", "No")
                        .transition()
                        .duration(500)
                        .attr("stroke", "none");
                    D3.selectAll("[rectClicked=No]").filter("[productAttrName=" + that.productDataSet[d].producttag + "]")
                        .attr("rectClicked", "Yes")
                        .transition()
                        .duration(500)
                        .attr("stroke", "black")
                        .attr("stroke-width", 2)
                        .style("opacity", 1);
                    D3.selectAll("[rectClicked=No]")
                        .transition()
                        .duration(500)
                        .style("opacity", .4);
                    that.selectProduct.emit(that.productDataSet[d].orignalname);
                }
                else if (D3.select(this).attr("productClcked") == "Yes") {
                    D3.select(this)
                        .attr("productClcked", "No")
                        .transition()
                        .duration(500)
                        .style("font-weight", "normal");
                    D3.selectAll("[rectClicked=Yes]").filter("[productAttrName=" + that.productDataSet[d].producttag + "]")
                        .attr("rectClicked", "No")
                        .transition()
                        .duration(500)
                        .attr("stroke", "none");
                    D3.selectAll("[rectClicked=No]")
                        .transition()
                        .duration(500)
                        .style("opacity", 1);
                    that.selectProduct.emit("");
                }
            });
            // add the y Axis
            this.svg.append("g")
                .call(this.yAxis);
            this.svg.append("g")
                .attr("transform", "translate(" + this.width + "," + "0)")
                .call(this.yAxisRight);
        }
    };
    return BarchartComponent;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", Object)
], BarchartComponent.prototype, "appcomponentdata", void 0);
__decorate([
    core_1.Output(),
    __metadata("design:type", core_1.EventEmitter)
], BarchartComponent.prototype, "selectProduct", void 0);
BarchartComponent = __decorate([
    core_1.Component({
        selector: 'aws-billing-bar-chart',
        template: '<div id="awsbillingbarchartcontainer"><svg id="awsbillingbarchart" (window:resize)="onResize($event)"></svg><div id="barcharttoolTip"></div></div>',
        styles: ["#awsbillingbarchartcontainer{\n                    width:100%;\n                    height:48%;\n                }\n                #barcharttoolTip {\n                    position: absolute;\n                    display: none;\n                    text-align: center;           \n                    width: 200px;                 \n                    padding: 10px;             \n                    font: 12px sans-serif;        \n                    background: lightsteelblue;   \n                    border: 0px;      \n                    border-radius: 8px;           \n                    pointer-events: none;   \n                    color: #000;\n                    font-weight: bold;\n                    z-index: 1200;      \n                }\n            "]
    }),
    __metadata("design:paramtypes", [core_1.ElementRef, awsdata_service_1.AwsdataService, config_service_1.ConfigService])
], BarchartComponent);
exports.BarchartComponent = BarchartComponent;
//# sourceMappingURL=barchart.component.js.map
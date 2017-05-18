import { Component, Input, Output, EventEmitter, AfterViewInit, ElementRef } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';
import * as D3 from 'd3';

@Component({
    selector: 'aws-billing-bar-chart',
    template: '<div id="awsbillingbarchartcontainer"><svg id="awsbillingbarchart" (window:resize)="onResize($event)"></svg><div id="barcharttoolTip"></div></div>',
    styles: [`#awsbillingbarchartcontainer{
                    width:100%;
                    height:300px;
                }
                #barcharttoolTip {
                    position: absolute;
                    display: none;
                    text-align: center;           
                    width: 200px;                 
                    padding: 10px;             
                    font: 12px sans-serif;        
                    background: lightsteelblue;   
                    border: 0px;      
                    border-radius: 8px;           
                    pointer-events: none;   
                    color: #000;
                    font-weight: bold;
                    z-index: 1200;      
                }                
            `]
})

export class BarchartComponent implements AfterViewInit {
    @Input() appcomponentdata: any;
    @Output() selectProduct: EventEmitter<string> = new EventEmitter<string>();

    private width;
    private height;
    private margin = { top: 20, right: 30, bottom: 100, left: 60 };
    private xScale;
    private yScale;
    private dollarFormatter;
    private yAxis;
    private xAxis;
    public dataset = [];
    private svg;
    private barheight: number = 20;
    private color;
    private tooltip;
    private y1Scale;
    private yAxisRight;
    private percentFormatter;
    productDataSet = {};
    tickformat:any='';

    constructor(private element: ElementRef, private _awsdata: AwsdataService) {

    }

    ngOnChanges() {
        if (this.appcomponentdata.allServiceData) {
            this.parsePieChartData(this.appcomponentdata.allServiceData);
        }
    }

    ngAfterViewInit(): void {
        this.setup();
    }

    onResize(): void {
        this.setup();
        this.buildSVG();
    }

    parsePieChartData(data: any): void {
        if (data && data.aggregations) {
            if (data.aggregations.product_name) {
                let productdata = [];
                for (let product of data.aggregations.product_name.buckets) {
                    let TotalBlendedCost = Math.round(product.TotalBlendedCost.value);
                    let originalCost = (product.TotalBlendedCost.value).toFixed(2);
                    if (TotalBlendedCost > 0) {
                        var productname = product.key.replace(/AWS |Amazon /gi, "");
                        let productTag = productname.replace(/[ ()]/g, '');
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
                        }

                        productdata.push(productdoc);

                    }
                }
                this.dataset = productdata;
                this.setup();
                this.buildSVG();
            }
        }
    }


    public getProduct(awsdata: any) {
        this._awsdata.getUniqueProduct(awsdata).subscribe((data) => {
            this.parsePieChartData(data);
        }, (error) => {
            console.log(error);
        });
    }


    // gridlines in y axis function
    make_y_gridlines() {
        return D3.axisLeft(this.yScale)
    }


    setup(): void {
        D3.select(this.element.nativeElement.querySelector('svg#awsbillingbarchart')).html("");

        this.width = parseInt(D3.select(this.element.nativeElement.querySelector('div#awsbillingbarchartcontainer')).style("width")) - this.margin.left - this.margin.right,
        this.height = parseInt(D3.select(this.element.nativeElement.querySelector('div#awsbillingbarchartcontainer')).style("height")) - this.margin.top - this.margin.bottom;

        this.xScale = D3.scaleBand().range([0, this.width]).padding(0.1);
        this.yScale = D3.scaleLinear().range([this.height, 0]);
        this.y1Scale = D3.scaleLinear().range([this.height, 0]);

        this.dollarFormatter = D3.format(",.0f");
        this.percentFormatter = D3.format(".0%");

        this.xAxis = D3.axisBottom(this.xScale);
        this.yAxis = D3.axisLeft(this.yScale).tickFormat((d) => { return "$" + this.dollarFormatter(d); });
        this.yAxisRight = D3.axisRight(this.y1Scale).tickFormat((d) => { return this.percentFormatter(d); });


        this.color = D3.scaleOrdinal(D3.schemeCategory20);
        this.tooltip = D3.select(this.element.nativeElement.querySelector('div#barcharttoolTip'));
    }

    buildSVG(): void {
        let that = this;
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

            // add the Y gridlines
            this.svg.append("g")
                .attr("class", "grid")
                .call(this.make_y_gridlines()
                    .tickSize(-this.width)
                    .tickFormat(this.tickformat)
                )

            // append the rectangles for the bar chart
            this.svg.selectAll(".bar")
                .data(this.dataset)
                .enter().append("rect")
                .attr("class", "bar")
                .attr("rectClicked", "No")
                .attr("productAttrName", (d, i) => { return d.producttag; })
                .attr("x", (d, i) => { return this.xScale(d.name); })
                .attr("width", this.xScale.bandwidth())
                .attr("y", (d, i) => { return this.yScale(d.totalcost); })
                .attr("height", (d) => { return this.height - this.yScale(d.totalcost); })
                .attr("fill", (d, i) => { return this.color(i) })
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
                .on("mousemove", (d, i) => {
                    this.tooltip
                        .style("left", D3.event.pageX - 50 + "px")
                        .style("top", D3.event.pageY - 100 + "px")
                        .style("display", "inline-block")
                        .html((d.name) + "<br>" + "$" + (d.originalCost) + "<br/>" + Math.round((d.originalCost / tots) * 100) + '%');
                })
                .on("mouseout", (d) => { this.tooltip.style("display", "none"); });

            // add the x Axis
            this.svg.append("g")
                .attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxis)
                .selectAll("text")
                .attr("class", "product-label")
                .attr("productClcked", "No")
                .attr("txtProductAttrName", (d, i) => { return this.productDataSet[d].producttag; })
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-50)")
                .style("font-size","9px")
                .on("mousemove", (d, i) => {
                    let toolname = "";
                    if (this.productDataSet.hasOwnProperty(d)) {
                        toolname = (d) + "<br>" + "$" + (this.productDataSet[d].originalCost) + "<br/>" + Math.round((this.productDataSet[d].originalCost / tots) * 100) + '%';
                    } else {
                        toolname = (d) + "<br>" + "$0" + "<br/>" + '0%';
                    }
                    this.tooltip
                        .style("left", D3.event.pageX - 50 + "px")
                        .style("top", D3.event.pageY - 100 + "px")
                        .style("display", "inline-block")
                        .html(toolname);
                })
                .on("mouseout", (d) => { this.tooltip.style("display", "none"); })
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

            this.svg.append("text")
                .attr("x", (this.width / 2)-5)
                .attr("y",   -10)
                .attr("text-anchor", "middle")
                .style("font-size", "14px")
                .style("text-decoration", "underline")
                .text("Spends vs Top products used");
        }
    }
}
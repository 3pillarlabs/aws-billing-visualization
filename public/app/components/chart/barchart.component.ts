import { Component, Input, Output, EventEmitter, AfterViewInit,ElementRef } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';
import * as D3 from 'd3';



@Component({
    selector: 'aws-billing-bar-chart',
    template: '<div id="awsbillingbarchartcontainer"><svg id="awsbillingbarchart" (window:resize)="onResize($event)"></svg><div id="barcharttoolTip"></div></div>',
    styles: [`#awsbillingbarchartcontainer{
                    width:100%;
                    height:48%;
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
    company: string;

    private width;
    private height;
    private margin = {top: 10, right: 40, bottom:80 , left: 60};
    private xScale;
    private yScale;
    private dollarFormatter;
    private yAxis;
    private xAxis;
    public dataset = [];
    private svg;
    private barheight:number=20;
    private color;
    private tooltip;
    private y1Scale;
    private yAxisRight;
    private percentFormatter;

    constructor(private element: ElementRef,private _awsdata: AwsdataService, private _config: ConfigService) {
        this.company = this._config.company;
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
                    let TotalBlendedCost = Math.round(product.TotalBlendedCost.value)
                    if (TotalBlendedCost > 0) {
                        var productname=product.key.slice(7);
                        var productdoc = {
                            'name': productname,
                            'totalcost': TotalBlendedCost,
                            'totalresource': product.doc_count,
                            'orignalname':product.key
                        };
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


    setup():void{
        D3.select(this.element.nativeElement.querySelector('svg#awsbillingbarchart')).html("");
        
        this.width = parseInt(D3.select(this.element.nativeElement.querySelector('div#awsbillingbarchartcontainer')).style("width")) - this.margin.left - this.margin.right,
        this.height = parseInt(D3.select(this.element.nativeElement.querySelector('div#awsbillingbarchartcontainer')).style("height")) - this.margin.top - this.margin.bottom;

        this.xScale = D3.scaleBand().range([0, this.width]).padding(0.1);
        this.yScale = D3.scaleLinear().range([this.height, 0]);
        this.y1Scale = D3.scaleLinear().range([this.height, 0]);

        this.dollarFormatter = D3.format(",.0f");
        this.percentFormatter= D3.format(".0%");
        
        this.xAxis = D3.axisBottom(this.xScale);
        this.yAxis = D3.axisLeft(this.yScale).tickFormat((d)=>{  return "$" + this.dollarFormatter(d); });
        this.yAxisRight = D3.axisRight(this.y1Scale).tickFormat((d)=>{  return this.percentFormatter(d); });

        
        this.color = D3.scaleOrdinal(D3.schemeCategory20);
        this.tooltip= D3.select(this.element.nativeElement.querySelector('div#barcharttoolTip'));
    }

    buildSVG():void{
        let that=this;
        if (this.dataset.length > 0) {
            var tots = D3.sum(this.dataset, function(d) { 
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
                .attr("x", (d,i)=> { return this.xScale(d.name); })
                .attr("width", this.xScale.bandwidth())
                .attr("y", (d,i)=> { return this.yScale(d.totalcost); })
                .attr("height", (d)=> { return this.height - this.yScale(d.totalcost); })
                .attr("fill",(d,i)=>{ return this.color(i)})
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
                            .attr("stroke-width", 2);
                       that.selectProduct.emit(d.orignalname);

                    }
                    else if (D3.select(this).attr("rectClicked") == "Yes") {
                        D3.select(this)
                            .attr("rectClicked", "No")
                            .transition()
                            .duration(500)
                            .attr("stroke", "none");

                        that.selectProduct.emit("");
                    }
                    
                })
                .on("mousemove", (d,i)=>{
                    this.tooltip
                        .style("left", D3.event.pageX - 50 + "px")
                        .style("top", D3.event.pageY - 100 + "px")
                        .style("display", "inline-block")
                        .html((d.name) + "<br>" + "$" + (d.totalcost)+ "<br/>"+ Math.round((d.totalcost/tots)*100)+'%');
                 })
                .on("mouseout", (d)=>{ this.tooltip.style("display", "none");});

            // add the x Axis
            this.svg.append("g")
                .attr("transform", "translate(0," + this.height + ")")
                .call(this.xAxis)
                .selectAll("text")  
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", "rotate(-35)" );

            // add the y Axis
            this.svg.append("g")
                .call(this.yAxis);

            this.svg.append("g")
                .attr("transform", "translate("+this.width+"," +"0)")
                .call(this.yAxisRight);

            /*this.svg.append("g")
                .attr("class", "y axis")
                .call(this.yAxis);

            this.svg.append("g")
                .attr("class", "x axis")
                .call(this.yAxis)
                .attr("transform", "translate(0," + this.height + ")")
                .append("text")
                .attr("class", "label")
                .attr("transform", "translate(" + this.width / 2 + "," + this.margin.bottom / 1.5 + ")")
                .style("text-anchor", "middle")
                .text("Sales");*/

            
        } 
    }

    BarChartResize(): void {
        this.width = parseInt(D3.select(this.element.nativeElement.querySelector('svg#awsbillingbarchart')).style("width")) - this.margin.left - this.margin.right,
        this.height = parseInt(D3.select(this.element.nativeElement.querySelector('svg#awsbillingbarchart')).style("height")) - this.margin.top - this.margin.bottom;

        // Update the range of the scale with new width/height
        this.xScale.range([0, this.width]);
        this.yScale.rangeRoundBands([this.height, 0], 0.1);

        // Update the axis and text with the new scale
        this.svg.select(".x.axis")
            .call(this.xAxis)
            .attr("transform", "translate(0," + this.height + ")")
            .select(".label")
            .attr("transform", "translate(" + this.width / 2 + "," + this.margin.bottom / 1.5 + ")");

        this.svg.select(".y.axis")
            .call(this.yAxis);

        // Update the tick marks
        this.xAxis.ticks(Math.max(this.width / 75, 2), " $");

        // Force D3 to recalculate and update the line
        this.svg.selectAll(".bar")
            .attr("width", function (d) { return this.xScale(d["total"]); })
            .attr("y", function (d) { return this.yScale(d["Name"]); })
            .attr("height", this.yScale.rangeBand());
    }
}
import { Component, OnInit, OnChanges, ElementRef, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';

@Component({
    moduleId: module.id,
    selector: 'd3-map',
    template: ``,
    inputs: ['startdate', 'enddate', 'selectedRegion'],
    outputs: ['isloading', 'selectRegion']
})

export class D3mapComponent implements OnInit, OnChanges {
    private startdate: string;
    private enddate: string;
    private isloading = new EventEmitter();
    private parentNativeElement: any;
    private margin = { top: 20, right: 50, bottom: 30, left: 50 };
    private width: number;
    private height: number;
    private rotate: number = 0;//60;
    private maxlat: number = 83;
    private svg: any;
    private projection: any;
    private path: any;
    private tooltipGroup: any;
    private worldMapJson: string = "app/components/d3map/worldmap.json";
    private company: string;
    private selectionMap: any;

    selectedRegion: string;
    selectRegion: EventEmitter<string> = new EventEmitter<string>();

    colorRange = ["green", "red"];
    legendText = ["Low Uses", "High Uses"];

    constructor(private element: ElementRef,
        private _awsService: AwsdataService,
        private _config: ConfigService) {
        this.company = this._config.company;
        this.parentNativeElement = element.nativeElement;
        this.width = 650 - this.margin.left - this.margin.right;
        this.height = 400 - this.margin.top - this.margin.bottom;
    }

    ngOnInit(): void {
        this.initSvg();
        this.getProjection();
        this.getPath();
        this.getTooltip();
        this.getLegend();
    }

    ngOnChanges(): void {
        this.getRegionsData();
    }

    getRegionsData() {
        let awsdata = {
            company: this.company,
            strdate: this.startdate,
            enddate: this.enddate
        };
        this._awsService.getRegionsData(awsdata).subscribe((regionsData) => {
            console.log(regionsData);
            this.drawMap(regionsData);

        })
    }

    initSvg(): void {
        if (this.parentNativeElement !== null) {
            this.svg = d3.select(this.parentNativeElement)
                .append('svg')
                .attr("width", this.width + this.margin.left + this.margin.right)
                .attr("height", this.height + this.margin.top + this.margin.bottom)
                .append("g")
                .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
                .append("g")
                .attr("width", this.width)
                .attr("height", this.height);
        }
    }

    getProjection(): void {
        this.projection = d3.geoMercator()
            .rotate([this.rotate, 0])
            .scale(1)
            .translate([this.width / 2, this.height / 2]);

        // set up the scale extent and initial scale for the projection
        var b = this.mercatorBounds(this.projection, this.maxlat),
            s = this.width / (b[1][0] - b[0][0]),
            scaleExtent = [s, 10 * s];

        this.projection
            .scale(scaleExtent[0]);
    }

    getPath(): void {
        this.path = d3.geoPath()
            .projection(this.projection);
    }

    // find the top left and bottom right of current projection
    mercatorBounds(projection, maxlat) {
        var yaw = projection.rotate()[0],
            xymax = projection([-yaw + 180 - 1e-6, -maxlat]),
            xymin = projection([-yaw - 180 + 1e-6, maxlat]);

        return [xymin, xymax];
    }

    getTooltip(): void {
        this.tooltipGroup = d3.select(this.parentNativeElement)
            .append("div")
            .attr("class", "tooltipcss").style("opacity", 0);
    }

    getLegend(): void {
        var legend = d3.select(this.parentNativeElement).append("svg")
            .attr("class", "legend")
            .attr("width", 500)
            .attr("height", 40)
            .selectAll("g")
            .data(this.colorRange)
            .enter()
            .append("g")
            .attr("transform", function (d, i) { return "translate(" + ((i * 150) + 100) + ", 10)"; });

        legend.append("rect")
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function (d) { return d; });

        legend.append("text")
            .data(this.legendText)
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", ".35em")
            .text(function (d) { return d; });

    }

    drawMap(data): void {
        console.log('------------------'+data);
        d3.json(this.worldMapJson, (error, collection) => {
            if (error) throw error;

            this.selectionMap = this.svg.selectAll("path")
                .data(collection.features);

            let color = d3.scaleLinear<string>()
                .domain([0, data.maxval])
                .range(this.colorRange);

            this.selectionMap.enter().append("path")
                .attr("class", (d) => { return "subunit " + d.id; })
                .attr("d", this.path)
                .attr("fill", "#ccc")
                .attr("stroke", "#fff");

            this.svg.append("g")
                .attr("class", "bubble")
                .selectAll("circle")
                .data(collection.features)
                .enter().append("circle")
                .attr("transform", (d) => {
                    return "translate(" + this.path.centroid(d) + ")";
                });

            this.svg.selectAll("circle")
                .attr("r", (d) => {
                    if (data.hasOwnProperty(d.id)) {
                        return 12;
                    }
                })
                .attr("class", (d) => {
                    if (data.hasOwnProperty(d.id)) {
                        return "resource-region";
                    }
                })
                .style("cursor", "pointer")
                .attr("fill", (d) => {
                    if (data.hasOwnProperty(d.id)) {
                        return color(data[d.id].totalcost);
                    }
                })
                .on("click", (d) => {
                    this.isloading.emit(true);
                    this.selectRegion.emit(d.id);
                })
                .on("mouseover", (d) => {
                    let tooltext = d.properties.name + "<br/>"
                        + "Region : " + d.id + "<br/>";
                    if (data.hasOwnProperty(d.id)) {
                        tooltext = d.properties.name + "<br/>"
                            + "Region : " + data[d.id].name + "<br/>"
                            + "Total Hours : " + data[d.id].totalresource + "<br/>"
                            + "Total Cost : $" + data[d.id].totalcost;

                    }
                    this.tooltipGroup.transition()
                        .duration(200)
                        .style("opacity", .9);
                    this.tooltipGroup.html(tooltext)
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 150) + "px");
                })
                .on("mousemove", (d) => {
                    this.tooltipGroup
                        .style("top", (d3.event.pageY - 150) + "px")
                        .style("left", (d3.event.pageX - 100) + "px");
                })
                .on("mouseout", (d) => {
                    this.tooltipGroup.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

        })


    }

}
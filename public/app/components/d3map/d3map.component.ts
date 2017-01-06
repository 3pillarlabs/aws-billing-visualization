import { Component, OnInit, OnChanges, ElementRef, EventEmitter } from '@angular/core';
import * as d3 from 'd3';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';

@Component({
    moduleId: module.id,
    selector: 'd3-map',
    template: ``,
    inputs: ['startdate','enddate','selectedRegion'],
	outputs: ['isloading','selectRegion']
})

export class D3mapComponent implements OnInit, OnChanges{
    private startdate: string;
    private enddate: string;
    private isloading = new EventEmitter();
    private parentNativeElement: any;
    private margin = {top: 20, right: 50, bottom: 30, left: 50};
    private width: number;
    private height: number;
    private rotate: number = 60;
    private maxlat: number = 83;
    private svg: any;
    private path: any;
    private tooltipGroup: any;    
    private worldMapJson: string = "app/components/d3map/worldmap.json";
    private company:string;
    private selectionMap: any;  

    selectedRegion: string;
    selectRegion: EventEmitter<string> = new EventEmitter<string>();

    constructor(private element: ElementRef, 
                private _awsService:AwsdataService,
                private _config:ConfigService) {
        this.company=this._config.company;
        this.parentNativeElement = element.nativeElement;
        this.width = 700 - this.margin.left - this.margin.right ;
        this.height = 400 - this.margin.top - this.margin.bottom;
    }

    ngOnInit(): void{
        console.log("initialised");
        //this.getRegionsData();
        this.initSvg();
        this.getPath();
        this.getTooltip();  
        //this.drawMap();      
    }

    ngOnChanges(): void {
        console.log("on changes");
        console.log("=== "+this.startdate+" = "+this.enddate);
        this.getRegionsData();
    }

    getRegionsData(){
        let awsdata = {
    		company: this.company,
    		strdate: this.startdate,
    		enddate: this.enddate
		};
        console.log("config data === ");
        console.log(JSON.stringify(awsdata));
        this._awsService.getRegionsData(awsdata).subscribe((regionsData)=>{
            console.log("region data");
            console.log(regionsData);
            this.drawMap(regionsData);
            
        })
    }

    initSvg(): void{
         if (this.parentNativeElement !== null){
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
        console.log(this.parentNativeElement);
    }

    getPath(): void{
        let projection = d3.geoMercator()
            .rotate([this.rotate,0])
            .scale(1)
            .translate([this.width/2, this.height/2]);

        // set up the scale extent and initial scale for the projection
        var b = this.mercatorBounds(projection, this.maxlat),
            s = this.width/(b[1][0]-b[0][0]),
            scaleExtent = [s, 10*s];

        projection
            .scale(scaleExtent[0]);

        this.path = d3.geoPath()
                      .projection(projection);
    }

    // find the top left and bottom right of current projection
    mercatorBounds(projection, maxlat) {
        var yaw = projection.rotate()[0],
            xymax = projection([-yaw+180-1e-6,-maxlat]),
            xymin = projection([-yaw-180+1e-6, maxlat]);
        
        return [xymin,xymax];
    }

    getTooltip(): void{
        this.tooltipGroup = d3.select(this.parentNativeElement)
                              .append("div")
                              .attr("class", "tooltipcss")
                              .style("visibility", "hidden")
                              .html("a simple tooltip");
    }

    drawMap(data): void{
        d3.json(this.worldMapJson, (error, collection) => {
            if(error) throw error;

            this.selectionMap = this.svg.selectAll("path")
                                .data(collection.features);
            
            var color = d3.scaleLinear<string>()
                        .domain([0,data.maxval])
                        .range(["green", "red"]);
            
            this.selectionMap.enter().append("path")
                     .attr("class", (d) => { return "subunit " + d.id; })
                     .attr("d", this.path);

             this.svg.selectAll("path")
                    .attr("fill", (d) => {  
                         if(data.hasOwnProperty(d.id)){
                              //return data[d.id].color;
                              return color(data[d.id].totalcost);
                         }
                         else
                         {
                             return "#ccc";
                         }
                         
                     })
                     .attr("stroke", "#fff")
                     .on( "click", (d) => {
                         //alert(d.id);
                         this.isloading.emit(true);
                         this.selectRegion.emit(d.id);
                     })
                     .on("mouseover", (d) => {
                         let tooltext = d.properties.name+"<br/>"
                                        +"Region : "+d.id+"<br/>";
                         if(data.hasOwnProperty(d.id)){
                             tooltext =  d.properties.name+"<br/>"
                                         +"Region : "+data[d.id].name+"<br/>"
                                         +"Total Resource : "+data[d.id].totalresource+"<br/>"
                                         +"Total Cost : "+data[d.id].totalcost;
                             return this.tooltipGroup
                                    .html(tooltext)
                                    .style("visibility", "visible");
                        }
                         
                     })
                     .on("mousemove", (d) => {
                         return this.tooltipGroup
                                    .style("top", (d3.event.pageY-200)+"px")
                                    .style("left",(d3.event.pageX-100)+"px");
                     })
                     .on("mouseout", (d) => {
                         return this.tooltipGroup.style("visibility", "hidden");
                     })                         
            console.log("map created/update wwww");
        })
    }
    
}
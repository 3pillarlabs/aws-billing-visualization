import { Component, OnChanges, ElementRef, Input, SimpleChanges } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';
import * as D3 from 'd3';



@Component({
  moduleId: module.id,
  selector: 'aws-billing-chart',
  template: '',
  styles: [`
              .arc text {
                  font: 10px sans-serif;
                  text-anchor: middle;
                }

                .arc path {
                  stroke: #fff;
                }
          `]
})

export class ChartComponent implements OnChanges {
  private host;
  private width;       // Chart width
  private height;      // Chart height
  private radius;      // Chart Radius
  private color;
  private arc;
  private labelArc;
  private pie;
  private svg;
  private htmlElement: HTMLElement;
  private path;
  private g;
  private tooltip;

  @Input() startdate: string;
  @Input() enddate: string;
  @Input() selectedRegion: string;

  company: string;

  public dataset = [];
  public msg = 'There is no product';
  public legendRectSize = 18;
  public legendSpacing = 4;

  /**
   * We request angular for the element reference 
  * and then we create a D3 Wrapper for our host element
  **/
  constructor(private element: ElementRef, private _awsdata: AwsdataService, private _config: ConfigService) {

    this.htmlElement = this.element.nativeElement;
    this.host = D3.select(this.element.nativeElement);

    this.company = this._config.company;


  }

  ngOnChanges(changes: SimpleChanges) {
    this.setMsg(changes);
    let awsdata = {
      company: this.company,
      strdate: this.startdate,
      enddate: this.enddate,
      region: this.selectedRegion
    };
    this.getProduct(awsdata);
  }

  /** Set No data message on the bases of property change value */
  setMsg(changes): void {
    if (changes.startdate) {
      if ((typeof (changes.startdate.previousValue) == 'string' && changes.startdate.currentValue != changes.startdate.previousValue)) {
        this.msg = 'There is no product for selected date range';
      }
    } else if (changes.enddate) {
      if ((typeof (changes.enddate.previousValue) == 'string' && changes.enddate.currentValue != changes.enddate.previousValue)) {
        this.msg = 'There is no product for selected date range';
      }
    } else if (changes.selectedRegion) {
      if ((typeof (changes.selectedRegion.previousValue) == 'string' && changes.selectedRegion.currentValue != changes.selectedRegion.previousValue)) {
        this.msg = 'There is no product for selected region';
      }
    }
  }

  public getProduct(awsdata: any) {
    this._awsdata.getUniqueProduct(awsdata).subscribe((data) => {

      var products = [];
      if (data.length > 0) {
        for (let product of data) {
          if (product.totalcost > 0) {
            products.push(product);
          }
        }
      }
      this.dataset = products;
      this.setup();
      this.buildSVG();
    });
  }

  /**
   * Basically we get the dom element size and build the container 
   **/
  private setup(): void {
    this.width = 550;
    this.height = 300;
    this.radius = Math.min(this.width, this.height) / 2;
    this.color = D3.scaleOrdinal(D3.schemeCategory20);
    this.arc = D3.arc().outerRadius(this.radius - 10).innerRadius(0);
    this.labelArc = D3.arc().outerRadius(this.radius - 40).innerRadius(this.radius - 40);
    this.pie = D3.pie().value(function (d) { return d.totalcost; }).sort(null);

  }

  wrap(text, width) {
    //console.log(text, 'text');
    text.each(function () {
      var text = D3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        x = text.attr("x"),
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");
      while (word = words.pop()) {
        line.push(word);
        tspan.text(line.join(" "));
        if (tspan.node().getComputedTextLength() > width) {
          line.pop();
          tspan.text(line.join(" "));
          line = [word];
          tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
        }
      }
    });
  }

  /**
  * We can now build our SVG element using the configurations we created
  **/
  private buildSVG(): void {
    this.host.html('');



    /** Condition for checking product, if found then build pic chart else show message */
    if (this.dataset.length > 0) {

      this.svg = this.host.append('svg')
        .attr('width', this.width)
        .attr('height', this.height);
      let groupArc = this.svg.append('g').attr("transform", "translate(" + ((this.width / 2) - 35) + "," + this.height / 2 + ")");


      this.g = groupArc.selectAll("g")
        .data(this.pie(this.dataset))
        .enter()
        .append("g")
        .attr("class", "arc");

      this.g.append("path")
        .attr("d", this.arc)
        .attr('fill', (d) => { return this.color(d.data.totalcost); });
      /*.on("mouseover", (d, i) => {
          groupArc.append("text")
            .attr("dy", ".5em")
            .style("text-anchor", "middle")
            .style("font-size", 15)
            .attr("class","label")
            .style("fill", function(d,i){return "black";})
            .text(d.data.name);
          
      })
      .on("mouseout", (d) => {
        groupArc.select(".label").remove();
      })*/


      var legend = this.svg.selectAll('.legend')
        .data(this.color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => {

          var height = this.legendRectSize + this.legendSpacing;
          var offset = height * this.color.domain().length / 2;
          var horz = (9 * this.legendRectSize) + 240;
          var vert = (i * height - (offset + 20)) + 150;
          return 'translate(' + horz + ',' + vert + ')';
        });

      legend.append('rect')
        .attr('width', this.legendRectSize)
        .attr('height', this.legendRectSize)
        .style('fill', this.color)
        .style('stroke', this.color);

      legend.append('text')
        .attr('x', this.legendRectSize + this.legendSpacing)
        .attr('y', this.legendSpacing)
        .attr("dy", ".35em")
        .style('font-size', '11px')
        .text((d, i) => { return this.dataset[i].name; })
        .call(this.wrap, 150);


      this.g.append("text")
        .attr("transform", (d) => { return "translate(" + this.labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text((d) => { return d.data.totalcost; });
    } else {
      this.svg = this.host.append('svg')
        .attr('width', this.width)
        .attr('height', this.height)
        .append('g').attr("transform", "translate(" + 120 + "," + this.height / 2 + ")");

      this.svg.selectAll("g")
        .data([1])
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .text(this.msg);

    }




  }




}
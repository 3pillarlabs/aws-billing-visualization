import { Component, OnChanges, ElementRef, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
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
  private arcOver;
  private labelArc;
  private pie;
  private svg;
  private htmlElement: HTMLElement;
  private path;
  private g;
  private tooltip;

  startdate: string;
  enddate: string;
  //@Input() selectedRegion: string;
  @Input() appcomponentdata: any;
  //@Input() selectedProduct: string;
  @Output() selectProduct: EventEmitter<string> = new EventEmitter<string>();
  //@Input() detailReportOption: any;


  company: string;
  appdataloaded = false;

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
    if (this.appcomponentdata.allServiceData) {
      /*if (this.appdataloaded) {
        this.setMsg(changes);
        let awsdata = {
          company: this.company,
          strdate: this.appcomponentdata.startdate,
          enddate: this.appcomponentdata.enddate,
          region: this.selectedRegion
        };
        this.getProduct(awsdata);
      } else {
        this.parsePieChartData(this.appcomponentdata.allServiceData);
      }*/
      this.parsePieChartData(this.appcomponentdata.allServiceData);
      //this.appdataloaded = true;
    }

  }

  /** Set No data message on the bases of property change value */
  setMsg(changes): void {
    console.log(changes);
    if ((typeof (changes.appcomponentdata.previousValue.startdate) == 'string' && changes.appcomponentdata.currentValue.startdate != changes.appcomponentdata.previousValue.startdate)) {
      this.msg = 'There is no product for selected date range';
    } else if ((typeof (changes.appcomponentdata.previousValue.enddate) == 'string' && changes.appcomponentdata.currentValue.enddate != changes.appcomponentdata.previousValue.enddate)) {
      this.msg = 'There is no product for selected date range';
    } else if (changes.selectedRegion) {
      if ((typeof (changes.selectedRegion.previousValue) == 'string' && changes.selectedRegion.currentValue != changes.selectedRegion.previousValue)) {
        this.msg = 'There is no product for selected region';
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

  parsePieChartData(data: any): void {
    if (data && data.aggregations) {
      if (data.aggregations.product_name) {
        let productdata = [];
        for (let product of data.aggregations.product_name.buckets) {
          if (product.TotalBlendedCost.value > 0) {
            var productdoc = {
              'name': product.key,
              'totalcost': Math.round(product.TotalBlendedCost.value),
              'totalresource': product.doc_count
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

  /**
   * Basically we get the dom element size and build the container 
   **/
  private setup(): void {
    this.width = 600;
    this.height = 300;
    this.radius = Math.min(this.width, this.height) / 2;
    this.color = D3.scaleOrdinal(D3.schemeCategory20);
    this.arc = D3.arc().outerRadius(this.radius - 10).innerRadius(0);
    this.arcOver = D3.arc().outerRadius(this.radius).innerRadius(0);
    this.labelArc = D3.arc().outerRadius(this.radius - 40).innerRadius(this.radius - 40);
    this.pie = D3.pie().value(function (d) { return d.totalcost; }).sort(null);

  }

  /**
  * We can now build our SVG element using the configurations we created
  **/
  private buildSVG(): void {
    console.log('html l');
    this.host.html('');

    let that = this;

    /** Condition for checking product, if found then build pic chart else show message */
    if (this.dataset.length > 0) {

      this.svg = this.host.append('svg')
        .attr('width', this.width)
        .attr('height', this.height + 20)
        .append('g').attr("transform", "translate(" + ((this.width / 2) - 100) + "," + this.height / 2 + ")");


      this.g = this.svg.selectAll("g")
        .data(this.pie(this.dataset))
        .enter()
        .append("g")
        .attr("class", "arc");

      this.g.append("path")
        .attr("d", this.arc)
        .attr("clicked", "No")
        .attr('fill', (d) => { return this.color(d.data.totalcost); })
        .on("click", function (d, i) {
         if (D3.select(this).attr("clicked") == "No") {
            D3.selectAll("[clicked=Yes]")
              .attr("clicked", "No")
              .transition()
              .duration(500)
              .attr("d", that.arc)
              .attr("stroke", "none");

            D3.select(this)
              .attr("stroke", "white")
              .attr("clicked", "Yes")
              .transition()
              .duration(500)
              .attr("d", that.arcOver)
              .attr("stroke-width", 6);

          }
          else if (D3.select(this).attr("clicked") == "Yes") {
            D3.select(this)
              .attr("clicked", "No")
              .transition()
              .duration(500)
              .attr("d", that.arc)
              .attr("stroke", "none");
          }
          that.selectProduct.emit(that.dataset[i].name);
        });



      var legend = this.svg.selectAll('.legend')
        .data(this.color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', (d, i) => {

          var height = this.legendRectSize + this.legendSpacing;
          var offset = height * this.color.domain().length / 2;
          var horz = 9 * this.legendRectSize;
          var vert = i * height - (offset + 20);
          return 'translate(' + horz + ',' + vert + ')';
        });

      legend.append('rect')
        .attr('width', this.legendRectSize)
        .attr('height', this.legendRectSize)
        .style('fill', this.color)
        .style('stroke', this.color);

      legend.append('text')
        .attr('x', this.legendRectSize + this.legendSpacing)
        .attr('y', this.legendRectSize - this.legendSpacing)
        .style('font-size', '11px')
        .text((d, i) => { return this.dataset[i].name; });


      this.g.append("text")
        .attr("transform", (d) => { return "translate(" + this.labelArc.centroid(d) + ")"; })
        .attr("dy", ".35em")
        .text((d) => { return d.data.totalcost; });
    } else {
      this.svg = this.host.append('svg')
        .attr('width', this.width)
        .attr('height', this.height + 20)
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
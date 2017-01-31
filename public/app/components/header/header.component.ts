import { Component, OnInit } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';
import { ConfigService } from './../../services/config.service';

declare var Tour:any;

@Component({
    moduleId: module.id,
    selector: 'aws-billing-header',
    templateUrl: 'header.component.html'
})

export class HeaderComponent implements OnInit {
    public totalRecord:number;
    public lastupdated:string;
    public company:string;

    constructor(private _awsdata: AwsdataService,private _config:ConfigService) { 

         this.company = this._config.company;
    }

    ngOnInit() {
        this._awsdata.getMinMaxDateRange(this.company).subscribe((data)=>{
            if(data){
                this.totalRecord=data.hits.total;
                this.lastupdated=data.aggregations.last_created.value_as_string;
            }
        })
    }

    bootstrapTour(): void {
            var tour = new Tour({
                steps: [
                    {
                        element: "#datefilter",
                        title: "Date Filters",
                        placement: "bottom",
                        content: "Select a date range to filter the data and simply hit \"Go\"."
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
    }
}
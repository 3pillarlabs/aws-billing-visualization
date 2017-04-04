import { Component, Input,OnChanges,EventEmitter,Output } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';

declare var Tour: any;

@Component({
    moduleId: module.id,
    selector: 'aws-billing-header',
    templateUrl: 'header.component.html'
})

export class HeaderComponent implements OnChanges{
    @Input() totalRecord: number;
    @Input() lastupdated: string;
    @Input() indiceslist:any;
    @Input() company:string;
    @Output() companyChange:EventEmitter<string>=new EventEmitter<string>();
    
    indices:string;

    constructor(private _awsdata: AwsdataService) {
        this.indices=this.company;
    }

    ngOnChanges(){
       this.indices=this.company;
    }

    bootstrapTour(): void {
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
    }

    onChangeIndex(indexval){
        this.companyChange.emit(indexval);
    }
}
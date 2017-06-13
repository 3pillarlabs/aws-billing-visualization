import { TestBed,ComponentFixture, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { BarchartComponent } from './barchart.component';
import { HttpModule } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';

describe('Barchart Component inline template',()=>{
    let comp:BarchartComponent;
    let fixer:ComponentFixture<BarchartComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[BarchartComponent],
            imports: [HttpModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(BarchartComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);
    })

    it('should have a defined component', () => {
      expect(comp).toBeDefined();
    });
})


describe('Parse pie chart data', ()=>{
    let comp:BarchartComponent;
    let fixer:ComponentFixture<BarchartComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};
    let defaultHtmlStringLength = 0;

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[BarchartComponent],
            imports: [HttpModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(BarchartComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);

        // query for the title <h1> by CSS element selector
        del = fixer.debugElement.query(By.css('div'));
        el = del.nativeElement;
        defaultHtmlStringLength = el.innerHTML.length;
    })


    it('Check the SVG is rendered', ()=>{

      //el = document.getElementById('awsbillingbarchart');
      var dummyData = {
      	"took": 254,
      	"timed_out": false,
      	"_shards": {
      		"total": 5,
      		"successful": 5,
      		"failed": 0
      	},
      	"hits": {
      		"total": 1456932,
      		"max_score": null,
      		"hits": []
      	},
      	"aggregations": {
      		"total_cost": {
      			"value": 199760.4322595468
      		},
      		"product_name": {
      			"doc_count_error_upper_bound": 0,
      			"sum_other_doc_count": 14106,
      			"buckets": [
      				{
      					"key": "Amazon Elastic Compute Cloud",
      					"doc_count": 1398543,
      					"TotalBlendedCost": {
      						"value": 105656.82024444744
      					}
      				},
      				{
      					"key": "Amazon Elastic File System",
      					"doc_count": 8846,
      					"TotalBlendedCost": {
      						"value": 46836.043028660264
      					}
      				}
      			]
      		},
      		"AvailabilityRegion": {
      			"doc_count_error_upper_bound": 0,
      			"sum_other_doc_count": 0,
      			"buckets": [
      				{
      					"key": "us-east-1",
      					"doc_count": 277197,
      					"TotalBlendedCost": {
      						"value": 47676.985000011955
      					}
      				}
      			]
      		},
      		"total_quantity": {
      			"value": 144921900.4714016
      		}
      	}
      };

      comp.parsePieChartData(dummyData);
      fixer.detectChanges();
      expect(el.innerHTML.length).toBeGreaterThan(defaultHtmlStringLength);

    })
})

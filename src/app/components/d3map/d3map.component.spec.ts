import { TestBed,ComponentFixture, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { D3mapComponent } from './d3map.component';
import { HttpModule } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';

describe('Barchart Component inline template',()=>{
    let comp:D3mapComponent;
    let fixer:ComponentFixture<D3mapComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[D3mapComponent],
            imports: [HttpModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(D3mapComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);
    })

    it('should have a defined component', () => {
      expect(comp).toBeDefined();
    });
})



describe('Parse D3 data', ()=>{
    let comp:D3mapComponent;
    let fixer:ComponentFixture<D3mapComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};
    let defaultHtmlStringLength = 0;

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[D3mapComponent],
            imports: [HttpModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(D3mapComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);

        // query for the title <h1> by CSS element selector
        del = fixer.debugElement.query(By.css('div#awsbillingD3Map'));
        el = del.nativeElement;
    })

    it('Check the D3 map is not rendered', ()=>{
      expect(el.innerHTML.length).toEqual(0);
    })


    it('Check the D3 map is rendered', ()=>{

      var dummyData = {
      	"took": 253,
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

      spyOn(comp, "clearSvg");
      comp.parseD3Data(dummyData);
      fixer.detectChanges();
      expect(el.innerHTML.length).toBeGreaterThan(0);

    })
})

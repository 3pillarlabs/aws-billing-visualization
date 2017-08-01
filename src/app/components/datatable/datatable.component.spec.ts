import { TestBed, ComponentFixture, inject } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { DatatableComponent } from './datatable.component';
import { HttpModule } from '@angular/http';
import { AwsdataService } from './../../services/awsdata.service';
import { async } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { PaginationDirective } from '../../directives/pagination.directive';
import { MomentPipe } from '../../moment.pipe';

describe('Datatable Component',()=>{
    let comp:DatatableComponent;
    let fixer:ComponentFixture<DatatableComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};

    // async beforeEach
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ DatatableComponent, PaginationDirective,MomentPipe ], // declare the test component
        imports: [HttpModule, FormsModule],
        providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
      })
      .compileComponents();  // compile template and css
    }));

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[DatatableComponent, PaginationDirective, MomentPipe],
            imports: [HttpModule, FormsModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(DatatableComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);
    })

    it('should have a defined component', () => {
      expect(comp).toBeDefined();
    });
})


describe('parse detail data', ()=>{
    let comp:DatatableComponent;
    let fixer:ComponentFixture<DatatableComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};

    // async beforeEach
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ DatatableComponent, PaginationDirective,MomentPipe ], // declare the test component
        imports: [HttpModule, FormsModule],
        providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
      })
      .compileComponents();  // compile template and css
    }));

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[DatatableComponent, PaginationDirective, MomentPipe],
            imports: [HttpModule, FormsModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(DatatableComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);
    })


    it('Will call the pageInfo', ()=>{

      var dummyData = {
      	"took": 282,
      	"timed_out": false,
      	"_shards": {
      		"total": 5,
      		"successful": 5,
      		"failed": 0
      	},
      	"hits": {
      		"total": 1456932,
      		"max_score": null,
      		"hits": [
                  {
        				"_index": "aws-billing-com-score",
        				"_type": "line-items-resources-tags",
        				"_id": "afec09dc245f5531aebe5e94231e4f91",
        				"_score": null,
        				"_source": {
        					"user:AUTOSHUTOFF": "",
        					"Operation": "None",
        					"user:Name": "",
        					"ResourceId": "",
        					"user:Env": "",
        					"user:emr_version": "",
        					"UsageType": "USW1-FreeEventsRecorded",
        					"user:Profile": "",
        					"UsageEndDate": "2017-02-08 14:00:00",
        					"user:Cluster": "",
        					"user:Location": "",
        					"UsageQuantity": "11.00000000",
        					"UsageStartDate": "2017-02-08 13:00:00",
        					"BlendedCost": "0.00000000",
        					"user:workload-type": "",
        					"ProductName": "AWS CloudTrail",
        					"BlendedRate": "0.0000000000",
        					"user:mount": "",
        					"user:BillingProject": "",
        					"user:Mount": "",
        					"user:Role": "",
        					"ItemDescription": "0.0 per free event recorded in US West (N.California) region"
        				},
        				"sort": [
        					"AWS CloudTrail"
        				]
        			}
          ]
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

      spyOn(comp, 'pageInfo');
      comp.parseDetailData(dummyData);

      expect(comp.pageInfo).toHaveBeenCalled();
    })

})


describe("", ()=>{
    let comp:DatatableComponent;
    let fixer:ComponentFixture<DatatableComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};

    // async beforeEach
    beforeEach(async(() => {
      TestBed.configureTestingModule({
        declarations: [ DatatableComponent, PaginationDirective,MomentPipe ], // declare the test component
        imports: [HttpModule, FormsModule],
        providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
      })
      .compileComponents();  // compile template and css
    }));

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[DatatableComponent, PaginationDirective, MomentPipe],
            imports: [HttpModule, FormsModule],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(DatatableComponent);
        comp=fixer.componentInstance;

        // AwsdataService from the root injector
        let awsDataService = TestBed.get(AwsdataService);
    })

    it("Will call getResourceData", ()=>{
      spyOn(comp, 'getResourceData');
      comp.filterbyOperation('');

      expect(comp.getResourceData).toHaveBeenCalled();
    })

    it("will call select the data part and will remove time string", ()=>{

      comp.sorting = {descending: true};
      comp.onDateSelect('2017-01-01 12:02:34', '2017-01-05 29:34:12');

      expect(comp.startdate).toBe('2017-01-01');
      expect(comp.enddate).toBe('2017-01-05');
    })

    it("Gives the current page info", ()=>{
      comp.currentPage = 2;
      comp.length = 5;
      comp.totalItems = 8;
      comp.pageInfo();
      expect(comp.showingto).toEqual(comp.totalItems);
    })

    it("Generates tags from items", ()=>{
      var itemsArr = new Array();
      itemsArr['user:'] = '';
      itemsArr['aws:'] = 'tag2';
      itemsArr['client:'] = '';

      var expectedObj = [{'key': 'aws:', 'val': 'tag2'}];
      var outputTags = comp.tags(itemsArr);

      expect(outputTags).toEqual(expectedObj);
    })

    it("will call getResourceData", ()=>{
      spyOn(comp, 'getResourceData');
      comp.pageChanged('test');

      expect(comp.getResourceData).toHaveBeenCalled();
    })

    it("will call getResourceData", ()=>{
      spyOn(comp, 'getResourceData');
      comp.onChangeProduct('test');

      expect(comp.getResourceData).toHaveBeenCalled();
    })


    it("will call getResourceData", ()=>{
      spyOn(comp, 'getResourceData');
      comp.onChangeRegion('test');

      expect(comp.getResourceData).toHaveBeenCalled();
    })

    it("will call getResourceData", ()=>{
      spyOn(comp, 'getResourceData');
      comp.onClearFilter();

      expect(comp.getResourceData).toHaveBeenCalled();
    })

    it("will call getResourceData", ()=>{
      spyOn(comp, 'getResourceData');
      comp.clearFilter();

      expect(comp.getResourceData).toHaveBeenCalled();
    })

    it("will clear the filter", ()=>{
      spyOn(comp, 'clearFilter');
      comp.onlengthChange(2);

      expect(comp.clearFilter).toHaveBeenCalled();
    })

    it("Sets the page number", ()=>{
        var pageNo = 5;
        comp.setPage(pageNo);
        expect(comp.currentPage).toEqual(pageNo);
    })

    describe("When sorting", ()=>{
        beforeEach(()=>{
          comp.sorting = {
            'column': 'column1',
            'descending': true
          }
        })

        describe("If changing order of currently sorted column", (){
            it("Returns sort class", ()=>{
                var className = comp.selectedClass('column1');
                expect(className).toEqual('sort-true');
            })

            it("Changes the sorting order", ()=>{
                spyOn(comp, 'getResourceData');
                comp.changeSorting('column1');
                expect(comp.sorting.descending).toEqual(false);
            })
        })

        describe("If sorting a column other than currently sorted column", (){
            it("Returns classname as false", ()=>{
                var className = comp.selectedClass('column2');
                expect(className).toEqual('false');
            })

            it("Changes the sorting order", ()=>{
                spyOn(comp, 'getResourceData');
                comp.changeSorting('column2');
                expect(comp.sorting.descending).toEqual(false);
            })
        })

    })

})

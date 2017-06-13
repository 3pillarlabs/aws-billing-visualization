import { TestBed,ComponentFixture,async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { HeaderComponent } from './header.component';
import { AwsdataService } from './../../services/awsdata.service';

describe('Header Component',()=>{
    let comp:HeaderComponent;
    let fixer:ComponentFixture<HeaderComponent>;
    let el: HTMLElement;
    let del:DebugElement;
    let awsdataServiceStub = {};
        // async beforeEach
    beforeEach(async(() => {
        TestBed.configureTestingModule({
        declarations: [ HeaderComponent ], // declare the test component
        providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })
        .compileComponents();  // compile template and css
    }));

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[HeaderComponent],
            providers:    [ {provide: AwsdataService, useValue: awsdataServiceStub } ],
        })

        fixer=TestBed.createComponent(HeaderComponent);

        comp=fixer.componentInstance;
    })


    it('should have defined component', () => {
        expect(HeaderComponent).toBeTruthy();
    });

})

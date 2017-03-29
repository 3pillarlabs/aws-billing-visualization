import { TestBed,ComponentFixture,async } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { LoaderComponent } from './loader.component';

describe('Loader Component',()=>{
    let comp:LoaderComponent;
    let fixer:ComponentFixture<LoaderComponent>;
    let el: HTMLElement;
    let del:DebugElement;
        // async beforeEach
    beforeEach(async(() => {
        TestBed.configureTestingModule({
        declarations: [ LoaderComponent ], // declare the test component
        })
        .compileComponents();  // compile template and css
    }));

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[LoaderComponent]
        })

        fixer=TestBed.createComponent(LoaderComponent);

        comp=fixer.componentInstance;
    })

   
    it('should have defined component', () => {
        expect(LoaderComponent).toBeTruthy();
    });

    it('should not display loader if loader value false',()=>{
        comp.isloading=false;
        expect(document.getElementById('loader')).toBeNull();
    })
   
    
    it('should display loader if loader value true',()=>{
        comp.isloading=true;
        fixer.detectChanges();
        expect('#mloader').toBeTruthy();
    })
    
})
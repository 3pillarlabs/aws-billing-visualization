import { TestBed,ComponentFixture } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { FooterComponent } from './footer.component';

describe('Footer Component inline template',()=>{
    let comp:FooterComponent;
    let fixer:ComponentFixture<FooterComponent>;
    let el: HTMLElement;
    let del:DebugElement;

    beforeEach(()=>{
        TestBed.configureTestingModule({
            declarations:[FooterComponent]
        })

        fixer=TestBed.createComponent(FooterComponent);

        comp=fixer.componentInstance;
    })

    it('should have a defined component', () => {
        expect(comp).toBeDefined();
    });

})
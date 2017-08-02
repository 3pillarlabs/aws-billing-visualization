/* tslint:disable:no-unused-variable */
import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';

import { UploadCsvComponent } from './upload-csv.component';
import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';
import { LoaderComponent } from '../loader/loader.component';
import { FileUploader } from 'ng2-file-upload';
import { AwsdataService } from './../../services/awsdata.service';

describe('UploadCsvComponent', () => {
  let component: UploadCsvComponent;
  let fixture: ComponentFixture<UploadCsvComponent>;
  let awsdataServiceStub = {};

  beforeEach(async(() => {
    TestBed.configureTestingModule({
        declarations: [UploadCsvComponent, HeaderComponent, FooterComponent, LoaderComponent ],
        providers: [{ provide: AwsdataService, useValue: awsdataServiceStub }]
    })
    .compileComponents();
  }));

  beforeEach(() => {
     
    fixture = TestBed.createComponent(UploadCsvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

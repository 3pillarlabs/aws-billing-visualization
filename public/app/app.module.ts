import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from "@angular/forms";

import { AppComponent }   from './app.component';
import { DatatableComponent } from "./components/datatable/datatable.component";
import { AwsdataService } from "./services/awsdata.service";
import { LoaderComponent } from './components/loader/loader.component';
import { PaginationDirective } from './directives/pagination.directive';

import { D3mapComponent } from './components/d3map/d3map.component';
import { ChartComponent } from "./components/chart/chart.component";
import { BarchartComponent } from "./components/chart/barchart.component";
import { ConfigService } from "./services/config.service";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  imports:      [ BrowserModule,HttpModule,FormsModule ],
  declarations: [ 
    AppComponent,
    DatatableComponent,
    LoaderComponent,
    PaginationDirective,
    D3mapComponent,
    ChartComponent,
    HeaderComponent,
    FooterComponent,
    BarchartComponent
     ],
  providers: [ AwsdataService, ConfigService ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }

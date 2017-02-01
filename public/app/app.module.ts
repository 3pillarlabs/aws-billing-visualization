import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from "@angular/forms";

import { AppComponent }   from './app.component';
import { HeatmapComponent }   from './components/heatmap/heatmap.component';
import { DataTableModule } from "angular2-datatable";
import { DataFilterPipe } from "./components/datatable/data-filter.pipe";
import { DatatableComponent } from "./components/datatable/datatable.component";
import { AwsdataService } from "./services/awsdata.service";
import { LoaderComponent } from './components/loader/loader.component';
import { PaginationDirective } from './directives/pagination.directive';

import { D3mapComponent } from './components/d3map/d3map.component';
import { ChartComponent } from "./components/chart/chart.component";
import { ConfigService } from "./services/config.service";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';

@NgModule({
  imports:      [ BrowserModule,HttpModule,FormsModule,DataTableModule ],
  declarations: [ 
    AppComponent,
    HeatmapComponent,
    DatatableComponent,
    DataFilterPipe,
    LoaderComponent,
    PaginationDirective,
    D3mapComponent,
    ChartComponent,
    HeaderComponent,
    FooterComponent
     ],
  providers: [ AwsdataService, ConfigService ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }

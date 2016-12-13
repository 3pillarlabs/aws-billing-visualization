import { NgModule }      from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from "@angular/forms";

import { AppComponent }   from './app.component';
import { HeatmapComponent }   from './components/heatmap/heatmap.component';
import { DataTableModule } from "angular2-datatable";
import { DataFilterPipe } from "./components/datatable/data-filter.pipe";
import { DatatableComponent } from "./components/datatable/datatable.component";

@NgModule({
  imports:      [ BrowserModule,HttpModule,FormsModule,DataTableModule ],
  declarations: [ AppComponent,HeatmapComponent,DatatableComponent,DataFilterPipe ],
  bootstrap:    [ AppComponent ]
})

export class AppModule { }

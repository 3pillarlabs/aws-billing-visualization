import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from "@angular/forms";
import { RouterModule,Routes } from "@angular/router";

import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DatatableComponent } from "./components/datatable/datatable.component";
import { AwsdataService } from "./services/awsdata.service";
import { LoaderComponent } from './components/loader/loader.component';
import { PaginationDirective } from './directives/pagination.directive';

import { D3mapComponent } from './components/d3map/d3map.component';
import { BarchartComponent } from "./components/chart/barchart.component";
import { HeaderComponent } from './components/header/header.component';
import { FooterComponent } from './components/footer/footer.component';
import { MomentPipe } from './moment.pipe';
import { SetupComponent } from './components/setup/setup.component';
import { FullsetupComponent } from './components/fullsetup/fullsetup.component';

const appRoutes: Routes = [
  { path: 'setup', component: FullsetupComponent },
  { path: '', component: DashboardComponent }
];
 

@NgModule({
  imports: [BrowserModule, HttpModule, FormsModule,RouterModule.forRoot(appRoutes)],
  declarations: [
    AppComponent,
    DashboardComponent,
    DatatableComponent,
    LoaderComponent,
    PaginationDirective,
    D3mapComponent,
    HeaderComponent,
    FooterComponent,
    BarchartComponent,
    MomentPipe,
    SetupComponent,
    FullsetupComponent
  ],
  providers: [AwsdataService],
  bootstrap: [AppComponent]
})

export class AppModule { }

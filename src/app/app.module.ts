import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule } from '@angular/http';
import { FormsModule } from "@angular/forms";
import { RouterModule, Routes } from "@angular/router";

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
import { UploadCsvComponent } from './components/upload-csv/upload-csv.component';

import { FileSelectDirective, FileDropDirective } from 'ng2-file-upload';

const appRoutes: Routes = [
    { path: 'setup', component: FullsetupComponent },
    { path: 'billingupload', component: UploadCsvComponent },
    { path: '', component: DashboardComponent }
];


@NgModule({
    imports: [BrowserModule, HttpModule, FormsModule, RouterModule.forRoot(appRoutes)],
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
        FullsetupComponent,
        UploadCsvComponent,
        FileSelectDirective
    ],
    providers: [AwsdataService],
    bootstrap: [AppComponent]
})

export class AppModule { }

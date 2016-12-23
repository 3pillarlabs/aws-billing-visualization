import { Component } from '@angular/core';
@Component({
    moduleId:module.id,
    selector:'aws-billing-loader',
    templateUrl: 'loader.component.html',
    styleUrls:['loader.component.css'],
    inputs:['isloading']
})
export class LoaderComponent{
    isloading:boolean=false;
}
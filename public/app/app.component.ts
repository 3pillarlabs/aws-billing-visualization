import { Component,OnInit } from '@angular/core';

@Component({
  moduleId: module.id,
  selector: 'my-app',
  templateUrl: 'app.component.html'
})

export class AppComponent implements OnInit { 
  mm : number;
	years: number[] =[];
	yy : number;
	
	months = [
	        { val: 1,  name: 'Jan' },
	        { val: 2,  name: 'Feb' },
	        { val: 3,  name: 'Mar' },
	        { val: 4,  name: 'Apr' },
	        { val: 5,  name: 'May' },
	        { val: 6,  name: 'Jun' },
	        { val: 7,  name: 'Jul' },
	        { val: 8,  name: 'Aug' },
	        { val: 9,  name: 'Sep' },
	        { val: 10,  name: 'Oct' },
	        { val: 11,  name: 'Nov' },
	        { val: 12,  name: 'Dec' }
	    ];

    ngOnInit() {  
    	this.getMonth(); 
    	this.getYear();
    	
    } 

    getMonth(){
    	var today = new Date();
	    this.mm = today.getMonth()+1; 
	   
	  }

    getYear(){
        var today = new Date();
        this.yy = today.getFullYear();        
        for(var i = (this.yy-100); i <= this.yy; i++){
        this.years.push(i);}
    }

    yearChange(year:any){
    	this.yy = year;
    	
    }

    monthChange(month:any){
    	this.mm = month;
    } 

}

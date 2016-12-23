import { Component,OnInit,EventEmitter } from '@angular/core';
import { AwsdataService } from './../../services/awsdata.service';
declare var google: any;

@Component({
    moduleId: module.id,
    selector: 'aws-billing-heatmap',
    templateUrl: 'heatmap.component.html',
    styles: [`#map {
				   	height: 300px;
				   	width:600px;
				    }
      		`],
    inputs: ['startdate','enddate'],
	outputs:['isloading']
})

export class HeatmapComponent implements OnInit{
	startdate:any;
	enddate:any;
	company:string='tpg';
	
	isloading=new EventEmitter();

	zoom: number = 1;
	lat: number = -34.397;
  	lng: number = 150.644;
  	
	map:any;
  	heatmap: any;
  	
  	heatmapdata:any=[];
	markers:any=[];
  	heatmaps:any=[];
  	constructor(private _awsregions:AwsdataService){}
	
	ngOnInit(){
		this.map = new google.maps.Map(document.getElementById('map'), {
          zoom: this.zoom,
          center: {lat: this.lat, lng: this.lng}
        });

		var awsdata = {
    		company: this.company,
    		strdate: this.startdate,
    		enddate: this.enddate
		};

		this.drawHeatmapAndMarker(awsdata);
		
    }

    drawHeatmapAndMarker(awsdata:any){
		this._awsregions.getAwsRegions(awsdata).subscribe((data)=>{
			console.log(data);
			
			if(data.length > 0){
				var maxintensity = data[0].totalcost; // Set Max intensity on the basis of region total cost
				
				for(let region of data){
					//console.log(region);
					if(region.totalcost > 0){
						var heatmaplatlong = {location:new google.maps.LatLng(region.lat, region.lng),weight: region.totalcost};
						this.heatmapdata.push(heatmaplatlong);
						this.addMarker(region);
					}
					
			    }

				this.addHeatmap(maxintensity);
				
			}else{
				console.log('else');
				this.removeHeatmap();
				this.removeMarker();
				
			}
			
			this.isloading.emit(false);
		});
    }

    

    addHeatmap(maxintensity:any){
    	this.heatmap = new google.maps.visualization.HeatmapLayer({
          data: this.heatmapdata,
          map: this.map,
          radius: 20,
          maxIntensity: maxintensity
       });

		this.heatmaps.push(this.heatmap);
    }

    removeHeatmap(){
    	for (var i = 0; i < this.heatmaps.length; i++) {
          this.heatmaps[i].setMap(null);
        }
    }

    addMarker(region:any){
    	if(region){
    		var marker = new google.maps.Marker({
	          position: {lat: region.lat, lng: region.lng},
	          map: this.map,
	          title: region.name,
	          code: region.code
	        });

        	this.markers.push(marker);

        	var infowindowcontent='<div id="content"><p><label>Region:</label>'+region.name+'</p><p><label>Total Resouces:</label>'+region.totalresource+'</p><p><label>Total Cost:</label>'+region.totalcost+'</p></div>';
	    	var infowindow = new google.maps.InfoWindow({
				          content: infowindowcontent
				        });
		 	marker.addListener('click', function() {
			         infowindow.open(this.map, marker);
			});
    	}
    	
    	
    }

    removeMarker(){
    	for (var i = 0; i < this.markers.length; i++) {
          this.markers[i].setMap(null);
        }
    }
}
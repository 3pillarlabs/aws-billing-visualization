import { Component,OnInit } from '@angular/core';
declare var google: any;

@Component({
    moduleId: module.id,
    selector: 'aws-billing-heatmap',
    templateUrl: 'heatmap.component.html',
    styles: [`#map {
				   	height: 300px;
				   	width:500px;
				    }
      		`]
})

export class HeatmapComponent implements OnInit{
    zoom: number = 1;
	lat: number = -34.397;
  	lng: number = 150.644;

    ngOnInit(){
        var map = new google.maps.Map(document.getElementById('map'), {
            zoom: this.zoom,
            center: {lat: this.lat, lng: this.lng}
        });

        var heatmap = new google.maps.visualization.HeatmapLayer({
            data: this.getPoints(),
            map: map
        });
    }

    getPoints(){
        return [
	          {location:new google.maps.LatLng(1.338659, 103.647403),weight: 0.5},
	          {location:new google.maps.LatLng(37.566535, 126.977969),weight: 5},
	          {location:new google.maps.LatLng(32.780106, -92.412277),weight: 8000},
	          {location:new google.maps.LatLng(-33.86882, 151.209296),weight: 10},
	          {location:new google.maps.LatLng(-23.55052, -46.633309),weight: 20},
	          {location:new google.maps.LatLng(50.109492, 8.673965),weight: 500},
	          {location:new google.maps.LatLng(43.804133, -120.554201),weight: 2},
	          {location:new google.maps.LatLng(40.694654, -80.953948),weight: 600},
	          {location:new google.maps.LatLng(35.689487, 139.691706),weight: 200},
	          {location:new google.maps.LatLng(37.431573, -78.656894),weight: 400}
          ];
      };
}
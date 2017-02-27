var compass_points = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];

var infowindow = null;
var markers = {};
var map;
var here ;
var items;

var latitude= 0;
var longitude= 0 ;
var last_lat = 0;
var last_long= 0;

var load_lat =0;
var load_long =0;

var delta = 2;  // tolerance in position change for nearest update

var last_near_id = "";

var watching =false;
var watch_id ;

// base function
function radians(degrees) {
   return degrees * Math.PI / 180;
};
 
function degrees(radians) {
   return radians * 180 / Math.PI;
};

function round_degrees(degrees) {
  return  Math.round(degrees * 1000000.0) / 1000000.0; 
}

function distance_direction(flat,flong,slat,slong) {
      midlat = (Number(flat) + Number(slat)) /2.0;
      midrad = radians(midlat);
      longCorr = Math.cos(midrad);
      dlat =  (flat - slat) * 60;
      dlong = (flong - slong) * 60 * longCorr;
      deg = Math.round(degrees(Math.atan2(-dlat,-dlong)));
      if (deg < 0 ) deg +=  360;
      return {distance: Math.round(Math.sqrt((dlat * dlat) + (dlong * dlong)) * 1852 ),
              direction: ( 450 - deg ) % 360
             }
};

function compass_point(dir) {
   var point =  Math.floor((dir + 11.25) / 22.5) % 16 ;
   return compass_points[point];
}

function sort_0(a,b) {
   return ((a[0].distance < b[0].distance) ? -1 : ((a[0].distance > b[0].distance)? 1 : 0 ));
}

//  map creation
// initialize global map variables

function initialize_map(lat , lng){
  var canvas = document.getElementById("map_canvas");
  var position = new google.maps.LatLng(lat,lng);
  map = new google.maps.Map(canvas,{
      zoom:  zoom,
      center: position,
      mapTypeId: 'satellite'
      }); 
  here = new google.maps.Marker({
          position: position,
          title: "Here",
          map: map,
          icon: here_icon
       });
  markers = {};
  infowindow =  new google.maps.InfoWindow( {
          content: "loading ... "
       });      
}


//  functions to update the map

/*
 *  structures
 *    item  array of item objects loaded via AJAX
 *        item has properties
 *            id  unique id
 *            latitude, longitude 
 *            url - link to full data
 *            title
 *            description
 * 
 *    selection
 *         0 - {distance, direction from point}
 *         1 - item
 */

function update_map_markers(selection) {
   var live = {};
   if (debug) alert("selection length "+selection.length);
   for (i in selection){
       var item =selection[i][1];
       var id =item.id;
       var mark =  markers[id];
       var html = item_to_html(item);
       if (mark == undefined )   {    // missing 
               var position = new google.maps.LatLng(item.latitude,item.longitude);
               var icon = item_icon;
               var marker = new google.maps.Marker({
                 position: position,
                 title: item.title,
                 map: map,
                 icon: icon,
                 html: html
              });
              markers[id]=marker;
              live[id]=1;
              google.maps.event.addListener(marker,'click', function() {
                   infowindow.setContent(this.html);
                   infowindow.open(map, this);
              });
          }
       else  { // update
          if (mark.map == null) mark.setMap(map);  
          live[id]=1;
       }
   }
   for (k in markers) {
       if (live[k] == undefined) {
          mark = markers[k];
          mark.setMap(null);  
       }  
   }
   if (selection.length > 0) {
       var item = selection[0][1];
       var near_id = item.id;
       if (near_id != last_near_id) {
          if (last_near_id != "") markers[last_near_id].setIcon(item_icon);
          markers[near_id].setIcon(nearest_icon);
          last_near_id =  near_id;
       }   
     }
   else {
      if (last_near_id != "") {
          markers[last_near_id].setIcon(item_icon);   
          last_near_id = "";
      }
   }
 }

function update_map_here(lat,lng) {
    var position = new google.maps.LatLng(lat,lng);
    map.setCenter(position);
    here.setPosition(position);
}

// web page updating

// update the item sections from a selection
function update_page_nearest(selection) {
       var dist_dir = selection[0];
       var item = selection[1];
       var dist = dist_dir.distance;
       var dir =  dist_dir.direction;
       var compass =  compass_point(dir);
       var directions =  ' Nearest is ' + dist+ "m at " + dir + '° ' + compass; 

       if (debug) alert("nearest "+item.id);
       $('#directions').html(directions);
       $('#summary').html(item_to_summary(item));
       $('#description').html(item_to_description(item));
}

// update the latlong div on the webpage 

function update_page_latlong(latitude,longitude) {
    var position= 'You are at ' +round_degrees(latitude)+","+round_degrees(longitude);
    $('#latlong').html(position);
}

// update the number of loaded items
function update_page_loaded() {
    $('#loaded').html(items.item.length+ " loaded");
}

/* 
   * load items from external source
 */
 
function load_items() {
     var load_range = $('#load_range').val();
     var url = root+items_in_range_url+"?latitude="+latitude+"&longitude="+longitude+"&range="+load_range;
     if(debug) alert (url);
     //start ajax request
     $.ajax({
          url: url,
          //force to handle it as text
           dataType: "text",
           success: function(data) {
                items = $.parseJSON(data);
                items_loaded() ;
           }  
      });
}

function items_loaded() {
    if(debug) alert("loaded");
    update_page_loaded();
    load_lat = latitude;
    load_long = longitude;
    update_item();
}

/*
 * select item within range
 * global - items  
 * input lat, lng  position
 *       range - distance in m from position
 * 
 * output - selection of items in order of increasing distance from position within range, augmented with distance and direction
 */

function nearby(lat,lng,range) {
     var selection =[];
     for (k in items.item) {
         var item = items.item[k];
         var dist_dir = distance_direction(lat,lng,item.latitude,item.longitude);
          if (dist_dir.distance <= range) 
             selection.push([dist_dir,item]);
       }
     if (debug) alert (selection.length);
     return selection.sort(sort_0);       
}

//  main page and map updater

function update_item() {
     var view_range = $('#view_range').val(); 
     if (debug) alert (latitude + "," + longitude + ","+view_range);
     var selection = nearby(latitude,longitude,view_range);
     if (debug) alert (selection.length);
     if (selection.length > 0) {
             update_page_nearest(selection[0]);
             $('#nearby').html(selection.length+" nearby");
             }
     else $('#nearby').html("None");
     update_map_markers(selection);
     last_lat = latitude ;
     last_long = longitude;
}

function set_position(position) {

    latitude = round_degrees(position.coords.latitude);
    longitude = round_degrees(position.coords.longitude);
    if (debug) alert("set position");
    if (map == undefined)  
        initialize_map(latitude , longitude);
    update_map_here(latitude,longitude);
    update_page_latlong(latitude,longitude);
    
    var offset = distance_direction(load_lat,load_long,latitude,longitude).distance;
    var out_of_range = offset > Number(load_range) * 0.9;
    if (debug) alert("Distance from load position "+offset);
    if ( out_of_range || items == undefined) {
        load_items();
    }
    else {
      var d =  distance_direction(last_lat,last_long,latitude,longitude).distance;
      if (debug) alert("distance from last update " + d);
      if (d > delta) {           
            update_item();
      }      
    }
 }

// geolocation

function get_position() {
     if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(set_position, errorFunction,{enableHighAccuracy:true});
    } else {
       alert("no navigator");
    }
};

function watch_change() {
    if(debug) alert("Watching"+watching);
    if (watching) {
        navigator.geolocation.clearWatch(watch_id);
        watching = false;
        $('#watching').text('Watch OFF');
 //       alert("watching now off");
    }
    else {
        if (navigator.geolocation) {
           watch_id =  navigator.geolocation.watchPosition(set_position, errorFunction, {enableHighAccuracy:true,maximumage:30000});
           watching = true;
           $('#watching').text('Watch ON');
 //          alert("watching now on");
        } else {
           alert("no navigator");
        }
   }
};

function errorFunction(position) {
    alert('Error!');
}

$(document).ready(function() { 
     if(debug) alert("initialize");
     get_position();
  });

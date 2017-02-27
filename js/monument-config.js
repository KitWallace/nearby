var root = "";
var item_name = "Monument";
var items_in_range_url = "xquery/monuments-in-range.xq";
var edit_url = "xquery/edit_monument.xq";
var here_icon = "assets/redbullseye.png";
var nearest_icon = "assets/camera-highlight.png";
var item_icon = "assets/camera.png";


var zoom=18;
var load_range=3000;

function item_to_html(item) {
   var html =  "<div>"+item.id+" <em>"+item.title+"</em>"+ "             &#160;<br/>";
   html+=  item.description;
   html += "</div>";
   return html;
};

function item_to_summary(item,dist,dir,compass) {
   var html =  "<div>";
   html+= '<div>'+item.id+' <b>'+item.title+'</b>'+ '</div>';
   html+= '<div>'+' [' + dist+ "m at " + dir + '° ' + compass  +  ']' +'</div>';   html += "</div>";
   return html;
};

function item_to_description(item) {
    return '<div><h2>'+item.title+'</h2>'+item.description + '</div>';
};

var debug = false;

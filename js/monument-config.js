var root = "";
var item_name = "Monument";
var items_in_range_url = "xquery/monuments-in-range.xq";
var edit_url = "xquery/edit_monument.xq";
var here_icon = "assets/redbullseye.png";
var nearest_icon = "assets/camera-highlight.png";
var unseen_icon = "assets/camera.png";
var seen_icon = "assets/greencircle.png";

var zoom=17;
var load_range=3000;

function item_to_html(item) {
   var html =  "<div>"+item.id+" <em>"+item.title+"</em>"+ "             &#160;<br/>";
   html+=  item.description;
   html += "</div>";
   return html;
};

function item_to_div(item,dist,dir) {
   var html =  "<div>";
   html+= '<div>'+item.id+' <em>'+item.title+'</em>'+ '</div>';
   html+= '<div>'+' [' + dist+ "m at " + dir + '° ' + compass_point(dir)  +  ']' +'</div>';
   html+=  item.description;
   html += "</div>";
   return html;
};

var debug = false;

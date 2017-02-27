var root = "";
var item_name = "Monument";
var items_in_range_url = "xquery/monuments-in-range.xq";
var here_icon = "assets/redbullseye.png";
var nearest_icon = "assets/camera-highlight.png";
var item_icon = "assets/camera.png";

var zoom=16;

function item_to_html(item) {
   var html =  '<div>';
   html += '<h2>'+item.title+'</h2>'
   html += '<h3>'+item.period+'</h3>';
   html +=  '<div>'+item.description +'</div>';
   html += "</div>";
   return html;
};

function item_to_summary(item) {
   var html =  "<div>";
   html+= '<h2>'+item.title+'</h2>';
   html += "</div>";
   return html;
};

function item_to_description(item) {
    return '<div><h2>'+item.title+'</h2><h3>Period:'+ item.period+'</h3>'+ item.description + '</div>';
};

var debug = false;

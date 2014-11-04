//This code is for the first Leaflet map which will be a simple choropleth map
var map1 = L.map("choropleth").setView([-30.559482, 22.93750599], 5);
mapLink = '<a href="http://openstreetmap.org">openstreetmap</a>';
L.tileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy;' + mapLink,
		maxZoom: 18,
	}).addTo(map1);

//This code is for the second Leaflet map which will be a mix of a choropleth map with tooltip
var map2 = L.map("mix").setView([-30.559482, 22.93750599], 5);
mapLink = '<a href="http://openstreetmap.org">openstreetmap</a>';
L.tileLayer(
	'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
		attribution: 'Map data &copy; ' + mapLink,
		maxZoom: 18,
	}).addTo(map2);

//This code is for D3js map which will be a choropleth map and tooltip
//Map dimensions (in pixels)
var width = 600,
    height = 400;

//Map projection
var projection = d3.geo.mercator()
    .scale(1500.9006885961765)
    .center([24.698445000000003,-28.671928222300874]) //projection center
    .translate([width/2,height/2]) //translate to center the map in view

//Generate paths based on projection
var path = d3.geo.path()
    .projection(projection);

//Create an SVG
var svg = d3.select("body").append("svg")
    .attr("width", width)
    .attr("height", height);

//Group for the map features
var features = svg.append("g")
    .attr("class","features");

//Create choropleth scale
var color = d3.scale.quantize()
    .domain([1591582,16123308])
    .range(d3.range(5).map(function(i) { return "q" + i + "-5"; }));

//Create zoom/pan listener
//Change [1,Infinity] to adjust the min/max zoom scale
var zoom = d3.behavior.zoom()
    .scaleExtent([1, Infinity])
    .on("zoom",zoomed);

svg.call(zoom);

//Create a tooltip, hidden at the start
var tooltip = d3.select("body").append("div").attr("class","tooltip");

d3.json("lib/southafrica.topojson",function(error,geodata) {
  if (error) return console.log(error); //unknown error, check the console

  //Create a path for each map feature in the data
  features.selectAll("path")
    .data(topojson.feature(geodata,geodata.objects.demarcation).features) //generate features from TopoJSON
    .enter()
    .append("path")
    .attr("d",path)
    .attr("class", function(d) { return (typeof color(d.properties.children) == "string" ? color(d.properties.children) : ""); })
    .on("mouseover",showTooltip)
    .on("mousemove",moveTooltip)
    .on("mouseout",hideTooltip)
    .on("click",clicked);

});

// Add optional onClick events for features here
// d.properties contains the attributes (e.g. d.properties.name, d.properties.population)
function clicked(d,i) {

}


//Update map on zoom/pan
function zoomed() {
  features.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")")
      .selectAll("path").style("stroke-width", 1 / zoom.scale() + "px" );
}


//Position of the tooltip relative to the cursor
var tooltipOffset = {x: 5, y: -25};

//Create a tooltip, hidden at the start
function showTooltip(d) {
  moveTooltip();

  tooltip.style("display","block")
      .text(d.properties.province_name, d.properties.children);
}

//Move the tooltip to track the mouse
function moveTooltip() {
  tooltip.style("top",(d3.event.pageY+tooltipOffset.y)+"px")
      .style("left",(d3.event.pageX+tooltipOffset.x)+"px");
}

//Create a tooltip, hidden at the start
function hideTooltip() {
  tooltip.style("display","none");
}


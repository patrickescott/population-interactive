// Function to format numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

$(document).ready(function(){
	// Read JSON data from source
	$.getJSON("populations.json", function(data){
		// Declare empty array for autocomlete options
		var completers = [];
		$.each(data, function(i, area){
			completers.push(i);
		});
		
		// Set-up auto-complete
		$('#auto').autocomplete({
			source: function(request, response) {
        		var results = $.ui.autocomplete.filter(completers, request.term);
        		response(results.slice(0, 5));
    		}, 
			appendTo: '#widget'
		})
		
		// Define click event to draw in data
		$('#widget').on('click', 'button', function(event){
			event.preventDefault();
			var place = $('#auto').val();
			try {
				$('#response-text')
					.html("In " + place + " there are " + numberWithCommas(data[place].men) + " men and " +
						numberWithCommas(data[place].women) + " women, giving a population of " + numberWithCommas(data[place].men + data[place].women) + ".");
				if($(document).find('svg').length == 0) {
					drawChart(data[place], place);
				} else {
					$(document).find('svg').remove();
					drawChart(data[place], place);
				}
				$( "#response" ).hide().show('slow');
				$( "#chart-container" ).hide().show('slow');
			} catch (error) {
				$('#response-text')
					.html("Enter a valid local authority from the menu.");
				$( "#response" ).hide().show('slow');
			}
		});
	});
});

function drawChart(place_data, place_name) {
	
	$('#chart-header').html("Number of men per woman in " + place_name);
	// Set up global variables
	var margin = 80,
		chart_div = d3.select(".chart"),
		svg = chart_div.append("svg");

	var width, height, x, y, xAxis, xMax;

	var data = [
		{name: 'England', ratio: 0.97},
		{name: 'N. Ireland', ratio: 0.96},
		{name: 'Scotland', ratio: 0.94},
		{name: 'Wales', ratio: 0.97},
		{name: "Your Area", ratio: (place_data.men/place_data.women)}
	];

	data = data.sort(function(a, b) { return a.ratio - b.ratio; });

	xMax = d3.max(data, function(d) { return d.ratio; });

	get_dimensions();

    yAxis = d3.svg.axis()
    			.scale(y)
    			.orient("left");

    d3.select("svg")
		 		.append('g')
		        .attr('class', 'y_axis axis')
		        .attr('transform', "translate(" + margin + ",0)")
		        .call(yAxis);
		          
	d3.select("svg")
		  	.append('g')
		    .attr('class', 'x_axis axis')
		    .attr('transform', "translate(0," + height + ")")
		    .call(xAxis);
			
    // Creates bars
	d3.select('svg')
		  .selectAll("rect")
		.data(data).enter()  
		  .append("rect")
		  .attr("class", "bar")
		  .attr("x", margin)
		  .attr("y", function(d) { return y(d.name); })
		  .attr("width", function(d) { return x(d.ratio) - margin; })
		  .attr("height", y.rangeBand())
		  .attr("fill", function(d){
		  	if(d.name == "Your Area") {return "red";}
		  	else {return "steelblue";}
		  });

	// Define function to get screen size and calculate scales.
	function get_dimensions() {
		

		if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
        	width = parseInt(screen.width, 10) - margin;
    	}
		else {width = parseInt($('#chart-container').width(), 10) - margin - 20;}
		
		height =  90;

		svg.attr("width", width + margin)
		   .attr("height", height + 30);
			        
		// calculate scale for x axis
		x = d3.scale.linear()
			  .range([margin, (margin/2 + width)])
			  .domain([0.8, xMax]);
			        
		// Determines scale for y axis
		y = d3.scale.ordinal()
    		  .rangeRoundBands([height, 0], .1)
    		  .domain(data.map(function(d) { return d.name; }));
			        
		// Creates x-axis
		xAxis = d3.svg.axis()
			      .scale(x)
			      .orient("bottom")
			      .ticks(5);
	};

	function update () {
		get_dimensions();

		d3.selectAll(".bar")
			  .attr("width", function(d) { return x(d.ratio) - margin; });

		d3.select(".x_axis").remove();
		d3.select("svg")
		  .append('g')
		  .attr('class', 'x_axis axis')
		  .attr('transform', "translate(0," + height + ")")
		  .call(xAxis);
	};

	// Listen for resize and update chart
	d3.select(window).on('resize', update); 
}

// Function to format numbers
function numberWithCommas(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function drawChart(place_data, place_name) {
	
	$('#chart-header').html("Number of men per woman in " + place_name);
	$('#scale-header').html("How does " + place_name + " compare to other areas?");
	// Set up global variables
	var margin = 80,
		
		chart_div = d3.select(".chart"),
		svg = chart_div.append("svg"),
		
		scale_div = d3.select("#scale"),
		scale_svg = scale_div.append("svg");

	var width, height, x, y, xAxis, xMax, xScale, scaleXAxis;

	var data = [
		{name: 'England', ratio: 0.97},
		{name: 'N. Ireland', ratio: 0.96},
		{name: 'Scotland', ratio: 0.94},
		{name: 'Wales', ratio: 0.97},
		{name: "Your Area", ratio: (place_data.men/place_data.women)}
	];

	data = data.sort(function(a, b) { return a.ratio - b.ratio; });

	xMax = d3.max(data, function(d) { return d.ratio; });


	var scaleData = [{name: "steelblue", rank: place_data.rank, radius: 30},
					{name: "black", rank: place_data.rank, radius: 2}];

	get_dimensions();

	// Scale y-axis
    yAxis = d3.svg.axis()
    			.scale(y)
    			.orient("left");

    // Append y-axis
    svg
	  .append('g')
	  .attr('class', 'y_axis axis')
	  .attr('transform', "translate(" + margin + ",0)")
	  .call(yAxis);
	// Append x-axis	          
	svg
	  .append('g')
	  .attr('class', 'x_axis axis')
	  .attr('transform', "translate(0," + height + ")")
	  .call(xAxis);
			
    // Creates bars
	svg
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
		  })
		  .attr('stroke', 'black');

	// Creates circles
    scale_svg
        .selectAll("circle")
        .data(scaleData)
        .enter()
        .append('circle');

    // Plots circles
    var circle = d3.selectAll('circle')

    circle
    	.attr('fill', function(d) {
    		return d['name'];
    	})       
    	.attr('r', function(d) {
    		return d.radius;
    	})
    	.attr('cx', function(d) {
            return xScale(196);
        })
        .attr('class', 'bubble')
        .attr('cy', (height/2))
        .attr('stroke', 'black');

    circle
      .transition()
       .attr('cx', function(d) {
            return xScale(d['rank']);
       })
      .delay(800)
      .duration(800)
      .ease("linear");


    scale_svg
	  	.append('g')
	    .attr('class', 'x_axis axis')
	    .attr('transform', "translate(0," + (height/2) + ")")
	    .call(scaleXAxis);

    var men = scale_svg.append("text")
          .attr("y", height)
          .attr("x", margin/4)
          .text("MOST WOMEN");

	var women = scale_svg.append("text")
          .attr("y", height)
          .attr("x", (width - margin/2))
          .text("MOST MEN");

	// Define function to get screen size and calculate scales.
	function get_dimensions() {
		

		if ((navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))) {
        		var ori = window.orientation;
        		width = (ori==90 || ori==-90) ? screen.height : screen.width;
        		width = parseInt(width, 10) - margin - 30;
    		}
		else {width = parseInt($('#chart-container').width(), 10) - margin;}
		
		height =  90;

		svg.attr("width", width + margin)
		   .attr("height", height + 30);
			        
		// calculate scale for x axis
		x = d3.scale.linear()
			  .range([margin, (margin/2 + width)])
			  .domain([0.91, xMax]);
			        
		// Determines scale for y axis
		y = d3.scale.ordinal()
    		  .rangeRoundBands([height, 0], .1)
    		  .domain(data.map(function(d) { return d.name; }));
			        
		// Creates x-axis
		xAxis = d3.svg.axis()
			      .scale(x)
			      .orient("bottom")
			      .ticks(4);


		scale_svg.attr("width", width + margin)
	   		.attr("height", height + 30);
			        
		// calculate scale for x axis
		xScale = d3.scale.linear()
		  .range([(margin/2), (margin/2 + width)])
		  .domain([1, 392]);

		scaleXAxis = d3.svg.axis()
			    	.scale(xScale)
			        .orient("bottom")
			        .ticks(3)
			        .tickFormat(function (d) { return ''; });
	};

	function update () {
		get_dimensions();

		d3.selectAll(".bar")
			  .attr("width", function(d) { return x(d.ratio) - margin; });

		d3.select(".x_axis").remove();
		svg
		  .append('g')
		  .attr('class', 'x_axis axis')
		  .attr('transform', "translate(0," + height + ")")
		  .call(xAxis);


		d3.select(".x_axis").remove();
		scale_svg
		  .append('g')
		  .attr('class', 'x_axis axis')
		  .attr('transform', "translate(0," + (height/2) + ")")
		  .attr('z-index', 'inherit')
		  .call(scaleXAxis);

		circle
		  .attr('cx', function(d) {
            return xScale(d['rank']);
       	  })
       	  .attr('z-index', 4);

		men.attr("x", margin/4);
		women.attr("x", (width - margin/4));
	};

	// Listen for resize and update chart
	d3.select(window).on('resize', update); 
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
				
				$(document).find('svg').remove();
				drawChart(data[place], place);
				
				$( "#scale-container" ).hide().show('slow');
				$( "#response" ).hide().show('slow');
				$( "#chart-container" ).hide().show('slow');
			} catch (error) {
				$('#response-text')
					.html("Enter a valid local authority from the menu.");
				$( "#response" ).hide().show('slow');
				$( "#scale-container" ).hide();
				$( "#chart-container" ).hide();
			}
		});
	});
});

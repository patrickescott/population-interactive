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
						numberWithCommas(data[place].women) + " women, giving a total population of " + numberWithCommas(data[place].men + data[place].women) + ".");
			} catch (error) {
				$('#response-text')
					.html("Enter a valid local authority from the menu.");
			}
			$( "#response" ).hide().show('slow');
		});
	});
});

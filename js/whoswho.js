/**
 * Prevents click-based selectiion of text in all matched elements.
 */
jQuery.fn.disableTextSelect = function() {
	return this.each(function() {
		if( typeof this.onselectstart != "undefined")// IE
		{
			this.onselectstart = function() {
				return false;
			};
		} else if( typeof this.style.MozUserSelect != "undefined")// Firefox
		{
			this.style.MozUserSelect = "none";
		} else// All others
		{
			this.onmousedown = function() {
				return false;
			};
			this.style.cursor = "default";
		}
	});
};
var ids = 0;
var completion = {};

$(document).ready(function() {

	jQuery('.unselectable').disableTextSelect();
	$('.unselectable').hover(function() {
		$(this).css('cursor', 'default');
	}, function() {
		$(this).css('cursor', 'auto');
	});
	/*
	 $.ajax({
	 url : "../community/getmenu.php",
	 dataType : "json",
	 success : function(msg) {

	 console.log(msg);
	 var cata = $("#categorya").get(0);
	 cata.options.length = 0;
	 cata.options[0] = new Option("Select gender", "-1");

	 $.each(msg.d, function(index, item) {
	 cata.options[cata.options.length] = new Option(item.Display, item.Value);
	 });
	 },
	 error : function() {
	 alert("Failed to load genders");
	 }
	 });
	 */
	$('#search-form').hide();
	$('#frame').hide();
	
	$('.topbar').hover(function() {
		$(this).stop().animate({
			"opacity" : 0.98
		}, "fast");
	}, function() {
		$(this).stop().animate({
			"opacity" : 0.93
		}, "fast");
	});
	function popfilter(label, type, options) {
		var id = ids++;
		var id1 = "filter" + id;
		var id2 = "combo" + id;

		var header = '<li id="' + id1 + '" class="filter" style="padding-top: 5px;">';
		var labelization = '<span style="color: #fff;">&nbsp; ' + label + ' </span>';
		//var selection = '<select id="' + id2 + '" class="small filterselect filter' + type + '">' + options + '</select>';
		var input = '<input type="text" id="' + id2 + '" class="medium filter'+type+'" placeholder="' + type + '" />';
		var footer = '</li>;'
		$(header + labelization + input
		// +       selection
		+ footer).insertBefore('#refine');

		$("#" + id2).catcomplete({
			minLength : 2,
			source : function(request, response) {
				var term = request.term;

				$.getJSON("autocomplete.php", {
					category : type,
					term : request.term
				}, function(data, status, xhr) {
					response(data.results);
				});
			}
		});

		$('#' + id1 + '').hide();
		$('#' + id1 + '').fadeIn(500);
		return false;
	};


	$.widget("custom.catcomplete", $.ui.autocomplete, {
		_renderMenu : function(ul, items) {

			var self = this, categories = _.groupBy(items, function(o) {
				return o.category;
			});

			_.each(categories, function(data, category) {
				var size = 0;
				var total = 0;
				var term = "";
				_.each(data, function(item) {
					size = item.size;
					total = item.total;
					term = item.term;
					self._renderItem(ul, item);
				});
				ul.append("<li class='ui-autocomplete-category'>" + size + "/" + total + " results</li>");
				console.log(term);
				ul.highlight(term);
			});
		}
	});

	var cache = {};
	var xhrs = {};

	$('#addfiltercountry').click(function() {
		return popfilter('in', 'countries', []);
	});
	$('#addfilterorganization').click(function() {

		return popfilter('from', 'organizations', []);
	});
	$('#addfilterlaboratory').click(function() {
		var prefix = "working";
		if($(".filterkeywords") || $(".filterlaboratories")) {
			//prefix = "";
		}
		return popfilter(prefix + ' at', 'laboratories', []);

	});

	$('#addfilterkeyword').click(function() {
		var prefix = "working";
		if($(".filterkeywords") || $(".filterlaboratories")) {
			//prefix = "";
		}
		return popfilter(prefix + ' on', 'keywords', []);
	});
	$('#addfiltertag').click(function() {
		return popfilter('tagged', 'tags', []);
	});
	/*
	 $.ajax({
	 url : "../community/getmenu.php",
	 dataType : "json",
	 success : function(msg) {

	 console.log(msg);
	 var cata = $("#categorya").get(0);
	 cata.options.length = 0;
	 cata.options[0] = new Option("Select gender", "-1");

	 $.each(msg.d, function(index, item) {
	 cata.options[cata.options.length] = new Option(item.Display, item.Value);
	 });
	 },
	 error : function() {
	 alert("Failed to load genders");
	 }
	 });
	 */

	$('#loading').hide();
	$('#example').click(function() {
		$('#welcome').toggle('slow', function() {
			$('#loading').toggle('slow');
		});
	});
	$('#generate').click(function() {
		$('#welcome').fadeOut('fasy', function() {
			$('#loading').fadeIn('slow', function() {
			});
			
			console.log("loading");
				var collect = function(k) {
					var t = [];
					console.log("collecting "+'.filter' + k + '');
					$('.filter' + k + '').each(function(i, e) {
						t.push($(e).text());
					});
					return t;
				}
				console.log("collecting..");
				var query = {
					categorya : $('#categorya :selected').text(),
					categoryb : $('#categoryb :selected').text(),
					keywords : collect('keywords'),
					countries : collect('countries'),
					laboratories : collect('laboratories'),
					coloredby : [],
					tags : collect('tags'),
					organizations : collect('organizations')
				};

				console.log(query);
				// we send this to tinaviz to do the job
				
				
				 $.post("../community/getgraph.php", query, function(data) {
				 	
				 	/*
					 $('#loading').hide('slow', function() {
					 // display the TINAVIZ PANEL
					 });*/
				 });
				 
		});
		return false;
	});
});

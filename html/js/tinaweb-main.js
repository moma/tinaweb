
var viz = new Tinaviz();

 /* wait for the applet to be ready */
 viz.ready(function(){
    
        viz.infodiv = Infodiv();
    
        viz.setView("macro");

        var session = viz.session();
        var macro = viz.view("macro");
        var meso = viz.view("meso");

	    session.set("edgeWeight/min", 0.0);
	    session.set("edgeWeight/max", 1.0);
	    session.set("nodeWeight/min", 0.0);
        session.set("nodeWeight/max", 1.0);
	    session.set("category/category", "NGram");
	    session.set("output/nodeSizeMin", 5.0);
	    session.set("output/nodeSizeMax", 20.0);
	    session.set("output/nodeSizeRatio", 50.0/100.0);
	    session.set("selection/radius", 1.0);

	    macro.filter("Category", "category");
	    macro.filter("NodeWeightRange", "nodeWeight");
	    macro.filter("EdgeWeightRange", "edgeWeight");
	    macro.filter("NodeFunction", "radiusByWeight");
	    macro.filter("Output", "output");

	    meso.filter("SubGraphCopyStandalone", "category");
	    meso.set("category/source", "macro");
	    meso.set("category/category", "Document");
	    meso.set("category/mode", "keep");

	    meso.filter("NodeWeightRangeHack", "nodeWeight");
	    meso.filter("EdgeWeightRangeHack", "edgeWeight");
	    meso.filter("NodeFunction", "radiusByWeight");
	    meso.filter("Output", "output");

	    viz.readGraphJava("macro", "FET60bipartite_graph_cooccurrences_.gexf");

        // init the node list with ngrams
	    viz.updateNodes( "macro", "NGram" );

        // cache the document list
	    viz.getNodes( "macro", "Document" );

        $("#waitMessage").hide();
        
	    infodiv.display_current_category();
	    infodiv.display_current_view();
});
    
$(document).ready(function(){

    //No text selection on elements with a class of 'noSelect'
    $('.noSelect').disableTextSelect();
    $('.noSelect').hover(function() {
        $(this).css('cursor','default');
    }, function() {
        $(this).css('cursor','auto');
    });

    $("#title").html("FET Open projects explorer");
    var infodiv = new InfoDiv("#infodiv");

    // auto-adjusting infodiv height
    var new_size = tinaviz.getHeight() - 40;
    $(infodiv.id).css( 'height', new_size);

    $(infodiv.id).accordion({
        fillSpace: true,
    });

    // cleans infodiv
    infodiv.reset();
    // passing infodiv to tinaviz is REQUIRED
    tinaviz.infodiv = infodiv;

    // TODO : handler to open a graph file
    /*$('#htoolbar input[type=file]').change(function(e){
        tinaviz.loadAbsoluteGraph( $(this).val() );
    });*/

    // all hover and c$( ".selector" ).slider( "option", "values", [1,5,9] );lick logic for buttons
    $(".fg-button:not(.ui-state-disabled)")
    .hover(
        function(){
            $(this).addClass("ui-state-hover");
        },
        function(){
            $(this).removeClass("ui-state-hover");
        }
    )
    .mousedown(function(){
        $(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
        if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ) {
            $(this).removeClass("ui-state-active");
        }
        else {
            $(this).addClass("ui-state-active");
        }
    })
    .mouseup(function(){
        if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ) {
            $(this).removeClass("ui-state-active");
        }
    });

    // binds the click event to tinaviz.searchNodes()

    $("#search").submit(function() {
      var txt = $("#search_input").val();
      if (txt=="") {
            tinaviz.unselect();
      } else {
            tinaviz.searchNodes(txt, "containsIgnoreCase");
      }
      return false;
    });
    /*
    $("#search").keypress(function() {
      var txt = $("#search_input").val();
      if (txt=="") {
        tinaviz.unselect();
      } else {
           tinaviz.highlightNodes(txt, "containsIgnoreCase");
      }
    });
    */
    $("#level").button({
        text: true,
        icons: {
            //primary: null,
            secondary: 'ui-icon-help'
        }
    }).click( function(eventObject) {
        tinaviz.toggleView();
    });
    
    $("#search_button").button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click( function(eventObject) {
          var txt = $("#search_input").val();
          if (txt=="") {
                tinaviz.unselect();
          } else {
                tinaviz.searchNodes(txt, "containsIgnoreCase");
          }
    });

    // SLIDERS INIT
    $.extend($.ui.slider.defaults, {
        //range: "min",
        min: 0,
        max: 100,
        value: 100.0,
        animate: true,
        orientation: "horizontal",
    });

    // MACRO SLIDERS
    $("#sliderEdgeWeight").slider({
        range: true,
        values: [0, 100],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "edgeWeight/min", ui.values[0] / 100.0);
            tinaviz.setProperty("current", "edgeWeight/max", ui.values[1] / 100.0);
            tinaviz.resetLayoutCounter();
            tinaviz.touch();
            if (tinaviz.getView()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeWeight").slider({
        range: true,
        values: [0, 100],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "nodeWeight/min", ui.values[0] / 100.0);
            tinaviz.setProperty("current", "nodeWeight/max", ui.values[1] / 100.0);
            tinaviz.resetLayoutCounter();
            tinaviz.touch();
            if (tinaviz.getView()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeSize").slider({
        value: 50.0,
        max: 100.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "output/nodeSizeRatio", ui.value / 100.0);
            //tinaviz.resetLayoutCounter();
            tinaviz.touch();
        }}
    );

    $("#sliderSelectionZone").slider({
        value: 1.0,
        max: 300.0, // max disk radius, in pixel
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "selection/radius", ui.value);
            tinaviz.touch();
        }
    });

    $("#toggle-showLabels").click(function(event) {
        tinaviz.toggleLabels();
    });

    $("#toggle-showNodes").click(function(event) {
        tinaviz.toggleNodes();
    });

    $("#toggle-showEdges").click(function(event) {
        tinaviz.toggleEdges();
    });

    $("#toggle-paused").button({
        icons: {primary:'ui-icon-pause'},
        text: true,
        label: "pause",
    })
    .click(function(event) {
        tinaviz.togglePause();
        if( $("#toggle-paused").button('option','icons')['primary'] == 'ui-icon-pause'  ) {
            $("#toggle-paused").button('option','icons',{'primary':'ui-icon-play'});
            $("#toggle-paused").button('option','label',"play");
        }
        else {
            $("#toggle-paused").button('option','icons',{'primary':'ui-icon-pause'});
            $("#toggle-paused").button('option','label',"pause");
        }
    });

    $("#toggle-unselect").button({
        icons: {primary:'ui-icon-close'},
    }).click(function(event) {
        tinaviz.unselect();
    });

    $("#toggle-autoCentering").button({
        text: true,
        icons: {
            primary: 'ui-icon-home'
        }
    })
    .click(function(event) {
        tinaviz.autoCentering();
    });

    $("#toggle-switch").button({
        text: true,
        icons: {
            primary: 'ui-icon-arrows'
        },
    }).click(function(event) {
        tinaviz.toggleCategory("current");
    });

   $('#waitMessage').effect('pulsate', {}, 'fast');

    $(window).bind('resize', function() {
        if (tinaviz.isEnabled()) {
            tinaviz.auto_resize();
            $("#infodiv").css( 'height', getScreenHeight() - $("#hd").height() - $("#ft").height() - 60);
        }
    });
});

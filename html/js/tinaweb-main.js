
 /* useful for fullscreen mode */
function getScreenWidth() {
    var x = 0;
    if (self.innerHeight) {
            x = self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
            x = document.documentElement.clientWidth;
    }
    else if (document.body) {
            x = document.body.clientWidth;
    }
    return x;
}

/* useful for fullscreen mode */
function getScreenHeight() {
    var y = 0;
    if (self.innerHeight) {
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        y = document.documentElement.clientHeight;
    }
    else if (document.body) {
        y = document.body.clientHeight;
    }

    return y;
}



var tinaviz = {};
    
$(document).ready(function(){

    tinaviz = new Tinaviz({
        tag: $("#vizdiv"),
        path: "js/tinaviz/",
        context: "",
        engine: "software",
        width: 0,
        height: 0
    });

    tinaviz.ready(function(){
    
        var infodiv =  InfoDiv('infodiv');
        tinaviz.infodiv = infodiv;

        /***************** SET SIZES *****************/
        var infoDivWidth = 390;
     
        var w = getScreenWidth() - infoDivWidth - 30;
        var h = getScreenHeight() - $("#hd").height() - $("#ft").height() - 60;
        
        $("#infodiv").css('height', ""+(h - 12)+"px");
        $("#infodiv").css('width', ""+(infoDivWidth)+"px");
        
        $(".accord_entry").css('height', ""+(h - 70)+"px");
        /*********************************************/
        
        
        $("#infodiv").accordion({
            fillSpace: true,
            autoHeight: false,
            clearStyle: true, // keep it to true for tinaweb
            animated: 'easyslide',
        });

        infodiv.reset();

        tinaviz.setView("macro");

        var session = tinaviz.session();
        var macro = tinaviz.view("macro");
        var meso = tinaviz.view("meso");

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

	    tinaviz.readGraphJava("macro", "French_bipartite_graph.gexf");

        // todo: should be asynchronous
        // init the node list with ngrams
	    tinaviz.updateNodes( "macro", "NGram" );

        // cache the document list
	    tinaviz.getNodes( "macro", "Document" );
       
        
	    infodiv.display_current_category();
	    infodiv.display_current_view();
	  
	    
	    // magic trick to make the visualization appear only at the end
        $("#appletInfo").hide();
	    tinaviz.size(w, h);
    });

    //No text selection on elements with a class of 'noSelect'
    
    $(function(){
        $.extend($.fn.disableTextSelect = function() {
            return this.each(function() {
                if($.browser.mozilla){//Firefox $("#sliderEdgeWeight")
                    $(this).css('MozUserSelect','none');
                } else if($.browser.msie) {//IE
                    $(this).bind('selectstart',function(){return false;});
                } else {//Opera, etc.
                    $(this).mousedown(function(){return false;});
                }
            });
        });
    });

    $('.noSelect').disableTextSelect();
    $('.noSelect').hover(function() {
        $(this).css('cursor','default');
    }, function() {
        $(this).css('cursor','auto');
    });

    $("#title").html("Mapping of French Complex Systems Scholars - <a href=\"http://tinasoft.eu/Feedback\">report a bug</a>");


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
            var view = tinaviz.view();
            view.set("edgeWeight/min", ui.values[0] / 100.0);
            view.set("edgeWeight/max", ui.values[1] / 100.0);
            view.resetLayoutCounter();
            view.commitProperties();
            if (tinaviz.getViewName()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeWeight").slider({
        range: true,
        values: [0, 100],
        animate: true,
        slide: function(event, ui) {
            var view = tinaviz.view();
            view.set("nodeWeight/min", ui.values[0] / 100.0);
            view.set("nodeWeight/max", ui.values[1] / 100.0);
            view.resetLayoutCounter();
            view.commitProperties();
            if (tinaviz.getViewName()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeSize").slider({
        value: 50.0,
        max: 100.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            var view = tinaviz.view();
            view.set("output/nodeSizeRatio", ui.value / 100.0);
            view.commitProperties();
        }}
    );

    $("#sliderSelectionZone").slider({
        value: 1.0,
        max: 300.0, // max disk radius, in pixel
        animate: true,
        slide: function(event, ui) {
            var view = tinaviz.view();
            view.set("selection/radius", ui.value);
            view.commitProperties();
        }
    });

    /** DISABLED **
    $("#toggle-showLabels").click(function(event) {
        tinaviz.toggleLabels();
    });

    $("#toggle-showNodes").click(function(event) {
        tinaviz.toggleNodes();
    });

    $("#toggle-showEdges").click(function(event) {
        tinaviz.toggleEdges();
    });

    **/
    
    $("#toggle-paused").button({
        icons: {primary:'ui-icon-pause'},
        text: true,
        label: "pause",
    })
    .click(function(event) {
        tinaviz.togglePause();
        var p = $("#toggle-paused");
        if( p.button('option','icons')['primary'] == 'ui-icon-pause'  ) {
            p.button('option','icons',{'primary':'ui-icon-play'});
            p.button('option','label',"play");
        } else {
            p.button('option','icons',{'primary':'ui-icon-pause'});
            p.button('option','label',"pause");
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

   $('#appletInfo').effect('pulsate', {}, 'fast');

    $(window).bind('resize', function() {
        if (!tinaviz.isEnabled()) return; 

        /***************** SET SIZES *****************/
        var infoDivWidth = 390;
     
        var w = getScreenWidth() - infoDivWidth - 30;
        var h = getScreenHeight() - $("#hd").height() - $("#ft").height() - 60;
        
        $("#infodiv").css('height', ""+(h - 12)+"px");
        $("#infodiv").css('width', ""+(infoDivWidth)+"px");
        
        $(".accord_entry").css('height', ""+(h - 70)+"px");
        /*********************************************/
       
        tinaviz.size(w, h);
        
    });
});

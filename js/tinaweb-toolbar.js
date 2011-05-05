/*
    Copyright (C) 2009-2011 CREA Lab, CNRS/Ecole Polytechnique UMR 7656 (Fr)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/
/* useful for fullscreen mode */
var tinaviz = {};

$(document).ready(function(){

    // SLIDERS INIT
    $.extend($.ui.slider.defaults, {
        //range: "min",
        min: 0,
        max: 100,
        value: 100.0,
        animate: true,
        orientation: "horizontal"
    });

    //No text selection on elements with a class of 'noSelect'

    $(function(){
        $.extend($.fn.disableTextSelect = function() {
            return this.each(function() {
                if($.browser.mozilla){//Firefox $("#sliderEdgeWeight")
                    $(this).css('MozUserSelect','none');
                } else if($.browser.msie) {//IE
                    $(this).bind('selectstart',function(){
                        return false;
                    });
                } else {//Opera, etc.
                    $(this).mousedown(function(){
                        return false;
                    });
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


    $("#nodeRadiusSelector").change(function() {
        //alert("SET RADIUS TO "+$("#nodeRadiusSelector").val());
        tinaviz.set("filter.map.node.radius",$("#nodeRadiusSelector").val(), "String");
    });

    $("#nodeShapeSelector").change(function() {
        tinaviz.set("filter.map.node.shape",$("#nodeShapeSelector").val(), "String");
    });

    $("#nodeColorSelector").change(function() {
        //alert("SET COLOR TO "+ $("#nodeColorSelector").val(), true);
        tinaviz.set("filter.map.node.color",$("#nodeColorSelector").val(), "String");
    });

});

var toolbar = {
    values: {
        search: "",
        sliders: {
            magnify: 0.5,
            cursor_size: 0.5,
            nodeFilter: {
                min: 0.0,
                max: 1.0
            },
            edgeFilter: {
                min: 0.0,
                max: 1.0
            }
        },
        buttons: {
            pause: false,
            showNodes: true,
            showEdges: true,
            hd: false
        }
    }
};


toolbar.lastSearch = "";
toolbar.checkSearchForm = function() {
    var txt = $("#search_input").val();
    if (txt != toolbar.lastSearch) {
        // tinaviz.highlightByPattern("", "");
        toolbar.lastSearch = txt;
        //if (txt=="") {
            //tinaviz.highlightByPattern("", "");
        //} 
        //else {
            //var cat = tinaviz.views.current.category();
            tinaviz.highlightByPattern(txt, "containsIgnoreCase");
        //}
    }
    setTimeout("toolbar.checkSearchForm()",200);
};

toolbar.checkSearchFormNoRepeat = function() {
    var txt = $("#search_input").val();
    if (txt != toolbar.lastSearch) {
        // tinaviz.highlightByPattern("", "");
        toolbar.lastSearch = txt;
        //if (txt=="") {
            //tinaviz.highlightByPattern("", "");
        //}
        //else {
            //var cat = tinaviz.views.current.category();
            tinaviz.highlightByPattern(txt, "containsIgnoreCase");
        //}
    }
};

toolbar.runSearchFormNoRepeat = function() {

          var txt = $("#search_input").val();
         //if (txt=="") {
         tinaviz.unselect();
         tinaviz.infodiv.reset();
         //}

           var cat = tinaviz.getCategory();
           if (cat == "Document") {
              tinaviz.selectByNeighbourPattern(txt, "containsIgnoreCase", tinaviz.getOppositeCategory(cat));
           } else {
              tinaviz.selectByPattern(txt, "containsIgnoreCase");
           }
           tinaviz.centerOnSelection();


};

toolbar.init = function() {

   //  $("#search").autocomplete({ source: ["aaa","bbb","ccc"] });
    
    //$("#search").val(toolbar.values.search);
    $("#search").submit(function() {
        
      toolbar.runSearchFormNoRepeat();
    
     return false;
    });


    $("#search").keypress(function() {
       toolbar.checkSearchFormNoRepeat();
    });

    $("#export-gexf").button({
       text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click( function(eventObject) {
        tinaviz.set("export","GEXF", "String");
    });

    $("#export-png").button({
       text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click( function(eventObject) {
        tinaviz.set("export","PNG", "String");
    });
    $("#export-pdf").button({
       text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click( function(eventObject) {
        tinaviz.set("export","PDF", "String");
    });

    $("#level").button({
        text: true,
        icons: {
            primary: 'ui-icon-help'
        }
    }).click( function(eventObject) {
        tinaviz.toggleView();
    });
    $("#level").attr("title","click to switch the level");
    $("#search_button").button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click( function(eventObject) {

    });

    // MACRO SLIDERS
    $("#sliderAEdgeWeight").slider({
        range: true,
        values: [parseFloat(prefs.a_edge_filter_min) * 200.0, parseFloat(prefs.a_edge_filter_max) * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.a.edge.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });

    $("#sliderANodeWeight").slider({
        range: true,
        values: [parseFloat(prefs.a_node_filter_min) * 200.0, parseFloat(prefs.a_node_filter_max) * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.a.node.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });

    // MACRO SLIDERS
    $("#sliderBEdgeWeight").slider({
        range: true,
        values: [parseFloat(prefs.b_edge_filter_min) * 200.0, parseFloat(prefs.b_edge_filter_max) * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.b.edge.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });

    $("#sliderBNodeWeight").slider({
        range: true,
        values: [parseFloat(prefs.b_node_filter_min) * 200.0, parseFloat(prefs.b_node_filter_max) * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.b.node.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });

    $("#sliderANodeSize").slider({
        value: prefs.a_node_size * 200.0,
        max: 200.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.a.node.size", ui.value / 200.0, "Double");
        }
    }
    );

    $("#sliderBNodeSize").slider({
        value: prefs.b_node_size * 200.0,
        max: 200.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.b.node.size", ui.value / 200.0, "Double");
        }
    }
    );


    $("#sliderSelectionZone").slider({
        value: toolbar.values.sliders.cursor_size,
        max: 300.0, // max disk radius, in pixel
        animate: true,
        change: function(event, ui) {
            tinaviz.set("selectionRadius", ui.value, "Double");
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
        icons: {
            primary:'ui-icon-pause'
        },
        text: true,
        label: "pause"
    })
    .click(function(event) {
        tinaviz.togglePause();
        var p = $("#toggle-paused");
        if( p.button('option','icons')['primary'] == 'ui-icon-pause'  ) {
            p.button('option','icons',{
                'primary':'ui-icon-play'
            });
            p.button('option','label',"play");
        } else {
            p.button('option','icons',{
                'primary':'ui-icon-pause'
            });
            p.button('option','label',"pause");
        }
    });

    $("#toggle-unselect").button({
        icons: {
            primary:'ui-icon-close'
        }
    }).click(function(event) {
        toolbar.lastsearch = "";
        tinaviz.unselect();
        tinaviz.infodiv.reset();
    });

    $("#toggle-recenter").button({
        text: true,
        icons: {
            primary: 'ui-icon-home'
        }
    })
    .click(function(event) {
        //tinaviz.recenter();
        tinaviz.centerOnSelection();
    });

    // switch category
    $("#toggle-switch").button({
        text: true,
        icons: {
            primary: 'ui-icon-arrows'
        }
    }).click(function(event) {
        var cat = tinaviz.getCategory();
        var next_cat = tinaviz.getOppositeCategory( cat );
        var viewName = tinaviz.getView();
        if (viewName == "macro") {
            if (next_cat=="Document") {
                $("#category-A").fadeIn("slow");
                $("#category-B").fadeOut("slow");
            } else if (next_cat=="NGram") {
                $("#category-A").fadeOut("slow");
                $("#category-B").fadeIn("slow");
            }
        } else {
           $("#category-A").fadeIn("slow");
           $("#category-B").fadeIn("slow");
        }

       var neighbours = tinaviz.infodiv.neighbours;
        //console.log(neighbours);
        //tinaviz.infodiv.reset();
        tinaviz.setCategory(next_cat); // TODO we should use a callback to wait for the category change, here
        tinaviz.centerOnSelection();
        $.doTimeout(800, function(){
           if (viewName=="macro") {
               var myArray = new Array();
               for (var pos in neighbours) {
                     myArray.push(neighbours[pos]);
               }
               tinaviz.select(myArray);
           }

            tinaviz.infodiv.updateNodeList(viewName, next_cat);
                   //console.log(neighbours);
           tinaviz.infodiv.display_current_category();
                  //tinaviz.unselect();


           false;
       });

    });

       // default settings
       $("#export-view").hide();
       $("#search").hide();
       $("#export-gexf").hide();
       $("#level").hide();
       $("#search_button").hide();
       $("#toggle-recenter").hide();
       $("#toggle-switch").hide();
       $("#toggle-unselect").hide();
       $("#toggle-paused").hide();
       $("#cursor-size-block").hide();
       $("#category-A").hide();
       $("#category-B").hide();
       $("#category-legend").hide();


    // DISABLED toolbar.checkSearchForm();

};
toolbar.resetSlidersValues = function() {
    $("#sliderAEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.a.edge.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });
    $("#sliderANodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.a.node.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });
    $("#sliderBEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.b.edge.weight", [ui.values[0] / 200.0,ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });
    $("#sliderBNodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 200.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.b.node.weight", [ui.values[0] / 200.0, ui.values[1] / 200.0], "Tuple2[Double]");
            tinaviz.recenter();
        }
    });
    $("#sliderANodeSize").slider({
        value: toolbar.values.sliders.magnify * 200.0,
        max: 200.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.a.node.size", ui.value / 200.0, "Double");
        }
    }
    );

    $("#sliderBNodeSize").slider({
        value: toolbar.values.sliders.magnify * 200.0,
        max: 200.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("filter.b.node.size", ui.value / 200.0, "Double");
        }
    }
    );
}
toolbar.updateButton = function(button, state) {

    toolbar.values.buttons[button] = state;
    $("#toggle-"+button).toggleClass("ui-state-active", state);
};

/**
 * Update function, ot be used later
 *
 */
toolbar.update = function(vals) {

};

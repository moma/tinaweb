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

toolbar.init = function() {

   //  $("#search").autocomplete({ source: ["aaa","bbb","ccc"] });
    
    $("search").val(toolbar.values.search);
    $("#search").submit(function() {
        
        var txt = $("#search_input").val();
         tinaviz.unselect();
         tinaviz.infodiv.reset();

        //if (txt=="") {

        //} else {
            // earchNodes= function(matchLabel, matchCategory, matchView, matchType, targetView)
           // var cat = tinaviz.getCategory();
            //if (cat=="Document") {
            //    var cat2 = tinaviz.getOppositeCategory(cat);
            //    tinaviz.searchNodes(txt,cat2, "current", "containsIgnoreCase", "visualization");
            //} else {
           tinaviz.selectByPattern(txt, "containsIgnoreCase");
           tinaviz.centerOnSelection();
           // }
        //}
    
     return false;
    });


    $("#search").keypress(function() {
       toolbar.checkSearchForm();
    });
    
    $("#export-view").button({
       text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click( function(eventObject) {
        tinaviz.set("export","gexf", "String");
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
        var txt = $("#search_input").val();
        if (txt=="") {
            tinaviz.unselect();
            tinaviz.infodiv.reset();
        } else {
            tinaviz.selectByPattern(txt, "containsIgnoreCase");
            tinaviz.centerOnSelection();
        }
    });

    // MACRO SLIDERS
    $("#sliderAEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.a.edge.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.a.edge.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    $("#sliderANodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.a.node.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.a.node.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    // MACRO SLIDERS
    $("#sliderBEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.b.edge.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.b.edge.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    $("#sliderBNodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.b.node.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.b.node.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    $("#sliderANodeSize").slider({
        value: toolbar.values.sliders.magnify * 200.0,
        max: 200.0,// precision/size
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.a.node.size", ui.value / 200.0, "Double");
            //if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    }
    );

    $("#sliderBNodeSize").slider({
        value: toolbar.values.sliders.magnify * 200.0,
        max: 200.0,// precision/size
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.b.node.size", ui.value / 200.0, "Double");
            //if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    }
    );
    // default settings
    $("#export-view").button("disable");
    $("#level").button("disable");
    $("#search_button").button("disable");
    $("#toggle-recenter").button("disable");
    $("#sliderSelectionZone").slider( "disable" );
    $("#sliderANodeWeight").slider( "disable" );
    $("#sliderAEdgeWeight").slider( "disable" );
    $("#sliderANodeSize").slider( "disable" );
    $("#sliderBNodeWeight").slider( "disable" );
    $("#sliderBEdgeWeight").slider( "disable" );
    $("#sliderBNodeSize").slider( "disable" );


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
        tinaviz.recenter();
    });

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
                $("#sliderANodeWeight").slider( "enable" );
                $("#sliderAEdgeWeight").slider( "enable" );
                $("#sliderANodeSize").slider( "enable" );
                $("#sliderBNodeWeight").slider( "disable" );
                $("#sliderBEdgeWeight").slider( "disable" );
                $("#sliderBNodeSize").slider( "disable" );
            } else if (next_cat=="NGram") {
                $("#sliderANodeWeight").slider( "disable" );
                $("#sliderAEdgeWeight").slider( "disable" );
                $("#sliderANodeSize").slider( "disable" );
                $("#sliderBNodeWeight").slider( "enable" );
                $("#sliderBEdgeWeight").slider( "enable" );
                $("#sliderBNodeSize").slider( "enable" );
            }
        } else {
            $("#sliderANodeWeight").slider( "enable" );
            $("#sliderAEdgeWeight").slider( "enable" );
            $("#sliderANodeSize").slider( "enable" );
            $("#sliderBNodeWeight").slider( "enable" );
            $("#sliderBEdgeWeight").slider( "enable" );
            $("#sliderBNodeSize").slider( "enable" );
        }

       var neighbours = tinaviz.infodiv.neighbours;
       console.log(neighbours);
       tinaviz.setCategory(next_cat);
       tinaviz.infodiv.reset();
       tinaviz.infodiv.updateNodeList(viewName, next_cat);
       console.log(neighbours);
       tinaviz.infodiv.display_current_category();
       for (var pos in neighbours) {
                //console.log("switch category, selecting node from id "+tinaviz.infodiv.neighbours[pos]);
                 //alert("selecting "+neighbours[pos]);
                 // too fast
                 tinaviz.select(neighbours[pos]);
        }

        tinaviz.centerOnSelection();

    });
    toolbar.checkSearchForm();
};
toolbar.resetSlidersValues = function() {
// MACRO SLIDERS
    $("#sliderAEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.a.edge.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.a.edge.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    $("#sliderANodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.a.node.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.a.node.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    // MACRO SLIDERS
    $("#sliderBEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.b.edge.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.b.edge.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    $("#sliderBNodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 200.0],
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.b.node.weight.min", ui.values[0] / 200.0, "Double");
            tinaviz.set("filter.b.node.weight.max", ui.values[1] / 200.0, "Double");
            if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    });

    $("#sliderANodeSize").slider({
        value: toolbar.values.sliders.magnify * 200.0,
        max: 200.0,// precision/size
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.a.node.size", ui.value / 200.0, "Double");
            //if (tinaviz.getView()=="meso") tinaviz.recenter();
        }
    }
    );

    $("#sliderBNodeSize").slider({
        value: toolbar.values.sliders.magnify * 200.0,
        max: 200.0,// precision/size
        animate: true,
        change: function(event, ui) {
            tinaviz.set("filter.b.node.size", ui.value / 200.0, "Double");
            //if (tinaviz.getView()=="meso") tinaviz.recenter();
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

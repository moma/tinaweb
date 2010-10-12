//      This program is free software; you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation; either version 2 of the License, or
//      (at your option) any later version.
//
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//
//      You should have received a copy of the GNU General Public License
//      along with this program; if not, write to the Free Software
//      Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
//      MA 02110-1301, USA.

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
       alert("SET RADIUS TO "+$("#nodeRadiusSelector").val());
       tinaviz.views.current.set("output/radius",$("#nodeRadiusSelector").val());
       tinaviz.commit();
    }); 
    
   $("#nodeWeightSelector").change(function() { 
       alert("SET WEIGHT TO "+$("#nodeShapeSelector").val());
       tinaviz.views.current.set("output/weight",$("#nodeShapeSelector").val());
       tinaviz.commit();
    }); 
    
   $("#nodeShapeSelector").change(function() { 
       alert("SET SHAPE TO "+$("#nodeShapeSelector").val());
       tinaviz.views.current.set("output/shape",$("#nodeShapeSelector").val());
       tinaviz.commit();
    }); 
    
   $("#nodeColorSelector").change(function() { 
       alert("SET COLOR TO "+ $("#nodeColorSelector").val());
       tinaviz.views.current.set("output/color",$("#nodeColorSelector").val());
       tinaviz.commit();
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
            tinaviz.unselect();
           toolbar.lastSearch = txt;   
          if (txt=="") {
             tinaviz.searchNodes("", "", "", "", false);
          } else {
              var cat = tinaviz.views.current.category();
               tinaviz.searchNodes(txt, cat, "containsIgnoreCase", "current", true);
          }
      }
   setTimeout("toolbar.checkSearchForm()",200);
};

toolbar.init = function() {
    
    $("search").val(toolbar.values.search);
    
    $("#search").submit(function() {
        /*
        var txt = $("#search_input").val();
         tinaviz.unselect();
         
        if (txt=="") {

        } else {
            // earchNodes= function(matchLabel, matchCategory, matchView, matchType, targetView)
            var cat = tinaviz.getCategory();
            //if (cat=="Document") {
            //    var cat2 = tinaviz.getOppositeCategory(cat);
            //    tinaviz.searchNodes(txt,cat2, "current", "containsIgnoreCase", "visualization");
            //} else {
                tinaviz.searchNodes(txt, cat, "containsIgnoreCase", "current");
           // }
        }
        */
        return false;
    });
    
    /*
    $("#search").keypress(function() {
       // toolbar.checkSearchForm();
    });*/
 
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
        } else {
            tinaviz.searchNodes(txt, "containsIgnoreCase");
        }
    });

    // MACRO SLIDERS
    $("#sliderEdgeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.edgeFilter.min, toolbar.values.sliders.edgeFilter.max * 100.0],
        animate: true,
        slide: function(event, ui) {
            
            tinaviz.set("edgeWeight/min", ui.values[0] / 100.0);
            tinaviz.set("edgeWeight/max", ui.values[1] / 100.0);
            tinaviz.set("layout/iter", 0);
            tinaviz.commit();
            if (tinaviz.views.current.name()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeWeight").slider({
        range: true,
        values: [toolbar.values.sliders.nodeFilter.min, toolbar.values.sliders.nodeFilter.max * 100.0],
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("nodeWeight/min", ui.values[0] / 100.0);
            tinaviz.set("nodeWeight/max", ui.values[1] / 100.0);
            tinaviz.set("layout/iter", 0);
            tinaviz.commit();
            if (tinaviz.views.current.name()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeSize").slider({
        value: toolbar.values.sliders.magnify * 100.0,
        max: 100.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("output/scaling", ui.value / 100.0);
            tinaviz.commit();
        }
    }
    );

    $("#sliderSelectionZone").slider({
        value: toolbar.values.sliders.cursor_size,
        max: 300.0, // max disk radius, in pixel
        animate: true,
        slide: function(event, ui) {
            tinaviz.set("selection/radius", ui.value);
            tinaviz.commit();
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
        }
    }).click(function(event) {
        /**
         * Manually toggles the category, and do the bipartite work
         */


        var view = tinaviz.views.current;
        // get and set the new category to display
        var cat = view.category();

        var next_cat = tinaviz.getOppositeCategory( cat );

        // update the node list
        tinaviz.updateNodes(view.name(), next_cat);

        // update the algorithm
        view.categories[cat].layout.iter = view.get("layout/iter");
        view.set("layout/iter", view.categories[next_cat].layout.iter);
        view.category(next_cat);
        view.commit();
            
        tinaviz.autoCentering();

        if (view.name()=="macro") {
            // empty the selection, and ask the applet to select opposite nodes
            var i = 0;
            tinaviz.infodiv.selection = {};
            for (var nbid in tinaviz.infodiv.oppositeSelection) {
                var cb = (++i == tinaviz.infodiv.oppositeSelection.length);
                tinaviz.selectFromId(tinaviz.infodiv.oppositeSelection[nbid], cb);
            }
        }
        tinaviz.infodiv.display_current_category();
        
    });

    toolbar.checkSearchForm();
};

toolbar.updateButton = function(button, state) {

    toolbar.values.buttons[button] = state;
    $("#toggle-"+button).toggleClass("ui-state-active", state);
};

toolbar.update = function(vals) {
    console.dir(vals);
    
    for (v in vals) {
        toolbar.values[v] = vals[v];
    }
    
    // simple shortcut
    var values = toolbar.values;
    
    for (v in vals) {
        toolbar.values[v] = vals[v];
    }
    $("#search_input").val(values.search);

    console.log(values);
    // initialize the sliders
    //alert("gettings values");
    $("#sliderNodeSize").slider( "option", "value", values.magnify * 100.0 );
    $("#sliderSelectionZone").slider( "option", "value", values.cursor_size * 100.0 );
    $("#sliderEdgeWeight").slider( "option", "values", [
        values.sliders.edgeFilter.min,
        values.sliders.edgeFilter.max * 100.0
        ]);
    $("#sliderNodeWeight").slider( "option", "values", [
        values.sliders.nodeFilter.min,
        values.sliders.nodeFilter.max * 100.0 
        ]);
    
};

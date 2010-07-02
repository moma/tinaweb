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
            tinaviz.current.set("edgeWeight/min", ui.values[0] / 100.0);
            tinaviz.current.set("edgeWeight/max", ui.values[1] / 100.0);
            tinaviz.current.set("layout/iter", 0);
            tinaviz.current.commitProperties();
            if (tinaviz.getViewName()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeWeight").slider({
        range: true,
        values: [0, 100],
        animate: true,
        slide: function(event, ui) {
            tinaviz.current.set("nodeWeight/min", ui.values[0] / 100.0);
            tinaviz.current.set("nodeWeight/max", ui.values[1] / 100.0);
            tinaviz.current.set("layout/iter", 0);
            tinaviz.current.commitProperties();
            if (tinaviz.getViewName()=="meso") tinaviz.autoCentering();
        }
    });

    $("#sliderNodeSize").slider({
        value: 50.0,
        max: 100.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.current.set("output/nodeSizeRatio", ui.value / 100.0);
            tinaviz.current.commitProperties();
        }}
    );

    $("#sliderSelectionZone").slider({
        value: 1.0,
        max: 300.0, // max disk radius, in pixel
        animate: true,
        slide: function(event, ui) {
            tinaviz.current.set("selection/radius", ui.value);
            tinaviz.current.commitProperties();
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
        /**
         * Manually toggles the category, and do the bipartite work
         */

            var viewName = tinaviz.getViewName();
            var view = tinaviz.views[viewName];
            // get and set the new category to display
            var cat = view.get("category/category");

            var next_cat = tinaviz.getOppositeCategory( cat );

            // update the node list
            tinaviz.updateNodes(viewName, next_cat);
            
            // update the algorithm 
            view.categories[cat].layout.iter = view.get("layout/iter");
            view.set("layout/iter", view.categories[next_cat].layout.iter);
            view.set("category/category", next_cat);
            view.commitProperties();
            
            tinaviz.autoCentering();

            if (viewName=="macro") {
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

});

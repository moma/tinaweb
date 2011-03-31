i/*
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

var demo = false;
var unlockDemo = false;

var tinaviz = {};

$(document).ready(function(){

    $("#notification").notify();

    var size = resize();
    tinaviz = new Tinaviz({
        tag: $("#vizdiv"),
        width: size.w,
        height: size.h,
        path : $('meta[name=tinaviz]').attr("content")
    });


    $(window).bind('resize', function() {
        var size = resize();
        tinaviz.size(size.w, size.h);
    });

    tinaviz.ready(function(){

        var size = resize();
        tinaviz.size(size.w, size.h);

        var urlVars = getUrlVars();
        for (x in urlVars) {
            prefs[x] = urlVars[x];
        }
        tinaviz.set("filter.a.edge.weight", [parseFloat(prefs.edge_filter_min), parseFloat(prefs.edge_filter_max)], "Tuple2[Double]");
        tinaviz.set("filter.a.node.weight", [parseFloat(prefs.node_filter_min), parseFloat(prefs.node_filter_max)], "Tuple2[Double]");
        tinaviz.set("filter.b.edge.weight", [parseFloat(prefs.edge_filter_min), parseFloat(prefs.edge_filter_max)], "Tuple2[Double]");
        tinaviz.set("filter.b.node.weight", [parseFloat(prefs.node_filter_min), parseFloat(prefs.node_filter_max)], "Tuple2[Double]");
        tinaviz.set("filter.a.node.size",   parseFloat(prefs.magnify),         "Double");
        tinaviz.set("filter.b.node.size",   parseFloat(prefs.magnify),         "Double");
        tinaviz.set("filter.node.category", prefs.category,                    "String");
        tinaviz.set("selectionRadius",      parseFloat(prefs.cursor_size),     "Double");
        tinaviz.set("layout.algorithm",     prefs.layout,                      "String");
        tinaviz.set("pause",                prefs.pause,                       "Boolean");
        if (prefs.demo == "true") {
           unlockDemo = true;
        } else {
           unlockDemo = false;
        }
        var waitTimeBeforeStartingDemo = 5; // wait time before starting the demo (default: 20);
        var delayBetweenChanges = 4; // in seconds

        // standby time
        $.fn.nap.standbyTime = waitTimeBeforeStartingDemo;
        $(document).nap(function() { demo = unlockDemo; }, function() { demo = false; });
        $.doTimeout( delayBetweenChanges * 1000, function(){
            if (demo) {

                tinaviz.centerOnSelection();

                if (tinaviz.getView() == "macro") {

                      if (Math.floor(Math.random()*5) > 1) {

                        if (Math.floor(Math.random()*5) > 1) {

                             // select a random node
                             var cat = tinaviz.getCategory();
                             var nb_nodes = tinaviz.infodiv.node_list_cache[cat].length;
                             // alert("selection zero.. trying to get nb_nodes: "+nb_nodes);
                              var randomIndex = Math.floor(Math.random()*(nb_nodes));
                              var randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex];
                              if (randomNode !== undefined || node == null) {
                                 tinaviz.unselect();
                                 tinaviz.infodiv.reset();
                                 tinaviz.select(randomNode["id"]);
                              }

                        } else {
                             // select a random node
                             var cat = tinaviz.getCategory();
                             var nb_nodes = tinaviz.infodiv.node_list_cache[cat].length;
                             // alert("selection zero.. trying to get nb_nodes: "+nb_nodes);
                              var randomIndex = Math.floor(Math.random()*(nb_nodes));
                              var randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex];
                              if (randomNode !== undefined || node == null) {
                                 //tinaviz.unselect();
                                 //tinaviz.infodiv.reset();
                                 tinaviz.viewMeso(randomNode["id"], cat);
                              }
                        }

                      } else {
                           $("#toggle-switch").click();
                      }
                } else {
                      if (Math.floor(Math.random()*5) > 1) {
                                  //alert("demo!");
                         var nbNeighbourhoods = tinaviz.infodiv.neighbours.length;
                             //alert("nbNodest: "+nbNodes);
                             //nbNodes = 0;
                         if (nbNeighbourhoods > 0 && Math.floor(Math.random()*16) < 14) {
                                var randNeighbourhood=Math.floor(Math.random() * nbNeighbourhoods);
                                neighbourhood = tinaviz.infodiv.neighbours[randNeighbourhood];

                                var nbNeighbours = 0;
                                if (neighbourhood !== undefined & neighbourhood != null) nbNeighbours = neighbourhood.length;
                                if (nbNeighbours == 0) {
                                  if (tinaviz.getView() == "meso") {
                                       $("#level").click();
                                  }
                                } else {
                                    var randNeighbour=Math.floor(Math.random() * nbNeighbours);
                                    //alert("randNeighbour: "+randNeighbour);
                                    var node = neighbourhood[randNeighbour];
                                    if (node !== undefined || node == null) {
                                        if (tinaviz.getView() == "macro") {
                                           tinaviz.unselect();
                                        }
                                        tinaviz.infodiv.reset();
                                        tinaviz.select(node);
                                    }
                                }
                        } else {
                           $("#toggle-switch").click();
                        }

                      }  else {
                            $("#level").click();
                      } // enf in back to macro
                 } // end if macro

            }// end if demo
            return true;
        });

        /*
         * Initialization of the Infodiv
         */
        // DEBUGGING
        var layout_name = prefs.layout;
        // use of different Infodiv-s following the type of graph
        if ( layout_name == "phyloforce" ) {
            tinaviz.infodiv = PhyloInfoDiv;
        }
        else {
            tinaviz.infodiv = InfoDiv;
        }

        tinaviz.infodiv.id = 'infodiv';
        tinaviz.infodiv.label = $( "#node_label" );
        tinaviz.infodiv.contents = $( "#node_contents" );
        tinaviz.infodiv.cloud = $( "#node_neighbourhood" );
        tinaviz.infodiv.cloudSearch = $("#node_neighbourhoodForSearch");
        tinaviz.infodiv.cloudSearchCopy = $( "#node_neighbourhoodCopy" );
        tinaviz.infodiv.unselect_button= $( "#toggle-unselect" );
        tinaviz.infodiv.node_table = $( "#node_table > tbody" );
        tinaviz.infodiv.categories = {
            'NGram' : 'Keyphrases',
            'Document' : 'Documents'
        };
        tinaviz.infodiv.reset();
        $("#infodiv").accordion({
           //collapsible: true,
           // fillSpace: true
        });
        toolbar.init();

        tinaviz.open({
            before: function() {
                $("#notification").notify("create", {
                    title: 'Tinasoft Notification',
                    text: 'Please wait while loading the network'
                });
                /*$('#appletInfo').show();
                $('#appletInfo').text("Please wait while loading the graph");
                $('#appletInfo').effect('pulsate', {}, 'fast');*/
                tinaviz.infodiv.reset();
            },
            success: function() {
                $("#notification").notify("create", {
                    title: 'Tinasoft Notification',
                    text: 'You can now explore the graph'
                });
                $("#appletInfo").hide();
                $("#export-gexf").button("enable");
                $("#level").button("enable");
                $("#search_button").button("enable");


                // init the node list with prefs.category
                tinaviz.infodiv.updateNodeList( "macro", prefs.category );
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();

                // initialize the sliders
                /*
                $("#sliderANodeSize").slider( "option", "value",
                    parseInt(tinaviz.get("filter.a.node.size")) *100
                    );
                $("#sliderBNodeSize").slider( "option", "value",
                    parseInt(tinaviz.get("filter.b.node.size")) *100
                 );
                $("#sliderSelectionZone").slider( "option", "value",
                    parseInt(tinaviz.get("selectionRadius")) * 100
                    );
                $("#sliderAEdgeWeight").slider( "option", "values", [
                    parseInt( tinaviz.get("filter.a.edge.weight.min") ),
                    parseInt(tinaviz.get("filter.a.edge.weight.max")) *100
                ]);

                $("#sliderANodeWeight").slider( "option", "values", [
                    parseInt(tinaviz.get("filter.a.node.weight.min") ),
                    parseInt(tinaviz.get("filter.a.node.weight.max")) *100
                ]);

                  $("#sliderBEdgeWeight").slider( "option", "values", [
                    parseInt(tinaviz.get("filter.b.edge.weight.min") ),
                    parseInt(tinaviz.get("filter.b.edge.weight.max")) *100
                 ]);

                $("#sliderBNodeWeight").slider( "option", "values", [
                    parseInt(tinaviz.get("filter.b.node.weight.min") ),
                    parseInt(tinaviz.get("filter.b.node.weight.max")) *100
                ]);
                */

                // default settings
                $("#sliderSelectionZone").slider( "enable" );
                $("#sliderANodeWeight").slider( "enable" );
                $("#sliderAEdgeWeight").slider( "enable" );
                $("#sliderANodeSize").slider( "enable" );
                $("#sliderBNodeWeight").slider( "disable" );
                $("#sliderBEdgeWeight").slider( "disable" );
                $("#sliderBNodeSize").slider( "disable" );

                if (prefs.node_id != "") {
                    tinaviz.select(prefs.node_id);
                }

                if (prefs.search != "") {
                    $("#search_input").val(prefs.search);
                    tinaviz.selectByPattern(prefs.search, "containsIgnoreCase");
                }
               var size = resize();
               tinaviz.size(size.w, size.h);
            },
            error: function(msg) {
                $("#notification").notify("create", {
                    title: 'Tinasoft Notification',
                    text: 'Error loading the network, please consult logs'
                });
            }
        });

        /*
        * opens a gexf only if preferences specify one
        */

        if (prefs.gexf !== undefined) {
            tinaviz.open({
                view: prefs.view,
                url: prefs.gexf,
                layout: prefs.layout
            });
        }


        tinaviz.event({
            /*
             * selection.viewName  : string = 'macro'|'meso'
             * selection.mouseMode : strong = 'left'|'doubleLeft'|'right'|'doubleRight'
             * selection.data      : strong = { ... }
             *
             **/
            selectionChanged: function(selection) {
                if ( selection.mouseMode == "left" ) {
                // nothing to do
                } else if ( selection.mouseMode == "right" ) {
                // nothing to do
                } else if (selection.mouseMode == "doubleLeft") {
                    var macroCategory = tinaviz.get("meso.category");
                    tinaviz.infodiv.updateNodeList("meso", macroCategory);
                }
                tinaviz.infodiv.update(selection.viewName, selection.data);
            },
            /** Callback for get neighbourhood **/
            getNeighbourhood: function(selection_list, neighbour_node_list) {
                tinaviz.infodiv.updateTagCloud(selection_list, neighbour_node_list);
            },

            categoryChanged: function() {

            },
            viewChanged: function(view) {
               if (view=="macro") {
                  // change the button here
               } else if (view=="meso") {

               }
            }
        });

        var size = resize();
        tinaviz.size(size.w, size.h);
    });

});

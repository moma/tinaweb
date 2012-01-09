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
var demo = false;
var unlockDemo = false;
var checkDemoMode = function () {
        if (!demo) return;
        tinaviz.centerOnSelection();
        tinaviz.getView(function (data) {
            var view = data.view;
            if (view == "macro") {
                if (Math.floor(Math.random() * 8) < 2) {
                    tinaviz.unselect();
                }
                if (Math.floor(Math.random() * 5) > 1) {
                    if (Math.floor(Math.random() * 5) > 1) {
                        tinaviz.getCategory(function (data) {
                            var cat = data.category;
                            var nb_nodes = tinaviz.infodiv.node_list_cache[cat].length;
                            // alert("selection zero.. trying to get nb_nodes: "+nb_nodes);
                            var randomIndex = Math.floor(Math.random() * (nb_nodes));
                            var randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex];
                            if (randomNode !== undefined || node == null) {
                                tinaviz.unselect();
                                tinaviz.infodiv.reset();
                                tinaviz.select(randomNode["id"]);
                            }
                        });
                    } else {
                        tinaviz.getCategory(function (cat) {
                            var nb_nodes = tinaviz.infodiv.node_list_cache[cat].length;
                            // alert("selection zero.. trying to get nb_nodes: "+nb_nodes);
                            var randomIndex = Math.floor(Math.random() * (nb_nodes));
                            var randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex];
                            if (randomNode !== undefined || node == null) {
                                //tinaviz.unselect();
                                //tinaviz.infodiv.reset();
                                tinaviz.viewMeso(randomNode["id"], cat);
                            }
                        });
                    }
                } else {
                    $("#toggle-switch").click();
                }
            } else {
                if (Math.floor(Math.random() * 5) > 1) {
                    //alert("demo!");
                    var nbNeighbourhoods = tinaviz.infodiv.neighbours.length;
                    //alert("nbNodest: "+nbNodes);
                    //nbNodes = 0;
                    if (nbNeighbourhoods > 0 && Math.floor(Math.random() * 16) < 14) {
                        var randNeighbourhood = Math.floor(Math.random() * nbNeighbourhoods);
                        neighbourhood = tinaviz.infodiv.neighbours[randNeighbourhood];
                        var nbNeighbours = 0;
                        if (neighbourhood !== undefined & neighbourhood != null) nbNeighbours = neighbourhood.length;
                        if (nbNeighbours == 0) {
                            tinaviz.getView(function (view) {
                                if (view == "meso") $("#level").click();
                            });
                        } else {
                            var randNeighbour = Math.floor(Math.random() * nbNeighbours);
                            //alert("randNeighbour: "+randNeighbour);
                            var node = neighbourhood[randNeighbour];
                            if (node !== undefined || node == null) {
                                tinaviz.getView(function (view) {
                                    if (view == "meso") {
                                        tinaviz.unselect(function () {
                                            tinaviz.infodiv.reset();
                                            tinaviz.select(node);
                                        });
                                    } else {
                                        tinaviz.infodiv.reset();
                                        tinaviz.select(node);
                                    }
                                });
                            }
                        }
                    } else {
                        $("#toggle-switch").click();
                    }
                } else {
                    $("#level").click();
                } // enf in back to macro
            }
        }); // end if macro
    }; // end if demo
var tinaviz = {};
var status = 'none';
$(document).ready(function () {
    //$("#notification").notify();
    var size = resize();
    tinaviz = new Tinaviz({
        tag: $("#vizdiv"),
        width: size.w,
        height: size.h,
        path: $('meta[name=tinaviz]').attr("content"),
        logo: "css/logo.png",
        init: function () {
            console.log("tinaviz main: init()");
            //var size = resize();
            //tinaviz.size(size.w, size.h);
            var urlVars = getUrlVars();
            for (x in urlVars) {
                prefs[x] = urlVars[x];
            }

                  /*
                         * Initialization of the Infodiv
                         */
                        // DEBUGGING
                        var layout_name = prefs.layout;
                        // use of different Infodiv-s following the type of graph
                        if (layout_name == "phyloforce") {
                            tinaviz.infodiv = PhyloInfoDiv;
                        } else {
                            tinaviz.infodiv = InfoDiv;
                        }
                        tinaviz.infodiv.id = 'infodiv';
                        tinaviz.infodiv.label = $("#node_label");
                        tinaviz.infodiv.contents = $("#node_contents");
                        tinaviz.infodiv.cloud = $("#node_neighbourhood");
                        tinaviz.infodiv.cloudSearch = $("#node_neighbourhoodForSearch");
                        tinaviz.infodiv.cloudSearchCopy = $("#node_neighbourhoodCopy");
                        tinaviz.infodiv.unselect_button = $("#toggle-unselect");
                        tinaviz.infodiv.node_table = $("#node_table > tbody");
                        tinaviz.infodiv.categories = {
                            'NGram': 'Keywords',
                            'Document': 'Projects'
                        };
                        $("#infodiv").accordion({
                            // collapsible: true,
                            fillSpace: true
                        });
                        tinaviz.infodiv.reset();
                        toolbar.init();

            tinaviz.set("filter.a.edge.weight", [parseFloat(prefs.a_edge_filter_min), parseFloat(prefs.a_edge_filter_max)], "Tuple2[Double]");
            tinaviz.set("filter.a.node.weight", [parseFloat(prefs.a_node_filter_min), parseFloat(prefs.a_node_filter_max)], "Tuple2[Double]");
            tinaviz.set("filter.b.edge.weight", [parseFloat(prefs.b_edge_filter_min), parseFloat(prefs.b_edge_filter_max)], "Tuple2[Double]");
            tinaviz.set("filter.b.node.weight", [parseFloat(prefs.b_node_filter_min), parseFloat(prefs.b_node_filter_max)], "Tuple2[Double]");
            tinaviz.set("filter.a.node.size", parseFloat(prefs.a_node_size), "Double");
            tinaviz.set("filter.b.node.size", parseFloat(prefs.b_node_size), "Double");
            tinaviz.set("filter.node.category", prefs.category, "String");
            //tinaviz.set("output/nodeSizeMin", 5.0, "Double");
            //tinaviz.set("output/nodeSizeMax", 20.0, "Double");
            tinaviz.set("selectionRadius", parseFloat(prefs.cursor_size), "Double");
            tinaviz.set("layout", prefs.layout, "String");
            tinaviz.set("pause", prefs.pause, "Boolean");
            /*
            if (prefs.embed == "true" && !(prefs.getGraph === undefined)) {
                tinaviz.open({
                    view: "macro",
                    url: prefs.getGraph(),
                    layout: "tinaforce"
                });
            }  */

            if (prefs.demo == "true") {
                unlockDemo = true;
            } else {
                unlockDemo = false;
            }
            var waitTimeBeforeStartingDemo = 6; // wait time before starting the demo (default: 20);
            var delayBetweenChanges = 10; // in seconds
            // standby time
            $.fn.nap.standbyTime = waitTimeBeforeStartingDemo;
            $(document).nap(function () {
                demo = unlockDemo;
            }, function () {
                demo = false;
            });
            $.doTimeout(delayBetweenChanges * 1000, function () {
                checkDemoMode();
                return true;
            });
            var checkDownloadStatus = function() {
               if (status == "downloading") {

                    $('#appletInfo').text($('#appletInfo').text()+".");
                    $('#appletInfo').effect('pulsate', 'slow', function () {
                        $.doTimeout(1000, function(){
                            checkDownloadStatus();
                        });
                    });
               };
            };
            var firstTimeOpen = function (data) {
                status = data.status;
                if (status == "downloading") {
                     console.log("graph downloading");
                     $('#appletInfo').text("Downloading data..");
                     $('#appletInfo').fadeIn();
                } else if (status == "downloaded") {
                     console.log("graph downloaded");
                } else if (status == "updated") {
                     console.log("graph updated");
                     $('#appletInfo').text("Generating visualization..");
                $.doTimeout(100, function(){
                    var size = resize();
                    tinaviz.size(size.w, size.h);
                    return false;
                });
                 // gradually add the buttons
                 console.log("showing the tool bar");
                 $.doTimeout(100, function(){
                     $("#toggle-paused").fadeIn("slow");
                     $.doTimeout(100, function(){
                         $("#toggle-switch").fadeIn("slow");
                             $.doTimeout(100, function(){
                                 $("#level").fadeIn("slow");
                                 $.doTimeout(300, function(){
                                    $("#cursor-size-block").fadeIn("slow");
                                    $.doTimeout(300, function(){
                                        $("#category-A").fadeIn("slow");
                                        $("#category-legend").fadeIn("slow");
                                        $.doTimeout(400, function(){
                                            $("#search").fadeIn("slow");
                                            $("#search_button").fadeIn("slow");
                                            $.doTimeout(200, function(){
                                                $("#toggle-recenter").fadeIn("slow");
                                                $.doTimeout(200, function(){
                                                    $("#export-gexf").fadeIn("slow");
                                                });
                                                false;
                                            });
                                            false;
                                        });
                                        false;
                                    });
                                    false;
                                });
                                false;
                             });
                             false;
                          });
                          false;
                        });

                 console.log("update the node list (may fail)");
                // init the node list with prefs.category
                tinaviz.infodiv.updateNodeList( "macro", prefs.category );
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();


                } else if (status == "loaded") {
                     console.log("graph loaded");
                       $('#appletInfo').text("Generating visualization..done");
                       $('#appletInfo').effect('pulsate', 'fast', function() {
                         $.doTimeout(3000, function () {
                           $("#appletInfo").fadeOut('slow');
                         });
                       });

                      if (prefs.node_id != "") {
                           $.doTimeout(1000, function(){
                             tinaviz.select(prefs.node_id);
                           });
                      }

                      if (prefs.search != "") {
                           $("#search_input").val(prefs.search);
                            tinaviz.selectByPattern(prefs.search, "containsIgnoreCase");
                      }

                } else if (status == "error") {
                   $("#notification").notify("create", {
                                            title: 'Tinasoft Notification',
                                            text: 'Error loading the network, please consult logs'
                   });
                } else {
                    console.log ("unknow status "+status);
                }

            }; // end of first time open
            /*
             * opens a gexf only if preferences specify one
             */
            console.log("prefs.gexf: "+prefs.gexf);
            if (prefs.gexf !== undefined) {
                console.log("main: opening gexf");
                tinaviz.open(""+prefs.gexf, firstTimeOpen);
            }
           // var size = resize();
            //tinaviz.size(size.w, size.h);

        },
        /*
         * selection.viewName  : string = 'macro'|'meso'
         * selection.mouseMode : strong = 'left'|'doubleLeft'|'right'
         * selection.data      : strong = { ... }
         *
         **/
        selectionChanged: function (data) {
            console.log("-- selectionChanged: "+data.selection);
            //console.log(selection);
            var active = $("#infodiv").accordion("option", "active");
            //console.log("active: "+active);
            var selectionIsEmpty = (Object.size(data.selection) == 0);
            console.log("selectionIsEmpty: " + selectionIsEmpty);
            //if (Object.size ( selection.data ) == 0) {
            //$("#infodiv").accordion("activate", 1 );
            //} else {
            if (!selectionIsEmpty && active != 0) {
                console.log("selection is not empty, and active tab is not 0");
                $("#infodiv").accordion("activate", 0);
            } else if (selectionIsEmpty && active != "false") {
                console.log("selection is empty and active is not false");
                $("infodiv").accordion("activate", 0);
            }
            //}
            if (data.mouse == '"left"') {
                // nothing to do
            } else if (data.mouse == '"right"') {
                // nothing to do
            } else if (data.mouse == '"doubleLeft"') {
                console.log("double click on left mouse:");
                tinaviz.setView("meso", function () {
                    tinaviz.getCategory(function (data2) {
                        console.log("switching to " + data2.category);
                        tinaviz.setCategory(data2.category, function () {
                            tinaviz.centerOnSelection(function () {
                                tinaviz.infodiv.updateNodeList("meso", data2.category);
                                tinaviz.infodiv.display_current_category();
                            });
                        });
                    }); // getOppositeCategory();
                });
            }
            tinaviz.infodiv.update(data.view, data.selection);
        },
        /** Callback for get neighbourhood **/
        neighbourhood: function (data) {
            console.log("getNeighbourhood");
            tinaviz.infodiv.updateTagCloud(data.selection, data.neighbours);
        },
        categoryChanged: function (data) {
            console.log("categoryChanged: "+data.category);
        },
        viewChanged: function (data) {
            console.log("main: view changed! "+data.view);
            var view = data.view;
            tinaviz.getCategory(function (data) {
                var category = data.category;
                console.log("viewChanged:");
                console.log(view);
                console.log("category:");
                console.log(category);
                tinaviz.infodiv.updateNodeList(view, category);
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();
                var level = $("#level");
                level.button('option', 'label', view + " level");
                var title = $("#infodiv > h3:first");
                // MACRO
                if (view == "macro") {
                    if (cat == "Document") {
                        // disable
                        $("#category-A").fadeIn();
                        $("#category-B").fadeOut();
                    } else if (cat == "NGram") {
                        $("#category-A").fadeOut();
                        $("#category-B").fadeIn();
                    }
                    level.removeClass("ui-state-highlight");
                    title.removeClass("ui-state-highlight");
                    // MESO
                } else {
                    $("#category-A").fadeIn();
                    $("#category-B").fadeIn();
                    level.addClass("ui-state-highlight");
                    title.addClass("ui-state-highlight");
                    tinaviz.recenter();
                }
            });
        }
    });
    $(window).bind('resize', function () {
        var size = resize();
        tinaviz.size(size.w, size.h);
    });
});
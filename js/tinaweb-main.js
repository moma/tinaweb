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


var tinaviz = {};

$(document).ready(function(){
    
    $("#title").html("<h1>Phylogeny -  TinaViz Demo<!-- menubar --></h1>");

    tinaviz = new Tinaviz({
        tag: $("#vizdiv")
    });

    $(window).bind('resize', function() {
        var size = resize();
        tinaviz.size(size.w, size.h);
    });
    
    tinaviz.ready(function(){

        var infodiv =  InfoDiv('infodiv');
        tinaviz.infodiv = infodiv;
        tinaviz.infodiv.reset();
        
        var size = resize();
        tinaviz.size(size.w, size.h);

        $("#infodiv").accordion({
            fillSpace: true
        });
        
        var prefs = {    
            gexf: "phylo.gexf",
            view: "macro",
            category: "Document",
            node_id: "",
            search: "",
            magnify: "0.5",
            cursor_size: "1.0",
            edge_filter_min: "0.0",
            edge_filter_max: "1.0",
            node_filter_min: "0.0",
            node_filter_max: "1.0",
            layout: "phyloforce",
            edge_rendering: "straight"
            
        };
        var urlVars = getUrlVars();
        for (x in urlVars) {
            prefs[x] = urlVars[x];
        }
        
        tinaviz.setView(prefs.view);

        var session = tinaviz.session();
        var macro = tinaviz.view("macro");
        var meso = tinaviz.view("meso");

        session.set("edgeWeight/min", parseFloat(prefs.edge_filter_min));
        session.set("edgeWeight/max", parseFloat(prefs.edge_filter_max));
        session.set("nodeWeight/min", parseFloat(prefs.node_filter_min));
        session.set("nodeWeight/max", parseFloat(prefs.node_filter_max));
        session.set("category/category", prefs.category);
        session.set("output/nodeSizeMin", 5.0);
        session.set("output/nodeSizeMax", 20.0);
        session.set("output/nodeSizeRatio", parseFloat(prefs.magnify));
        session.set("selection/radius", parseFloat(prefs.cursor_size));
        session.set("layout/algorithm", prefs.layout)
        session.set("rendering/edge/shape", prefs.edge_rendering);
        session.set("data/source", "gexf");

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
        
        toolbar.init();

        tinaviz.open({
            before: function() {
                $('#appletInfo').show();
                $('#appletInfo').html("please wait while loading the graph..");
                $('#appletInfo').effect('pulsate', {}, 'fast');
                tinaviz.infodiv.reset();
            },
            success: function() {
                // init the node list with ngrams
                tinaviz.updateNodes( prefs.view, prefs.category );

                // cache the document list.hide
                tinaviz.getNodes( prefs.view, "Document" );

                var view = tinaviz.view();

                // initialize the sliders
                $("#sliderNodeSize").slider( "option", "value",
                    parseInt(view.get("output/nodeSizeRatio")) *100
                    );
                $("#sliderSelectionZone").slider( "option", "value",
                    parseInt(view.get("selection/radius")) * 100
                    );
                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( view.get("edgeWeight/min") ),
                    parseInt(view.get("edgeWeight/max")) *100
                    ]);
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(view.get("nodeWeight/min") ),
                    parseInt(view.get("nodeWeight/max")) *100
                    ]);

                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();

                if (prefs.node_id != "") {
                    tinaviz.selectFromId( prefs.node_id, true );
                }

                if (prefs.search != "") {
                    $("#search_input").val(prefs.search);
                    tinaviz.searchNodes(prefs.search, "containsIgnoreCase");
                }

                $("#appletInfo").hide();
            },
            error: function(msg) {
                $("#appletInfo").html("Error, couldn't load graph: "+msg);
            }
        });

        tinaviz.open({
            view: prefs.view,
            url: prefs.gexf,
            layout: prefs.layout
        });

        tinaviz.event({

            /*
             * selection.viewName  : string = 'macro'|'meso'
             * selection.mouseMode : strong = 'left'|'doubleLeft'|'right'|'doubleRight'
             * selection.data      : strong = { ... }
             *
             **/
            selectionChanged: function(selection) {
                tinaviz.infodiv.reset();
                if ( selection.mouseMode == "left" ) {
                // nothing to do
                } else if ( selection.mouseMode == "right" ) {
                // nothing to do
                } else if (selection.mouseMode == "doubleLeft") {
                    var macroCategory = tinaviz.views.macro.get("category/category");
                    console.log("selected doubleLeft ("+selection.viewName+","+selection.data+")");
                    tinaviz.views.meso.set("category/category", macroCategory);
                    if (selection.viewName == "macro") {
                        tinaviz.setView("meso");
                    }
                    tinaviz.updateNodes("meso", macroCategory);
                    tinaviz.views.meso.set("layout/iter", 0);
                    tinaviz.views.meso.commitProperties();
                    tinaviz.autoCentering();
                }
                tinaviz.infodiv.update(selection.viewName, selection.data);
            },
            viewChanged: function(view) {

                tinaviz.autoCentering();

                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( view.get("edgeWeight/min") ),
                    parseInt(view.get("edgeWeight/max")) *100
                    ]);
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(view.get("nodeWeight/min") ),
                    parseInt(view.get("nodeWeight/max")) *100
                    ]);
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();

                var showFilter = false;

                view.set("rendering/edge/shape","curve");
                if (view.name == "macro") {
                    
                } else if (view.name == "meso") {
                    alert("category="+view.get("category/category"));
                    if (view.get("category/category")=="Document") {
                        view.set("rendering/edge/shape","straight");
                    }
                    // TODO check selection
                    // if selection has edges with edge of all the same weight, we disable the filter
                    var weight = null;
                    for (node in view.nodes) {
                        //alert("node:"+node);
                        for (out in node.outputs) {
                            //alert("node weight:"+out.weight);
                            if (weight == null) {
                                weight = out.weight;
                            }
                            else {
                                if (weight != out.weight) {
                                    showFilter = true;
                                    break;
                                }
                            }
                        }
                    }
                }
                $("#sliderEdgeWeight").slider( "option", "disabled", false );
            }
        });


    });

});
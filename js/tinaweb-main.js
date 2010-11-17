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
    
    $("#title").html("<h1>TinaWeb DEMO</h1>");

    tinaviz = new Tinaviz({
        tag: $("#vizdiv")
    });

    $(window).bind('resize', function() {
        var size = resize();
        // console.log("L29 tinaviz.size("+size.w+", "+size.h+")");
        tinaviz.size(size.w, size.h);
    });
    
    tinaviz.ready(function(){

        var size = resize();
        console.log("L36 tinaviz.size("+size.w+", "+size.h+")");
        tinaviz.size(size.w, size.h);

 
        var prefs = {    
            gexf: "default.gexf", // "FET60bipartite_graph_cooccurrences_.gexf"
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
            layout: "tinaforce",
            edge_rendering: "curve"

        };
        var urlVars = getUrlVars();
        for (x in urlVars) {
            prefs[x] = urlVars[x];
        }

        console.log("tinaviz.setView("+prefs.view+")");
        tinaviz.setView(prefs.view);

        console.log("tinaviz.session()");
        var session = tinaviz.session();
        var macro = tinaviz.views.macro;
        var meso = tinaviz.views.meso;
        
        // session.add("nodes/0/keywords", "newKeyword");
        console.log("session.set(\"edgeWeight/min\", "+parseFloat(prefs.edge_filter_min)+"\")");
        session.set("edgeWeight/min", parseFloat(prefs.edge_filter_min));
        console.log("session.set(\"edgeWeight/max\", "+parseFloat(prefs.edge_filter_max)+"\")");
        session.set("edgeWeight/max", parseFloat(prefs.edge_filter_max));
        console.log("session.set(\"nodeWeight/min\", "+parseFloat(prefs.node_filter_min)+"\")");
        session.set("nodeWeight/min", parseFloat(prefs.node_filter_min));
        console.log("session.set(\"nodeWeight/max\", "+parseFloat(prefs.node_filter_max)+"\")");
        session.set("nodeWeight/max", parseFloat(prefs.node_filter_max));
        console.log("session.set(\"category/category\", "+prefs.category+"\")");
        session.set("category/category", prefs.category);
        console.log("session.set(\"output/nodeSizeMin\", "+5.0+"\")");
        session.set("output/nodeSizeMin", 5.0);
        console.log("session.set(\"output/nodeSizeMax\", "+20.0+"\")");
        session.set("output/nodeSizeMax", 20.0);
        console.log("session.set(\"output/nodeSizeRatio\", "+parseFloat(prefs.magnify)+"\")");
        session.set("output/nodeSizeRatio", parseFloat(prefs.magnify));
        console.log("session.set(\"selection/radius\",\""+parseFloat(prefs.cursor_size)+"\")");
        session.set("selection/radius", parseFloat(prefs.cursor_size));
        console.log("session.set(\"layout/algorithm\",\""+prefs.layout+"\")");
        session.set("layout/algorithm", prefs.layout)
        console.log("session.set(\"edge/shape\", \""+prefs.edge_rendering+"\")");
        session.set("rendering/edge/shape", prefs.edge_rendering);
        console.log("session.set(\"data/source\",\"gexf\")");
        session.set("data/source", "gexf");

        console.log("macro.filter(\"Category\",\"category\")");
        macro.filter("Category", "category");
        console.log("macro.filter(\"NodeWeightRange\",\"nodeWeight\")");
        macro.filter("NodeWeightRange", "nodeWeight");
        console.log("macro.filter(\"EdgeWeightRange\",\"edgeWeight\")");
        macro.filter("EdgeWeightRange", "edgeWeight");
        console.log("macro.fitler(\"Output\",\"output\")");
        macro.filter("Output", "output");

        console.log("meso.filter(\"SubGraphCopyStandalone\", \"category\")");
        meso.filter("SubGraphCopyStandalone", "category");
        console.log("meso.filter(\"category/source\", \"macro\")");
        meso.set("category/source", "macro");
        console.log("meso.filter(\"category/category\", \"Document\")");
        meso.set("category/category", "Document");
        console.log("meso.filter(\"category/mode\", \"keep\"");
        meso.set("category/mode", "keep");

        console.log("meso.filter(\"NodeWeightRangeHack\", \"nodeWeight\")");
        meso.filter("NodeWeightRangeHack", "nodeWeight");

        console.log("meso.filter(\"EdgeWeightRangeHack\", \"edgeWeight\")");
        meso.filter("EdgeWeightRangeHack", "edgeWeight");

        console.log("meso.filter(\"Output\", \"output\")");
        meso.filter("Output", "output");
               
        tinaviz.infodiv = InfoDiv('infodiv');
        
        tinaviz.infodiv.reset();
        
        $("#infodiv").accordion({
            fillSpace: true
        });
        console.log("toolbar.init()");
        toolbar.init();
        console.log("tinaviz.open({ ... })");
        tinaviz.open({
            before: function() {
                $('#appletInfo').show();
                $('#appletInfo').html("please wait while loading the graph..");
                $('#appletInfo').effect('pulsate', {}, 'fast');
                console.log("tinaviz.infodiv.reset()");
                tinaviz.infodiv.reset();
            },
            success: function() {
                // init the node list with ngrams
                console.log("tinaviz.updateNodes("+prefs.view+", "+prefs.category+")");
                tinaviz.updateNodes( prefs.view, prefs.category );

                // cache the document list.hide
                console.log("tinaviz.getNodes("+prefs.view+", \"Document\")");
                tinaviz.getNodes( prefs.view, "Document" );

                var view = tinaviz.views.current;
                console.log("var view = tinaviz.views.current  (got "+tinaviz.views.current+")");
                
                // initialize the sliders
                console.log("$(\"#sliderNodeSize\").slider( \"option\", \"value\",  parseInt(view.get(\"output/nodeSizeRatio\")) *100 );");
                $("#sliderNodeSize").slider( "option", "value", 
                    parseInt(view.get("output/nodeSizeRatio")) *100 
                    );
                console.log("$(\"#sliderSelectionZone\").slider( \"option\", \"value\",  parseInt(view.get(\"selection/radius\")) *100 );");
                $("#sliderSelectionZone").slider( "option", "value", 
                    parseInt(view.get("selection/radius")) * 100 
                    );
                console.log("$(\"#sliderEdgeWeight\").slider( \"option\", \"values\", [ parseInt( view.get(\"edgeWeight/min\") ), parseInt(view.get(\"edgeWeight/max\")) *100 ]);");
                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( view.get("edgeWeight/min") ),
                    parseInt(view.get("edgeWeight/max")) *100 
                    ]);
                console.log("$(\"#sliderNodeWeight\").slider( \"option\", \"values\", [ parseInt( view.get(\"nodeWeight/min\") ), parseInt(view.get(\"nodeWeight/max\")) *100 ]);");
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(view.get("nodeWeight/min") ),
                    parseInt(view.get("nodeWeight/max")) *100 
                    ]);
                
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();
     
                if (prefs.node_id != "") {
                    console.log("tinaviz.selectFromId("+prefs.node_id+", true)");
                    tinaviz.selectFromId( prefs.node_id, true );
                }
             
                if (prefs.search != "") {
                    $("#search_input").val(prefs.search);
                    console.log("tinaviz.searchNodes("+prefs.search+", \"containsIgnoreCase\")");
                    tinaviz.searchNodes(prefs.search, "containsIgnoreCase");
                }
                        
                $("#appletInfo").hide();
            },
            error: function(msg) {
                $("#appletInfo").html("Error, couldn't load graph: "+msg);
            }
        });
        console.log("tinaviz.open({   view: "+prefs.view+", url: "+prefs.gexf+", layout: "+prefs.layout+" })");
        tinaviz.open({
            view: prefs.view,
            url: prefs.gexf,
            layout: prefs.layout
        });
        console.log("tinaviz.event({ .. })");
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
                    var macroCategory = tinaviz.views.macro.category();
                    //console.log("selected doubleLeft ("+selection.viewName+","+selection.data+")");
                    console.log("tinaviz.views.meso.category("+macroCategory+")");
                    tinaviz.views.meso.category(macroCategory);
                    if (selection.viewName == "macro") {
                        console.log("tinaviz.setView(\"meso\")");
                        tinaviz.setView("meso");
                    }
                    console.log("tinaviz.updateNodes(\"meso\", "+macroCategory+");");
                    tinaviz.updateNodes("meso", macroCategory);
                    console.log("tinaviz.views.meso.set(\"layout/iter\", 0);");
                    tinaviz.views.meso.set("layout/iter", 0);
                    console.log("tinaviz.autoCenteringt();");
                    tinaviz.autoCentering();
                }
                console.log("tinaviz.infodiv.update("+selection.viewName+", "+selection.data+");");
                tinaviz.infodiv.update(selection.viewName, selection.data);
            },
            viewChanged: function(view) {
                console.log("tinaviz.autoCentering()");
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
                if (view.getName() == "meso") {
                
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
            },
            categoryChanged: function() {

            }
        });
        
       
    });

});

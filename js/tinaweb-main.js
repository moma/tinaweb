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

var tinaviz = {};

$(document).ready(function(){

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
        tinaviz.set("filter.edge.weight.min", parseFloat(prefs.edge_filter_min), "Double");
        tinaviz.set("filter.edge.weight.max", parseFloat(prefs.edge_filter_max), "Double");
        tinaviz.set("filter.node.weight.min", parseFloat(prefs.node_filter_min), "Double");
        tinaviz.set("filter.node.weight.max", parseFloat(prefs.node_filter_max), "Double");
        tinaviz.set("filter.node.category", prefs.category, "String");
        //tinaviz.set("output/nodeSizeMin", 5.0, "Double");
        //tinaviz.set("output/nodeSizeMax", 20.0, "Double");
        tinaviz.set("filter.node.size", parseFloat(prefs.magnify), "Double");
        tinaviz.set("selectionRadius", parseFloat(prefs.cursor_size), "Double");
        tinaviz.set("layout.algorithm", prefs.layout, "String");
        tinaviz.set("pause", prefs.pause, "Boolean")

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
        $("#infodiv").accordion();
        toolbar.init();

        tinaviz.open({
            before: function() {
                $('#appletInfo').show();
                $('#appletInfo').html("Please wait while loading the graph");
                $('#appletInfo').effect('pulsate', {}, 'fast');
                console.log("tinaviz.infodiv.reset()");
                tinaviz.infodiv.reset();
            },
            success: function() {
                // init the node list with prefs.category
                tinaviz.infodiv.updateNodeList( "macro", prefs.category );
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();
                // initialize the sliders
                console.log("$(\"#sliderNodeSize\").slider( \"option\", \"value\",  parseInt(view.get(\"filter.node.size\")) *100 );");
                $("#sliderNodeSize").slider( "option", "value",
                    parseInt(tinaviz.get("filter.node.size")) *100
                    );
                console.log("$(\"#sliderSelectionZone\").slider( \"option\", \"value\",  parseInt(view.get(\"selectionRadius\")) *100 );");
                $("#sliderSelectionZone").slider( "option", "value",
                    parseInt(tinaviz.get("selectionRadius")) * 100
                    );
                console.log("$(\"#sliderEdgeWeight\").slider( \"option\", \"values\", [ parseInt( view.get(\"filter.edge.weight.min\") ), parseInt(view.get(\"filter.edge.weight.max\")) *100 ]);");
                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( tinaviz.get("filter.edge.weight.min") ),
                    parseInt(tinaviz.get("filter.edge.weight.max")) *100
                    ]);
                console.log("$(\"#sliderNodeWeight\").slider( \"option\", \"values\", [ parseInt( view.get(\"nodeWeight/min\") ), parseInt(view.get(\"nodeWeight/max\")) *100 ]);");
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(tinaviz.get("filter.node.weight.min") ),
                    parseInt(tinaviz.get("filter.node.weight.max")) *100
                    ]);


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

            getNeighbourhood: function(selection_list, neighbour_node_list) {
                tinaviz.infodiv.updateTagCloud(selection_list, neighbour_node_list);
            },
            viewChanged: function(view) {
                $("#sliderEdgeWeight").slider( "option", "values", [
                    parseInt( view.get("filter.edge.weight.min") ),
                    parseInt(view.get("filter.edge.weight.max")) *100
                    ]);
                $("#sliderNodeWeight").slider( "option", "values", [
                    parseInt(view.get("filter.node.weight.min") ),
                    parseInt(view.get("filter.node.weight.max")) *100
                    ]);
                tinaviz.infodiv.display_current_category();
                tinaviz.infodiv.display_current_view();
                // TODO check selection
                // if selection has edges with edge of all the same weight, we disable the filter

                $("#sliderEdgeWeight").slider( "option", "disabled", false );
            },
            categoryChanged: function() {

            }
        });

        var size = resize();
        tinaviz.size(size.w, size.h);
    });

});

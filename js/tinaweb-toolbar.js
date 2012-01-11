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

$(document).ready(function () {

    // SLIDERS INIT
    $.extend($.ui.slider.defaults, {
        //range: "min",
        min: 0,
        max: 100,
        value: 100.0,
        animate: true,
        orientation: "horizontal"
    });

    /**
     * Prevents click-based selectiion of text in all matched elements.
     */
    jQuery.fn.disableTextSelect = function () {
        return this.each(function () {
            if (typeof this.onselectstart != "undefined") // IE
            {
                this.onselectstart = function () {
                    return false;
                };
            } else if (typeof this.style.MozUserSelect != "undefined") // Firefox
            {
                this.style.MozUserSelect = "none";
            } else // All others
            {
                this.onmousedown = function () {
                    return false;
                };
                this.style.cursor = "default";
            }
        });
    };

    //No text selection on elements with a class of 'unselectable'
/*
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
    });*/

    jQuery('.unselectable').disableTextSelect();
    $('.unselectable').hover(function () {
        $(this).css('cursor', 'default');
    }, function () {
        $(this).css('cursor', 'auto');
    });


    $("#nodeRadiusSelector").change(function () {
        //alert("SET RADIUS TO "+$("#nodeRadiusSelector").val());
        tinaviz.set("filter.map.node.radius", $("#nodeRadiusSelector").val(), "String");
    });

    $("#nodeShapeSelector").change(function () {
        tinaviz.set("filter.map.node.shape", $("#nodeShapeSelector").val(), "String");
    });

    $("#nodeColorSelector").change(function () {
        //alert("SET COLOR TO "+ $("#nodeColorSelector").val(), true);
        tinaviz.set("filter.map.node.color", $("#nodeColorSelector").val(), "String");
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
toolbar.checkSearchForm = function () {
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
    setTimeout("toolbar.checkSearchForm()", 200);
};

toolbar.checkSearchFormNoRepeat = function () {
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

toolbar.runSearchFormNoRepeat = function () {

    var txt = $("#search_input").val();
    console.log("runSearchFormNoRepeat:" + txt);
    //if (txt=="") {
    tinaviz.unselect(function () {
        tinaviz.infodiv.reset();
        //}
        var cat = tinaviz.getCategory();
        var whenDone = function () {

                if (txt !== "") {
                    tinaviz.centerOnSelection();
                } else {
                    tinaviz.recenter();
                }
            };
        if (cat == "Document") {
            //tinaviz.selectByNeighbourPattern(txt, "containsIgnoreCase", cat);
            tinaviz.selectByPattern(txt, "containsIgnoreCase", whenDone);
        } else {
            tinaviz.selectByPattern(txt, "containsIgnoreCase", whenDone);
        }
    });


    return false;

};
var sliderData = {
    "filter.a.node.weight": {
        scheduled: false,
        delay: 250,
        size: 100,
        type: "Tuple2[Double]"
    },
    "filter.a.edge.weight": {
        scheduled: false,
        delay: 250,
        size: 100,
        type: "Tuple2[Double]"
    },
    "filter.b.node.weight": {
        scheduled: false,
        delay: 250,
        size: 100,
        type: "Tuple2[Double]"
    },
    "filter.b.edge.weight": {
        scheduled: false,
        delay: 250,
        size: 100,
        type: "Tuple2[Double]"
    },
    "filter.a.node.size": {
        scheduled: false,
        delay: 100,
        size: 100,
        type: "Double"
    },
    "filter.b.node.size": {
        scheduled: false,
        delay: 100,
        size: 100,
        type: "Double"
    },
    "selectionRadius": {
        scheduled: false,
        delay: 50,
        size: 1 /* hack, so we send the size in pixel to the viz */
        ,
        type: "Double"
    }
};

function callSlider(sliderobj, slider) {
    if (sliderData[slider].scheduled != true) {
        sliderData[slider].scheduled = true;
        $.doTimeout(sliderData[slider].delay, function () {
            //alert("slider value:" + $(sliderobj).slider("values"));
            if (sliderData[slider].type == "Tuple2[Double]") {
                var vals = $(sliderobj).slider("values");
                tinaviz.set(slider, [vals[0] / sliderData[slider].size, vals[1] / sliderData[slider].size], sliderData[slider].type);
            } else if (sliderData[slider].type == "Double") {
                tinaviz.set(slider, $(sliderobj).slider("value") / sliderData[slider].size, sliderData[slider].type);
            }
            sliderData[slider].scheduled = false;
        });
    }
}


toolbar.init = function () {

    //  $("#search").autocomplete({ source: ["aaa","bbb","ccc"] });
    //$("#search").val(toolbar.values.search);
    $("#search").submit(function () {

        toolbar.runSearchFormNoRepeat();

        return false;
    });


    $("#search").keypress(function () {
        toolbar.checkSearchFormNoRepeat();
    });

    $("#export-gexf").button({
        text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click(function (eventObject) {
        tinaviz.set("export", "GEXF", "String");
    });

    $("#export-png").button({
        text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click(function (eventObject) {
        tinaviz.set("export", "PNG", "String");
    });
    $("#export-pdf").button({
        text: true
        //icons: {
        //    primary: 'ui-icon-help'
        //}
    }).click(function (eventObject) {
        tinaviz.set("export", "PDF", "String");
    });

    $("#level").button({
        text: true,
        icons: {
            primary: 'ui-icon-help'
        }
    }).click(function (eventObject) {
        tinaviz.getView(function(data) {
             if (data.view == "macro" ) {
                if (tinaviz === undefined || tinaviz.infodiv.selection.length == 0) {
                    alert("You need to select a node before switching to meso view");
                } else {
                    tinaviz.setView("meso");
                }
             } else if (data.view == "meso") {
                 tinaviz.setView("macro");
             }
        });
    });
    $("#level").attr("title", "click to switch the level");
    $("#search_button").button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click(function (eventObject) {

    });

    // MACRO SLIDERS
    $("#sliderAEdgeWeight").slider({
        range: true,
        values: [parseFloat(prefs.a_edge_filter_min) * 100.0, parseFloat(prefs.a_edge_filter_max) * 100.0],
        animate: true,
        slide: function (event, ui) {
            callSlider("#sliderAEdgeWeight", "filter.a.edge.weight");
            // var range = tinaviz.getAs("edgeAWeightRange","(Double,Double)");
            //$("edgeAFilterMinValue").html(range._1);
            //$("edgeAFilterMaxValue").html(range._2);
        }
    });

    $("#sliderANodeWeight").slider({
        range: true,
        values: [parseFloat(prefs.a_node_filter_min) * 100.0, parseFloat(prefs.a_node_filter_max) * 100.0],
        animate: true,
        slide: function (event, ui) {
            callSlider("#sliderANodeWeight", "filter.a.node.weight");
            //tinaviz.recenter();
            //var range = tinaviz.getAs("nodeAWeightRange","(Double,Double)");
            //$("nodeAFilterMinValue").html(range._1);
            //$("nodeAFilterMaxValue").html(range._2);
        }
    });

    // MACRO SLIDERS
    $("#sliderBEdgeWeight").slider({
        range: true,
        values: [parseFloat(prefs.b_edge_filter_min) * 100.0, parseFloat(prefs.b_edge_filter_max) * 100.0],
        animate: true,
        slide: function (event, ui) {
            callSlider("#sliderBEdgeWeight", "filter.b.edge.weight");
            //tinaviz.recenter();
            //var range = tinaviz.getAs("edgeBWeightRange","(Double,Double)");
            //$("edgeBFilterMinValue").html(range._1);
            //$("edgeBFilterMaxValue").html(range._2);
        }
    });

    $("#sliderBNodeWeight").slider({
        range: true,
        values: [parseFloat(prefs.b_node_filter_min) * 100.0, parseFloat(prefs.b_node_filter_max) * 100.0],
        animate: true,
        slide: function (event, ui) {
            callSlider("#sliderBNodeWeight", "filter.b.node.weight");
            //tinaviz.recenter();
            //var range = tinaviz.getAs("nodeBWeightRange","(Double,Double)");
            //$("nodeBFilterMinValue").html(range._1);
            //$("nodeBFilterMaxValue").html(range._2);
        }
    });

    $("#sliderANodeSize").slider({
        value: parseFloat(prefs.a_node_size) * 100.0,
        max: 100.0,
        // precision/size
        animate: true,
        slide: function (event, ui) {
            callSlider("#sliderANodeSize", "filter.a.node.size");
        }
    });

    $("#sliderBNodeSize").slider({
        value: parseFloat(prefs.b_node_size) * 100.0,
        max: 100.0,
        // precision/size
        animate: true,
        slide: function (event, ui) {
            callSlider("#sliderBNodeSize", "filter.b.node.size");
        }
    });


    $("#sliderSelectionZone").slider({
        value: parseFloat(prefs.cursor_size) * 300.0,
        max: 300.0,
        // max disk radius, in pixel
        animate: true,
        change: function (event, ui) {
            callSlider("#sliderSelectionZone", "selectionRadius");
        }
    });

    $("#toggle-paused").button({
        icons: {
            primary: 'ui-icon-pause'
        },
        text: true,
        label: "pause"
    }).click(function (event) {
        tinaviz.togglePause(function(data) {
            var p = $("#toggle-paused");
            if (p.button('option', 'icons')['primary'] == 'ui-icon-pause') {
                p.button('option', 'icons', {
                    'primary': 'ui-icon-play'
                });
                p.button('option', 'label', "play");
            } else {
                p.button('option', 'icons', {
                    'primary': 'ui-icon-pause'
                });
                p.button('option', 'label', "pause");
            }
        });
    });

    $("#toggle-unselect").button({
        icons: {
            primary: 'ui-icon-close'
        }
    }).click(function (event) {
        toolbar.lastsearch = "";
        tinaviz.unselect(function (data) {
            tinaviz.infodiv.reset();
        });

    });

    $("#toggle-recenter").button({
        text: true,
        icons: {
            primary: 'ui-icon-home'
        }
    }).click(function (event) {
        tinaviz.recenter(function() {

        });
        //tinaviz.centerOnSelection();
    });

    // switch category
    $("#toggle-switch").button({
        text: true,
        icons: {
            primary: 'ui-icon-arrows'
        }
    }).click(function (event) {
        tinaviz.getCategory(function(data) {
            var cat = data.category;
            console.log("clicked on category switch. cat: "+cat);
            console.log(data);
            var next_cat = tinaviz.getOppositeCategory(cat);
            console.log("opposite cat: "+next_cat);
            tinaviz.getView(function(data){
               var viewName = data.view;
                console.log("view name: "+viewName);


                    if (viewName == "macro") {
                        if (next_cat == "Document") {
                            $("#category-A").fadeIn("slow");
                            $("#category-B").fadeOut("slow");
                        } else if (next_cat == "NGram") {
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
                    tinaviz.setCategory(next_cat, function(data) {
                        console.log(" category should be set now");
                        tinaviz.centerOnSelection(function(data) {
                            if (viewName == "macro") {
                                var myArray = new Array();
                                for (var pos in neighbours) {
                                    myArray.push(neighbours[pos]);
                                }
                                tinaviz.select(myArray, function() {
                                    console.log("selected my array");
                                    tinaviz.infodiv.updateNodeList(viewName, next_cat);
                                    //console.log(neighbours);
                                    tinaviz.infodiv.display_current_category();
                                    //tinaviz.unselect();
                                });
                            }  else {
                                tinaviz.infodiv.updateNodeList(viewName, next_cat);
                                //console.log(neighbours);
                                tinaviz.infodiv.display_current_category();
                                //tinaviz.unselect();
                            }
                        });

                    });
            });
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

toolbar.updateButton = function (button, state) {

    toolbar.values.buttons[button] = state;
    $("#toggle-" + button).toggleClass("ui-state-active", state);
};

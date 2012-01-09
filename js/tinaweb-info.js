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
/**
 * Generic GUI Components used by both TinaSoft Desktop and TinaWeb
 */
/*
 * Asynchronously displays a row from the node list
 */
function displayNodeRow(label, id, category) {
    $("#node_table > tbody").append(
    $("<tr></tr>").append(
    $("<td id='node_list_" + id + "'></td>").text(label).click(function (eventObject) {
        //switch to meso view
        //console.log("calling tinaviz.viewMeso("+attached_id+", "+attached_cat+")");
        tinaviz.viewMeso(id, category);
    })));
};

/*
 * Infodiv object manage sidebar dynamic data display
 */
var InfoDiv = {
    id: null,
    selection: [],
    neighbours: [],
    node_list_cache: {},
    last_category: "",

    node_table: null,
    label: null,
    contents: null,
    cloud: null,
    cloudSearch: null,
    cloudSearchCopy: null,
    unselect_button: null,
    /*
     * Internal name -> Display Names
     * Default
     */
    categories: {
        'NGram': 'Keyphrases',
        'Document': 'Documents'
    },

    /*
     * dispatch current category displayed
     */
    display_current_category: function () {
        tinaviz.getView(function(data) {
            tinaviz.getCategory(function(data) {
            var current_cat = data.category;
              if (current_cat !== undefined) var opposite = this.categories[tinaviz.getOppositeCategory(current_cat)];
              //$("#title_acc_1").text("current selection of "+ this.categories[current_cat]);
               if (opposite !== undefined) if (data.view == "macro") $("#toggle-switch").button("option", "label", this.categories[current_cat]);
               else $("#toggle-switch").button("option", "label", this.categories[current_cat] + " neighbours");
               else $("#toggle-switch").button("option", "label", "switch category");

            });
        });
    },

    /*
     * dispatch current view displayed
     */
    display_current_view: function () {
        var current_view = tinaviz.getView();
        //console.log("display_current_view "+current_view);
        if (current_view !== undefined) {
            var level = $("#level");
            level.button('option', 'label', current_view + " level");
            var title = $("#infodiv > h3:first");
            if (current_view == "meso") {
                level.addClass("ui-state-highlight");
                title.addClass("ui-state-highlight");
            } else {
                level.removeClass("ui-state-highlight");
                title.removeClass("ui-state-highlight");
            }
        }
    },

    mergeNeighbours: function (category, neighbours) {
        //console.log(neighbours);
        merged = [];
        for (node in neighbours) {

            //var nb = tinaviz.getNeighbourhood(viewLevel,nodeid);
            for (neighb in neighbours[node]) {
                if (neighb in merged) merged[neighb]['degree']++;
                else if (neighbours[node][neighb]['category'] != category) {
                    merged[neighb] = {
                        'spanid': neighb,
                        'id': neighbours[node][neighb]['id'],
                        'label': neighbours[node][neighb]['label'],
                        'degree': 1,
                        'weight': neighbours[node][neighb]['weight'],
                        'category': neighbours[node][neighb]['category']
                    };

                }
            }
        }
        this.neighbours = Object.keys(merged);
        merged = numericListSort(Object.values(merged), 'degree');
        return merged;
    },

    /*
     * updates the tag cloud
     * of the opposite nodes of a given selection
     */
    updateTagCloud: function (node_list, neighbours) {

        /* builds aggregated tag object */
        if (Object.size(node_list) == 0) {
            return;
        }
        tinaviz.getCategory(function (current_cat) {
            neighbours = this.mergeNeighbours(current_cat, neighbours);
            //console.log( neighbours );
            /* some display sizes const */
            // Modif david
            this.cloudSearch.empty();
            var Googlerequests = "http://www.google.com/#q=";
            var PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term=";
            var requests = "";
            for (var i = 0; i < neighbours.length; i++) {
                var tag = neighbours[i];
                tagLabel = tag.label;
                tagLabel = jQuery.trim(tagLabel);
                requests = requests + "%22" + tagLabel.replace(" ", "+") + "%22";
                if (i < neighbours.length - 1) requests = requests + "+AND+";
            }

            if (current_cat !== undefined) {
                var oppositeRealName = this.categories[tinaviz.getOppositeCategory(current_cat)];
                if (oppositeRealName !== undefined) {
                    var tmp = "";
                    tmp = "Search on: <a href=\"";
                    tmp += Googlerequests;
                    tmp += requests;
                    tmp += '" alt="search on google" target="_BLANK"><img src="'
                    tmp += tinaviz.getPath()
                    tmp += 'css/branding/google.png" />Google</a> &nbsp;'
                    tmp += ' <a href="' + PubMedrequests + requests
                    tmp += '" alt="search on PubMed" target="_BLANK"><img src="'
                    tmp += tinaviz.getPath()
                    tmp += 'css/branding/pubmed.png" />Pubmed</a>';
                    this.cloudSearch.append(tmp);
                }
            }
            var sizecoef = 15;
            var const_doc_tag = 12;
            var tooltip = ""; /* displays tag cloud */
            var tagcloud = $("<p></p>");
            var nb_displayed_tag = 0;

            for (var i = 0; i < neighbours.length; i++) {
                if (nb_displayed_tag < 20) {
                    nb_displayed_tag++;
                    var tag = neighbours[i];

                    var tagspan = $("<span id='" + tag.spanid + "'></span>");
                    tagspan.addClass('ui-widget-content');
                    tagspan.addClass('viz_node');
                    tagspan.html(tag.label);

                    (function () {
                        var attached_id = tag.id;
                        var attached_cat = tag.category;
                        tagspan.click(function () {
                            //switch to meso view
                            //console.log("calling tinaviz.viewMeso("+attached_id+", "+attached_cat+")");
                            tinaviz.viewMeso(attached_id, attached_cat, function() {

                            });
                        });
                    })();
                    // alert("weight: "+tag['weight']+"  inDegree: "+tag['inDegree']+"  outDegree: "+tag['outDegree']);
                    // sets the tag's text size
                    if (neighbours.length == 1) {
                        if (tag['category'] == 'Document') tagspan.css('font-size', const_doc_tag);
                        else tagspan.css('font-size', Math.floor(sizecoef * (Math.min(20, Math.log(1.5 + tag.weight)))));
                        tooltip = "click on a label to switch to its meso view - size is proportional to edge weight";
                    } else {
                        tagspan.css('font-size', Math.max(Math.floor(sizecoef * Math.min(2, Math.log(1.5 + tag.degree))), 15));
                        tooltip = "click on a label to switch to its meso view - size is proportional to the degree";
                    }
                    // appends the final tag to the cloud paragraph
                    tagcloud.append(tagspan);
                    if (i != neighbours.length - 1 && neighbours.length > 1) tagcloud.append(", &nbsp;");
                } else if (nb_displayed_tag == 20) {
                    tagcloud.append("[...]");
                    nb_displayed_tag++;
                } else {
                    break;
                };
            }
            // updates the main cloud div
            this.cloud.empty();
            this.cloud.append('<h3>selection related to ' + oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="' + tooltip + '"></span></h3>');
            this.cloud.append(tagcloud);
            this.cloudSearchCopy.empty();
            this.cloudSearchCopy.append('<h3>global search on ' + oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="' + tooltip + '"></span></h3>');
            this.cloudSearchCopy.append(tagcloud.clone());
        });
    },

    /*
     * updates the label and content DOM divs
     */
    updateInfo: function (lastselection) {
        var current_cat = tinaviz.getCategory();
        var labelinnerdiv = $("<div></div>");
        var contentinnerdiv = $("<div></div>");
        var number_of_label = 0;
        for (var id in lastselection) {

            var node = lastselection[id];
            // ERROR : MISSING CATEGORY in the node list returned from Tinaviz !!!!
            if (node.category == current_cat) {
                var label = this.getNodeLabel(node);

                // limiting number of displayed labels
                number_of_label++;
                // prepares label and content to be displayed
                if (number_of_label < 5) {
                    labelinnerdiv.append($("<b></b>").text(label));
                } else {
                    if (number_of_label == 5) {
                        labelinnerdiv.append($("<b></b>").text("[...]"));
                    }
                }
                // add node to selection cache
                //alert("pushing node "+node["id"]+" to selection cache");
                this.selection.push(node["id"]);
/* fix by julian, replaced id: (was 0, 1, 2..)
                                                   by node["id"]: ("Document:443", "NGram::a1f4b56e5463...") */

                // displays contents only if it's a document
                contentinnerdiv.append($("<b></b>").text(
                this.getNodeContentLabel(label, node)));
                contentinnerdiv.append(
                $("<p></p>").html(
                htmlDecode(
                this.getNodeContent(node))));
                contentinnerdiv.append($("<p></p>").html(
                this.getSearchQueries(htmlDecode(label), current_cat)));
            }
            //contentinnerdiv.append("<br/>");
        }

        if (this.selection.length != 0) {
            this.label.empty();
            this.unselect_button.show();
            this.contents.empty();
            this.label.append(alphabeticJquerySort(labelinnerdiv, "b", ", &nbsp;"));
            this.contents.append(contentinnerdiv);
        } else {
            this.reset();
        }

    },

    /*
     * Main method receiving a new node selection
     * and dispatching infodiv updates
     */
    update: function (view, lastselection) {
        // alert("updated called!");
        if (this.id == null) {
            alert("error : infodiv not initialized with its HTML DIV id");
            return;
        }
        if (Object.size(lastselection) == 0) {
            this.reset();
            return;
        }
        this.selection = [];
        this.updateInfo(lastselection);
        tinaviz.getNeighbourhood("macro", this.selection, function(data) {

            console.log("received neighbourhood");
        });
    },

    /*
     * Resets the entire infodiv
     */
    reset: function () {

        if (this.id == null) {
            alert("error : infodiv not initialized with its HTML DIV id");
            return;
        }

        this.unselect_button.hide();

        // the video should be on the main view
        //this.label.empty().append($("<h2></h2>").html("<center><iframe src='http://player.vimeo.com/video/13203336' width='300' height='210' frameborder='0'></iframe><\center>"));
        this.contents.empty().append($("<h4></h4>").html("click on a node to begin exploration"));
        this.contents.empty().append($("<h4></h4>").html("<h2>Navigation tips</h2>" + "<p align='left'>" + "<br/>" + "<i>Basic interactions</i><br/><br/>" + "Click on a node to select/unselect and get its information.  In case of multiple selection, the button <img src='" + tinaviz.getPath() + "css/branding/unselect.png' alt='unselect' align='top' height=20/>  clears all selections.<br/><br/>The switch button <img src='" + tinaviz.getPath() + "css/branding/switch.png' alt='switch' align='top' height=20 /> allows to change the view type." + "<br/><br/>" + "<i>Graph manipulation</i><br/><br/>" + "Link and node sizes indicate their strength.<br/><br/> To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.<br/><br/> To select a more of less specific area of the graph, use the 'nodes filter' slider.</b><br/><br/>" + "<i>Micro/Macro view</i><br/><br/>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.<br/><br/>  " + "Click on the 'all nodes' tab below to view the full clickable list of nodes.<br/><br/>Find additional tips with mouse over the question marks." + "</p>"));
        // empty all cache variables
        this.cloudSearchCopy.empty();
        this.cloudSearch.empty();
        this.cloud.empty();
        this.selection = [];
        this.neighbours = [];
        this.last_category = "";
        return;
    },

    /*
     * Displays the list of all nodes in the current view/category received from applet
     */
    updateNodeList: function (view, category) {
        this.display_current_category();

             if (category == this.last_category) return;

                if (tinaviz.node_list_cache === undefined) {
                    tinaviz.node_list_cache = {};
                }

        var _this = this;

        var whenReceivingNodeList = function(data) {
            console.log("receiving and updating node.list: "+(data.nodes.length)+" nodes");

             if (category == _this.last_category) return;

             if (_this.node_list_cache === undefined) {
                _this.node_list_cache = {};
             }


             _this.node_list_cache[category] = alphabeticListSort(data.nodes, 'label');
             _this.node_table.empty();
                    _this.last_category = category;
                    var node_list = _this.node_list_cache[category];

                    // alert("node list: "+node_list)
                    if (node_list != null) {
                        for (var i = 0; i < node_list.length; i++) {
                             // in coffeescript, this would be so much easier..
                            (function () {
                                var rowLabel = htmlDecode(decodeJSON(node_list[i]['label']));
                                // alert("label: "+node_list[i]['label']+"  cleanedLabel: "+rowLabel)
                                var rowId = decodeJSON(node_list[i]['id']);
                                var rowCat = category;
                                // asynchronously displays the node list
                                setTimeout("displayNodeRow(\"" + rowLabel + "\",\"" + rowId + "\",\"" + rowCat + "\")", 0);
                            })();
                        }
                    }
        };

       // if (_this.node_list_cache[category] === undefined || this.node_list_cache[category].length == 0) {
        tinaviz.getNodes(view, category, whenReceivingNodeList);
        //}

    },

    getNodeLabel: function (node) {
        console.log("getNodeLabel("+node+") will be json (?) and html (??) decoded");

        return htmlDecode(decodeJSON(node.label));
    },

    /*
     * returns node's contents
     */
    getNodeContent: function (node) {
        if (node.content === undefined) {
            return "";
        } else {
            return htmlDecode(decodeJSON(node.content));
        }
    },

    /*
     * returns node's content's label
     */
    getNodeContentLabel: function (label, node) {
        return htmlDecode(label);
    },

    /*
     * displays node related search queries
     */
    getSearchQueries: function (label, cat) {
        var SearchQuery = label.replace(/ /gi, "+");
        //var WikiQuery=label.replace("+","_");
        if (cat == "Document") {
            return $("<p></p>").html('<a href="http://www.google.com/#hl=en&source=hp&q=%20' + SearchQuery.replace(",", "OR") + '%20" align=middle target=blank height=15 width=15> <img src="' + tinaviz.getPath() + 'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/' + label.replace(/ /gi, "_") + '" align=middle target=blank height=15 width=15> <img src="' + tinaviz.getPath() + 'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q=' + SearchQuery + '" align=middle target=blank height=15 width=15> <img src="' + tinaviz.getPath() + 'css/branding/flickr.png" height=15 width=15> </a>')

        } else if (cat == "NGram") {
            return $("<p></p>").html('<a href="http://www.google.com/#hl=en&source=hp&q=%20' + SearchQuery.replace(",", "OR") + '%20" align=middle target=blank height=15 width=15> <img src="' + tinaviz.getPath() + 'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/' + label.replace(/ /gi, "_") + '" align=middle target=blank height=15 width=15> <img src="' + tinaviz.getPath() + 'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q=' + SearchQuery + '" align=middle target=blank height=15 width=15> <img src="' + tinaviz.getPath() + 'css/branding/flickr.png" height=15 width=15> </a>')
        } else {
            return $("<p></p>");
        }
    }
};

/*
 * PhyloInfoDiv subclasses Infodiv
 */
var PhyloInfoDiv = {
    getNodeLabel: function (node) {
        var label = htmlDecode(decodeJSON(node.label));
        var labelsArray = new Array();
        var yearsArray = new Array();
        var nodeId = decodeJSON(node.id);
        var hashes = nodeId.split('::'); // obsolet and new terms
        if (hashes[1] !== undefined) {
            var hash = hashes[1].split('_');
            var years = hash[0].split('-');
            var year = years[1];
            if (year !== undefined) {
                f = find(label, labelsArray);
                if (f != null) {
                    year_list = yearsArray[f[0]];
                    year_list.push(year);
                    yearsArray[f[0]] = year_list;
                } else {
                    year_list = new Array();
                    year_list.push(year);
                    yearsArray.push(year_list);
                    labelsArray.push(label);
                };
                //label=label + " - " + year;
            } else { // if no period indication just fill the label array
                f = find(label, labelsArray);
                if (f == null) {
                    labelsArray.push(label);
                }
            }
        }
        if (yearsArray[0] != undefined) {
            var numEltMax = 3; // highest number of labels display in phylo mode
            num_labels = labelsArray.length;
            if (num_labels > numEltMax) { // display of max 5 labels
                num_labels = numEltMax;
            }
            var labels = $("<b></b>");
            for (i = 0; i < num_labels; i = i + 1) {
                currentLabel = labelsArray[i];
                years = yearsArray[i].sort(sortNumber);
                if (years.length == 1) {
                    labels.append(currentLabel + " (" + years[0] + ")");
                } else if (years.length == 2) {
                    labels.append(currentLabel + " (" + years[0] + "," + years[1] + ")");
                } else {
                    labels.append(currentLabel + " (" + years[0] + ", ... " + years[years.length - 1] + ")");
                }
            }
            if (labelsArray.length > numEltMax) { // display of max 5 labels
                labels.append("[...]");
            }
        }
        return labels;
    },

    /*
     * returns node's contents
     */
    getNodeContent: function (node) {
        // get node's year
        var nodeId = decodeJSON(node.id);
        var hashes = nodeId.split('::'); // obsolet and new terms
        var hash = hashes[1].split('_');
        var year = hash[0];
        var content = htmlDecode(htmlDecode(decodeJSON(node.content)));
        var vars = [],
            htmlstring, hash;
        var titles = [];
        titles[0] = '<b>Lost: </b>';
        titles[1] = '<b>New: </b>';
        var htmlstring = "";
        var hashes = content.split('_'); // obsolet and new terms
        for (var i = 0; i < hashes.length; i++) {
            if (hashes[i] == '.') continue;
            htmlstring += titles[i];
            hash = hashes[i].split('-'); // list of terms
            for (var j = 0; j < hash.length; j++) {
                var node = tinaviz.getNodeAttributes("macro", 'N::' + hash[j]);
                htmlstring += htmlDecode(decodeJSON(node.label)) + ", ";
            }
            htmlstring += "<br/>";
        }
        return htmlstring;
    },

    /*
     * returns node's content's label
     */
    getNodeContentLabel: function (label, node) {
        var nodeId = decodeJSON(node.id);
        var hashes = nodeId.split('::'); // obsolete and new terms
        var hash = hashes[1].split('_');
        var period = " - " + hash[0];
        return htmlDecode(label + period);
    }
};
PhyloInfoDiv = $.extend(true, {}, InfoDiv, PhyloInfoDiv);
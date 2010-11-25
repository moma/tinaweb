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
            $("<td id='"+id+"'></td>").text(label).click( function(eventObject) {
                //switch to meso view
                tinaviz.viewMeso(id, category);
            })
            )
        );
};


/*
* Infodiv object need viz object to retrieve data
*/
function InfoDiv(divid) {

    return {
        id: divid,
        selection : {},
        neighbours : [],
        node_list_cache: {},
        last_category: "",
        label : $( "#node_label" ),
        contents : $( "#node_contents" ),
        cloud : $( "#node_neighbourhood" ),
        // Modif David
        cloudSearch: $("#node_neighbourhoodForSearch"),
        cloudSearchCopy : $( "#node_neighbourhoodCopy" ),
        unselect_button: $( "#toggle-unselect" ),
        table: $("#node_table > tbody"),

        categories: {
            'NGram' : 'Keyphrases',
            'Document' : 'Documents'
        },

        /*
        * dispatch current category displayed
        */
        display_current_category: function() {
            var current_view = tinaviz.views.current.name();
            var current_cat = tinaviz.views.current.category();
            if (current_cat !== undefined)
                var opposite = this.categories[tinaviz.getOppositeCategory(current_cat)];
            //$("#title_acc_1").text("current selection of "+ this.categories[current_cat]);
            if (opposite !== undefined)
                if (current_view == "macro")
                    $("#toggle-switch").button("option", "label", this.categories[current_cat]);
                else
                    $("#toggle-switch").button("option", "label", this.categories[current_cat] + " neighbours");
            else
                $("#toggle-switch").button("option", "label", "switch category");
        },

        /*
        * dispatch current view displayed
        */
        display_current_view: function() {
            var current_view = tinaviz.views.current.name();
            if (current_view !== undefined) {
                var level = $("#level");
                level.button('option','label', current_view + " level");
                var title = $("#infodiv > h3:first");
                if (current_view == "meso") {
                    level.addClass("ui-state-highlight");
                    title.addClass("ui-state-highlight");
                }
                else {
                    level.removeClass("ui-state-highlight");
                    title.removeClass("ui-state-highlight");
                }
            }
        },

        mergeNeighbours: function( category, neighbours ) {
            merged = [];

            for(node in neighbours) {
                for(neighb in neighbours[node]){
                    if (neighb in merged)
                        merged[neighb]['degree']++;
                    else if (neighbours[node][neighb]['category'] != category) {
                        merged[neighb] = {
                            'id': neighb,
                            'label': neighbours[node][neighb]['label'],
                            'degree': 1,
                            'weight': neighbours[node][neighb]['weight'],
                        };

                    }
                }
            }
            this.neighbours = Object.keys( merged );
            merged = numericListSort( Object.values( merged ), 'degree' );
            console.log(merged);
            return merged;
        },

        /*
        * updates the tag cloud
        * of the opposite nodes of a given selection
        */
        updateTagCloud: function( node_list, neighbours ) {
            /* builds aggregated tag object */
            if (Object.size( node_list ) == 0) return;
            var current_cat = tinaviz.views.current.category();
            neighbours = this.mergeNeighbours( current_cat, neighbours );
            /* some display sizes const */
            // Modif david
            this.cloudSearch.empty();
            var Googlerequests = "http://www.google.com/#q=";
            var PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term=";
            var requests="";
            for (var i = 0; i < neighbours.length; i++) {
                var tag = neighbours[i];
                tagLabel = tag.label;
                tagLabel = jQuery.trim(tagLabel);
                requests = requests + "%22" + tagLabel.replace(" ","+") + "%22";
                if (i < neighbours.length - 1) requests = requests + "+AND+";
            }

            if (current_cat !== undefined){
                var oppositeRealName = this.categories[tinaviz.getOppositeCategory(current_cat)];
                if (oppositeRealName !== undefined){
                    var tmp="";
                    tmp = "Search on: <a href=\"";
                    tmp += Googlerequests;
                    tmp += requests;
                    tmp += '" alt="search on google" target="_BLANK"><img src="'
                    tmp += tinaviz.getPath()
                    tmp += 'css/branding/google.png" />Google</a> &nbsp;'
                    tmp += ' <a href="'+PubMedrequests+requests
                    tmp += '" alt="search on PubMed" target="_BLANK"><img src="'
                    tmp += tinaviz.getPath()
                    tmp += 'css/branding/pubmed.png" />Pubmed</a>' ;
                    this.cloudSearch.append(tmp);
                }
            }
            var sizecoef = 15;
            var const_doc_tag = 12;
            var tooltip = "";
            /* displays tag cloud */
            var tagcloud = $("<p></p>");
            var nb_displayed_tag=0;
            for (var i = 0; i < neighbours.length; i++) {
                if (nb_displayed_tag<20) {
                    nb_displayed_tag++;
                    var tag = neighbours[i];
                    var tagid = tag['id'];
                    var tagspan = $("<span id='"+tagid+"'></span>");
                    tagspan.addClass('ui-widget-content');
                    tagspan.addClass('viz_node');
                    tagspan.html(tag['label']);
                    (function() {
                        var attached_id = tagid;
                        var attached_cat =  tag['category'];
                        tagspan.click( function() {
                            //switch to meso view
                            tinaviz.viewMeso(attached_id, attached_cat);
                        });
                    })();
                    // sets the tag's text size
                    if (neighbours.length == 1) {
                        if ( tag['category'] == 'Document' )
                            tagspan.css('font-size', const_doc_tag);
                        else
                            tagspan.css('font-size',
                                Math.floor(sizecoef*(Math.min(20,Math.log(1.5 + tag['weight']))))
                                );
                        tooltip = "click on a label to switch to its meso view - size is proportional to edge weight";
                    }
                    else {
                        tagspan.css('font-size',
                            Math.max(Math.floor(sizecoef*Math.min(2,Math.log( 1.5 + tag['degree'] ))),15)
                            );
                        tooltip = "click on a label to switch to its meso view - size is proportional to the degree";
                    }
                    // appends the final tag to the cloud paragraph
                    tagcloud.append(tagspan);
                    if (i != neighbours.length-1 && neighbours.length > 1)
                        tagcloud.append(", &nbsp;");
                }
                else if (nb_displayed_tag == 20) {
                    tagcloud.append("[...]");
                    nb_displayed_tag++;
                }
                else {
                    break;
                };
            }
            // updates the main cloud div
            this.cloud.empty();
            this.cloud.append( '<h3>selection related to '+ oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' );
            this.cloud.append( tagcloud );
            this.cloudSearchCopy.empty();
            this.cloudSearchCopy.append( '<h3>global search on '+ oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' );
            this.cloudSearchCopy.append( tagcloud.clone());
        },

        /*
        * updates the label and content DOM divs
        */
        updateInfo: function(lastselection) {
            var layout_name=tinaviz.get("layout/algorithm");
            var decHTMLifEnc = function(str){
                return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            };
            var current_cat = tinaviz.get("category/category");
            var labelinnerdiv = $("<div></div>");
            var contentinnerdiv = $("<div></div>");
            var number_of_label=0;
            var labelsArray=new Array();
            var yearsArray=new Array();
            for(var id in lastselection) {
                var node = lastselection[id];
                // ERROR : MISSING CATEGORY in the node list returned from Tinaviz !!!!
                if (node.category == current_cat)  {
                    var label = jQuery.trim(decodeJSON(node.label));
                    // prepares label and content to be displayed
                    var nodeId = jQuery.trim(decodeJSON(node.id));
                    var hashes = nodeId.split('::'); // obsolet and new terms
                    if (hashes[1] !== undefined){
                        var hash = hashes[1].split('_');
                        var years=hash[0].split('-');
                        var year=years[1];
                        if (year !== undefined){
                            f=find(label,labelsArray);
                            if (f != null){
                                year_list=yearsArray[f[0]];
                                year_list.push(year);
                                yearsArray[f[0]]=year_list;
                            }else{
                                year_list= new Array();
                                year_list.push(year);
                                yearsArray.push(year_list);
                                labelsArray.push(label);
                            };
                        //label=label + " - " + year;
                        }else{ // if no period indication just fill the label array
                            f=find(label,labelsArray);
                            if (f == null){
                                labelsArray.push(label);
                            }
                        };
                    };

                    number_of_label++;//preaffichage
                    if (number_of_label<5) {
                        labelinnerdiv.append( $("<b></b>").html(label) );
                    }
                    else {
                        if (number_of_label==5){
                            labelinnerdiv.append( $("<b></b>").html("[...]") );
                        }
                    }

                    var content = this.getNodeContent(node);
                    // add node to selection cache
                    this.selection[id] = lastselection[id];
                    var tmp = "<b>"+label+"</b>";
                    //labelinnerdiv.append( $("<span></span>").html(tmp) );

                    this.selection[id] = lastselection[id];
                    // displays contents only if it's a document

                    var current_cat = tinaviz.get("category/category");
                    if (current_cat !== undefined) {
                        // jQuery.text automaticcally html encode characters
                        if (layout_name=="phyloforce"){
                            //on r�cup�re l'ann�e
                            var nodeId = jQuery.trim(decodeJSON(node.id));
                            var hashes = nodeId.split('::'); // obsolet and new terms
                            var hash = hashes[1].split('_');
                            var period=" - " + hash[0];
                        }else{
                            period="";
                        }
                        contentinnerdiv.append( $("<b></b>").html( label + period) );
                        if ( node.content != null ) {
                            contentinnerdiv.append( $("<p></p>").html( content ) );

                        }

                    }
                    contentinnerdiv.append( $("<p></p>").html( this.getSearchQueries( htmlDecode(label),this.categories[current_cat]) ) );
                }
                contentinnerdiv.append("<br/");
            }

            if ( yearsArray[0] != undefined){ // we have phylogenetic data
                labelinnerdiv.empty();
                var numEltMax=3; // highest number of labels display in phylo mode
                num_labels=labelsArray.length;
                if (num_labels>numEltMax){ // display of max 5 labels
                    num_labels=numEltMax;
                }
                var labels="<b></b>";
                for (i=0;i<num_labels;i=i+1){
                    currentLabel=labelsArray[i];
                    years=yearsArray[i].sort(sortNumber);
                    if (years.length==1){
                        labelinnerdiv.append($("<b></b>").html(currentLabel + " (" + years[0] + ")"));
                    }else if(years.length==2){
                        labelinnerdiv.append( $("<b></b>").html(currentLabel + " (" + years[0]+ "," + years[1] + ")"));
                    }else {
                        labelinnerdiv.append( $("<b></b>").html(currentLabel + " (" + years[0]+ ", ... " + years[years.length-1] + ")"));
                    }
                }
                if (labelsArray.length>numEltMax){ // display of max 5 labels
                    labelinnerdiv.append( $("<b></b>").html("[...]"));
                }
            }

            if (Object.size( this.selection ) != 0) {
                this.label.empty();
                this.unselect_button.show();
                this.contents.empty();
                this.label.append( alphabeticJquerySort( labelinnerdiv, "b", ", &nbsp;" ));
                this.contents.append( contentinnerdiv );
            }
            else {
                this.reset();
            }

        },

        /*
        * Main method receiving a new node selection
        * and dispatching infodiv updates
        */
        update: function(view, lastselection) {
            if ( Object.size ( lastselection ) == 0 ) {
                this.reset();
                return;
            }
            this.updateInfo(lastselection);
            tinaviz.getNeighbourhood(view, Object.keys(this.selection) );
        },

        /*
        * Resets the entire infodiv
        */
        reset: function() {
            this.unselect_button.hide();
            this.label.empty().append($("<h2></h2>").html("Empty selection"));
            this.contents.empty().append($("<h4></h4>").html("click on a node to begin exploration"));

            this.contents.empty().append($("<h4></h4>").html(
                "<h2>Navigation tips</h2>"+"<p align='left'>"
                +"<br/>"
                +"<i>Basic interactions</i><br/><br/>"
                +"Click on a node to select/unselect and get its information.  In case of multiple selection, the button <img src='"
                +tinaviz.getPath()
                +"css/branding/unselect.png' alt='unselect' align='top' height=20/>  clears all selections.<br/><br/>The switch button <img src='"
                +tinaviz.getPath()+"css/branding/switch.png' alt='switch' align='top' height=20 /> allows to change the view type."
                +"<br/><br/>"
                +"<i>Graph manipulation</i><br/><br/>"
                +"Link and node sizes indicate their strength.<br/><br/> To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.<br/><br/> To select a more of less specific area of the graph, use the 'nodes filter' slider.</b><br/><br/>"
                +"<i>Micro/Macro view</i><br/><br/>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.<br/><br/>  "+"Click on the 'all nodes' tab below to view the full clickable list of nodes.<br/><br/>Find additional tips with mouse over the question marks."
                +"</p>"
                )
            );
            // empty all cache variables
            this.cloudSearchCopy.empty();
            this.cloudSearch.empty();
            this.cloud.empty();
            this.selection = {};
            this.neighbours = [];
            this.last_category = "";
            return;
        },

        /*
        * Displays the list of all nodes in the current view/category received from applet
        */
        updateNodeList: function(node_list, category) {
                this.table.empty();
                this.last_category = category;
                for (var i = 0; i < node_list.length; i++ ) {
                    (function () {
                        var rowLabel = decodeJSON(node_list[i]['label']);
                        var rowId = decodeJSON(node_list[i]['id']);
                        var rowCat = category;
                        // asynchronously displays the node list
                        /*$.doTimeout(0, function(rowLabel, rowId, rowCat) {
                            displayNodeRow(rowLabel, rowId, rowCat);
                        });*/
                        setTimeout("displayNodeRow(\""+rowLabel+"\",\""+rowId+"\",\""+rowCat+"\")", 0);
                    })();
                }
        },

        /*
        * returns node's contents
        */
        getNodeContent: function(node) {
            var layout_name = tinaviz.get("layout/algorithm");
            if (layout_name == "phyloforce") {
                // get node's year
                var nodeId = jQuery.trim(decodeJSON(node.id));
                var hashes = nodeId.split('::'); // obsolet and new terms
                var hash = hashes[1].split('_');
                var year=hash[0];
                var content = this.getPhyloNodeHtml(node);
            }
            else {
                var content = this.getGenericNodeHtml(node);
            }
            return content;
        },

        /*
        * displays node contents in the generic case
        */
        getGenericNodeHtml: function(node) {
            if (node.content === undefined) {
                return "";
            }
            else {
                return decHTMLifEnc(jQuery.trim(decodeJSON(node.content)));
            }
        },

        /*
        * displays node contents if in phyloweb context
        */
        getPhyloNodeHtml: function(node) {
            var content = decodeJSON(node.ccntent);
            var vars = [],  htmlstring, hash;
            var titles= [];
            titles[0]='<b>Lost: </b>';
            titles[1]='<b>New: </b>';
            var htmlstring="";

            var hashes = content.split('_'); // obsolet and new terms
            for(var i = 0; i < hashes.length; i++){
                if (hashes[i]=='.') continue;
                htmlstring += titles[i];
                hash = hashes[i].split('-'); // list of terms
                for(var j = 0; j < hash.length; j++){
                    var node = tinaviz.getNodeAttributes("macro",'N::'+hash[j]);
                    htmlstring += htmlDecode(node.label.replace(/\+/g," "))+", ";
                }
                htmlstring += "<br/>";
            }
            return htmlstring;
        },

        /*
        * displays node related search queries
        */
        getSearchQueries: function(label,CurrentCategRealName){
            var SearchQuery=label.replace(/ /gi ,"+");
            //var WikiQuery=label.replace("+","_");
            if (CurrentCategRealName == "projects"){
                return $("<p></p>").html(
                    '<a href="'
                    + tinaviz.getPath()
                    +'http://www.google.com/#hl=en&source=hp&q=%20'
                    + SearchQuery.replace(",","OR")
                    + '%20" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/'
                    + label.replace(/ /gi ,"_")
                    + '" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q='
                    + SearchQuery
                    + '" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/flickr.png" height=15 width=15> </a>'
                    )

            }
            else if ((CurrentCategRealName == "NGrams")|(CurrentCategRealName == "NGram")|(CurrentCategRealName == "keywords")|(CurrentCategRealName == "Keywords")|(CurrentCategRealName == "Terms")|(CurrentCategRealName == "Communities")|(CurrentCategRealName == "Documents")) {
                return $("<p></p>").html(
                    '<a href="http://www.google.com/#hl=en&source=hp&q=%20'
                    + SearchQuery.replace(",","OR")
                    + '%20" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/'
                    + label.replace(/ /gi ,"_")
                    + '" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q='
                    + SearchQuery
                    + '" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/flickr.png" height=15 width=15> </a>'
                    )
            }
            else if ((CurrentCategRealName == "Scholars")|(CurrentCategRealName == "People")|(CurrentCategRealName == "scholars")){
                return $("<p></p>").html(
                    '<a href="http://www.google.com/#hl=en&source=hp&q=%20'
                    + SearchQuery
                    + '%20" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()+'css/branding/google.png" height=15 width=15> </a>'
                    +'<a href="http://scholar.google.com/scholar?q=%20'
                    + SearchQuery
                    + '%20" align=middle target=blank height=15 width=15> <img src="'
                    + tinaviz.getPath()
                    +'css/branding/googleScholars.png" height=15 width=15> </a>'
                    )
            }
            else {
                return $("<p></p>");
            }
        }

    } // end of return
};

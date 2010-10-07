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
 
 
/** 
* Generic GUI Components used by both TinaSoft Desktop and TinaWeb 
 
* 
*/ 
 
/* 
* Asynchronously displays of node list 
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
        neighbours : {}, 
        oppositeSelection : new Array(), 
        label : $( "#node_label" ), 
        contents : $( "#node_contents" ),
        cloud : $( "#node_neighbourhood" ), 
        /// Modif David 
        cloudSearch: $("#node_neighbourhoodForSearch"), 
        cloudSearchCopy : $( "#node_neighbourhoodCopy" ), 
        unselect_button: $( "#toggle-unselect" ), 
        table: $("#node_table > tbody"), 
        data: {}, 
        categories: { 
            'NGram' : 'NGrams', 
            'Document' : 'Documents'
        }, 
        last_category: "", 
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
                level.button('option','label',current_view + " level"); 
                var title = $("#infodiv > h3:first"); 
                if (current_view == "meso") { 
                    level.addClass("ui-state-highlight"); 
                    $("#level > span").attr("title","zoom out to switch to the macro view"); 
                    title.addClass("ui-state-highlight"); 
                } 
                else { 
                    level.removeClass("ui-state-highlight"); 
                    $("#level > span").attr("title","zoom in or double click on a node to switch to is meso view"); 
                    title.removeClass("ui-state-highlight"); 
                } 
            } 
        }, 
 
 
 
        /* 
* Generic sorting DOM lists 
*/ 
        alphabeticJquerySort: function(parentdiv, childrendiv, separator) { 
            var listitems = parentdiv.children(childrendiv).get(); 
            listitems.sort(function(a, b) { 
                var compA = $(a).html().toUpperCase(); 
                var compB = $(b).html().toUpperCase(); 
                return (compA < compB) ? -1 : (compA > compB) ? 1 : 0; 
            }) 
            $.each(listitems, function(idx, itm) { 
                if ( idx != 0 && idx != listitems.length ) 
                    parentdiv.append(separator); 
                parentdiv.append(itm); 
            }); 
            return parentdiv; 
        }, 
 
        /* 
* updates the tag cloud 
* of the opposite nodes of a given selection 
*/ 
        updateTagCloud: function( viewLevel ) { 
            /* builds aggregated tag object */ 
            if (Object.size( this.selection ) == 0) return; 
            var tempcloud = {}; 
            var toBe = new Array(); 
            for (var nodeid in this.selection) { 
                // gets the full neighbourhood for the tag cloud 
                var nb = tinaviz.getNeighbourhood(viewLevel,nodeid); 
                //alert("over-writing tinaviz 2be selected"); 
                for (var nbid in nb) { 
                    //alert(nbid); 
                    if ( tempcloud[nbid] !== undefined ) 
                        tempcloud[nbid]['degree']++; 
                    // pushes a node if belongs to the opposite category 
                    else if (this.selection[nodeid]['category'] != nb[nbid]['category']) { 
                        toBe.push(nbid); 
                        tempcloud[nbid] = { 
                            'id': nbid, 
                            'label' : decodeJSON(nb[nbid]['label']), 
                            'degree' : 1, 
                            'occurrences': parseInt(nb[nbid]['occurrences']), 
                            'category': decodeJSON(nb[nbid]['category'])
                        }; 
                    } 
                } 
 
            } 
            this.oppositeSelection = toBe; 
            var sorted_tags = alphabeticListSort( Object.values( tempcloud ), 'label' ); 
            /* some display sizes const */ 
 
            /// Modif david 
            this.cloudSearch.empty(); 
            var Googlerequests = "http://www.google.com/#q="; 
            var PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term=";
            var requests=""; 
            for (var i = 0; i < sorted_tags.length; i++) { 
                var tag = sorted_tags[i]; 
                tagLabel=tag.label; 
                tagLabel=jQuery.trim(tagLabel); 
                requests = requests + "%22" + tagLabel.replace(" ","+") + "%22"; 
                if (i < sorted_tags.length - 1) requests = requests + "+AND+"; 
            } 
 
            var current_cat = tinaviz.views.current.category();  /// category courante 
            ///alert(current_cat) 
            if (current_cat !== undefined){ 
                var oppositeRealName = this.categories[tinaviz.getOppositeCategory(current_cat)]; 
                if (oppositeRealName !== undefined){  
                    var tmp="";
                    tmp = "Search on: <a href=\"";
                    tmp += Googlerequests;
                    tmp +=requests;
                    tmp +='" alt="search on google" target="_BLANK"><img src="' 
                    tmp +=tinaviz.getPath() 
                    tmp +='css/branding/google.png" />Google</a> &nbsp;' 
                    tmp +=' <a href="'+PubMedrequests+requests 
                    tmp +='" alt="search on PubMed" target="_BLANK"><img src="' 
                    tmp +=tinaviz.getPath() 
                    tmp +='css/branding/pubmed.png" />Pubmed</a>' ;
                    this.cloudSearch.append(tmp); 
                }
            } 
            var sizecoef = 15; 
            var const_doc_tag = 12; 
            var tooltip = ""; 
            /* displays tag cloud */ 
            var tagcloud = $("<p></p>"); 
            for (var i = 0; i < sorted_tags.length; i++) { 
                var tag = sorted_tags[i]; 
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
                if (sorted_tags.length == 1) { 
                    if ( tag['category'] == 'Document' ) 
                        tagspan.css('font-size', const_doc_tag); 
                    else 
                        tagspan.css('font-size', 
                            Math.floor( sizecoef*Math.log( 1.5 + tag['occurrences'] ) ) 
                            ); 
                    tooltip = "click on a label to switch to its meso view - size is proportional to edge weight"; 
                } 
                else { 
                    tagspan.css('font-size', 
                        Math.floor( sizecoef*Math.log( 1.5 + tag['degree'] ) ) 
                        ); 
                    tooltip = "click on a label to switch to its meso view - size is proportional to the degree"; 
                } 
                // appends the final tag to the cloud paragraph 
                tagcloud.append(tagspan); 
                if (i != sorted_tags.length-1 && sorted_tags.length > 1) 
                    tagcloud.append(", &nbsp;"); 
            } 
            // updates the main cloud  div 
            this.cloud.empty(); 
            this.cloud.append( '<h3>selection related to '+ oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' ); 
            this.cloud.append( tagcloud ); 
            this.cloudSearchCopy.empty(); 
            this.cloudSearchCopy.append( '<h3>Global search on '+ oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' ); 
            this.cloudSearchCopy.append( tagcloud.clone()); 
        }, 
 
        /* 
* updates the label and content DOM divs 
*/ 
        updateInfo: function(lastselection) { 
            var layout_name=tinaviz.get("layout/algorithm");

            var current_cat = tinaviz.views.current.category();

            var labelinnerdiv = $("<div></div>"); 
            var contentinnerdiv = $("<div></div>"); 

            for(var id in lastselection) { 
                var node = lastselection[id]; 
                // ERROR : MISSING CATEGORY in the node list returned from Tinaviz !!!! 
                if (node.category == current_cat)  { 
                    // prepares label and content to be displayed 
                    if ( current_cat == 'Document' ){
                        var temp=decodeJSON(node.content);
                        //alert(temp)
                        var content=this.getContent(node);
                        var label=this.getLabel(node);
                    }
                    else{
                        var content = decHTMLifEnc(jQuery.trim(decodeJSON(node.content)));
                    }
                    
                    console.dir(node);

                    // add node to selection cache 
                    this.selection[id] = lastselection[id]; 
                    var tmp = "<b>"+label+"</b>";
                    tmp += '<span id="rating-'+id+'>not set</span>';
                    labelinnerdiv.append( $("<span></span>").html(tmp) ); 

                    $('#rating-'+id).ratings(5).bind('ratingchanged', function(event, data) {
                        $('#rating-'+id).text(data.rating);
                      });
                                        
                     // displays contents only if it's a document 
 
 
                    // MODIF DAVID 
                    if (current_cat !== undefined) { 
                        
                        //var contentinnerdivTitle=jQuery.trim(decHTMLifEnc( )); 
 
                        // jQuery.text automaticcally html encode characters 
                        contentinnerdiv.append( $("<b></b>").html( label ) );
                        
                        /*
                        if (node.score != null) {
                            
                            var tmp = "";
                            for (var i=0; i < 8;i++) {
                                if (i==node.score) {
                                    tmp += "<input type=\"radio\" class=\"star-rating {split:2}\" checked=\"checked\"/>\n"; 
                                } else {
                                    tmp += "<input type=\"radio\" class=\"star-rating {split:2}\"/>"; 
                                }
                            }

                            contentinnerdiv.append( $("<span></span>").html( tmp ) );
                        }
                        */
                        /* $('.star').rating({
                                callback: function(value, link){
                                    alert(value);
                                }
                            });*/
                        
                       


 
                        if ( node.content != null ) { 
                            contentinnerdiv.append( $("<p></p>").html( content ) );
                            
                        /*       
                            var attributeTable = $("<table></table>");
                            attributeTable.empty();

                    
                            $.each(node, function(key, value) { 
                                // ignore some keys
                                if (key=="content"||key=="id"||key=="category"||key=="label") {
                                    return;
                                }
                                
                                var row = $("<tr></tr>");
                                row.append("<td><b>"+key+"</b></td>");
                                var td = $("<td valign=\"top\" width=\"180\"></td>");
                                if (key=="score") {
                                    var score = parseInt(value);
                                    for (var i=0; i < 8;i++) {
                                        if (i==score) {
                                            td.append("<input name=\"projectrating\" type=\"radio\" class=\"star {half:true}\" checked=\"checked\"></input>"); 
                                        } else {
                                            td.append("<input name=\"projectrating\" type=\"radio\" class=\"star {half:true}\"></input>"); 
                                        }

                                    }
                                }
                                if (key=="keywords") {
                                    td.append(""+value+"");
                            
                                } else {
                                    td.append(""+value+"");
                                }
                                row.append(td);
                                attributeTable.append( row );
                            });
                            
                            contentinnerdiv.append( $("<p></p>").html( attributeTable ) );*/
                        } 
                        
                        
                        // TODO : move this code to a special "web request function" 
                        var SearchQuery=label.replace(" ","+"); 
                        //var WikiQuery=label.replace("+","_"); 
 
                        // TODO : use this.category var to identify categories from object configuration 
                        var CurrentCategRealName = this.categories[current_cat];   /// nom affiché 
 
                        if (CurrentCategRealName == "projects"){ 
                            // TODO : avoid injecting to much html : write constant in index.html, 
                            //      manage hide/shows with this.update() and this.reset(), 
                            //      then use $("#anchor_id").attr("href",SearchQuery) 
                            contentinnerdiv.append( 
                                $("<p></p>").html( 
                                    '<a href="' 
                                    + tinaviz.getPath() 
                                    +'http://www.google.com/#hl=en&source=hp&q=%20' 
                                    + SearchQuery.replace(",","OR")
                                    + '%20" align=middle target=blank height=15 width=15> <img src="' 
                                    + tinaviz.getPath() 
                                    +'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/' 
                                    + SearchQuery 
                                    + '" align=middle target=blank height=15 width=15> <img src="' 
                                    + tinaviz.getPath() 
                                    +'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q=' 
                                    + SearchQuery 
                                    + '" align=middle target=blank height=15 width=15> <img src="' 
                                    + tinaviz.getPath() 
                                    +'css/branding/flickr.png" height=15 width=15> </a>' 
                                    ) 
                                ); 
                        }else{
                            contentinnerdiv.append("<p></p>");
                        }
                        if ((CurrentCategRealName == "NGram")|(CurrentCategRealName == "keywords")|(CurrentCategRealName == "Keywords")|(CurrentCategRealName == "Terms")|(CurrentCategRealName == "Communities")) { 
                            contentinnerdiv.append( 
                                $("<p></p>").html( 
                                    '<a href="http://www.google.com/#hl=en&source=hp&q=%20' 
                                    + SearchQuery.replace(",","OR")
                                    + '%20" align=middle target=blank height=15 width=15> <img src="' 
                                    + tinaviz.getPath() 
                                    +'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/' 
                                    + SearchQuery 
                                    + '" align=middle target=blank height=15 width=15> <img src="' 
                                    + tinaviz.getPath() 
                                    +'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q=' 
                                    + SearchQuery 
                                    + '" align=middle target=blank height=15 width=15> <img src="' 
                                    + tinaviz.getPath() 
                                    +'css/branding/flickr.png" height=15 width=15> </a>' 
                                    ) 
                                ); 
                        } 
                        if ((CurrentCategRealName == "Scholars")|(CurrentCategRealName == "People")|(CurrentCategRealName == "scholars")){ 
                            contentinnerdiv.append( 
                                $("<p></p>").html( 
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
                                ); 
                        } 
                    // FIN MODIF DAVID 
 
                    } 
                }
                contentinnerdiv.append("<br/>");
            } 
            if (Object.size( this.selection ) != 0) { 
                this.label.empty(); 
                this.unselect_button.show(); 
                this.contents.empty(); 
                this.label.append( this.alphabeticJquerySort( labelinnerdiv, "b", ", &nbsp;" )); 
                this.contents.append( contentinnerdiv ); 
                
            //this.attributes.empty();
            //this.contents.append( attributeTable );
            } 
            else { 
                this.reset(); 
            } 
        },

        /* Methodes*/

        getContent: function(node){
            return decHTMLifEnc(jQuery.trim(decodeJSON(node.content)));
        },

        getLabel: function(node){
            return jQuery.trim(decodeJSON(node.label));
        },

        /* 
* Main method recceiving a new node selection 
* and dispatching infodiv updates 
* */ 
        update: function(view, lastselection) { 
            if ( Object.size ( lastselection ) == 0 ) { 
                this.reset(); 
                return; 
            } 
            this.updateInfo(lastselection); 
            this.updateTagCloud("macro"); 
            return; 
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
 
            this.cloudSearchCopy.empty(); 
            this.cloudSearch.empty(); 
 
            this.cloud.empty(); 
            this.selection = {}; 
            this.oppositeSelection = new Array(), 
            this.neighbours = {}; 
            this.data = {}; 
            this.last_category = ""; 
 
            return; 
        }, 
        /* 
* Init the node list 
*/ 
        updateNodeList: function(node_list, category) { 
            if (category != this.last_category) { 
                this.table.empty(); 
                this.last_category = category; 
                for (var i = 0; i < node_list.length; i++ ) { 
                    (function () { 
                        var rowLabel = decodeJSON(node_list[i]['label']); 
                        var rowId = decodeJSON(node_list[i]['id']); 
                        var rowCat = category; 
                        // asynchronously displays the node list 
                        setTimeout("displayNodeRow(\""+rowLabel+"\",\""+rowId+"\",\""+rowCat+"\")", 0); 
                    })(); 
                } 
            } 
        }
 
    } // end of return 
}; 
 
function InfoDivPhyloweb(divid) {
    InfoDiv.call(this);
    return{
        getContent: function(node){
            var nodeId = jQuery.trim(decodeJSON(node.id));
            var hashes = nodeId.split('::'); // obsolet and new terms
            var hash = hashes[1].split('_');
            var year=hash[0];
            label=label + " - " + year

            return content2html(decodeJSON(node.content));
        },
        getLabel: function(node){
            //on r�cup�re l'ann�e'
            var nodeId = jQuery.trim(decodeJSON(node.id));
            var hashes = nodeId.split('::'); // obsolet and new terms
            var hash = hashes[1].split('_');
            var year=hash[0];
            label=label + " - " + year;
            return label;
        }
    }
};

/* 
* WHAT IS IT ????? 
* DOCUMENTATION REQUIRED 
*/ 
function stp(fld) { 
    var res = ""; 
    var c = 0; 
    for (i=0; i<fld.length; i++) { 
        if (fld.charAt(i) != " " || c > 0) { 
            res += fld.charAt(i); 
            if (fld.charAt(i) != " ") { 
                c = res.length; 
            } 
        } 
    } 
    return res.substr(0,c); 
} 
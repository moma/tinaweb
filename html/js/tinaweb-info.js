/**
 * Generic GUI Components used by both TinaSoft Desktop and TinaWeb

 *
 */

/*
 * Infodiv object need viz object to retrieve data
 */
function InfoDiv(divid) {

    return {
    id: divid,
    selection : {},
    neighbours : {},
    label : $( "#node_label" ),
    contents : $( "#node_contents" ),
    cloud : $( "#node_neighbourhood" ),
    unselect_button: $( "#toggle-unselect" ),
    table: $("#node_table > tbody"),
    data: {},
    categories: {
        'NGram' : 'keywords',
        'Document': 'projects',
    },
    last_category: "",
    /*
    * dispatch current category displayed
    */
    display_current_category: function() {
        var current_view = viz.getView();
        var current_cat = viz.getProperty("current","category/category");
        if (current_cat !== undefined)
            var opposite = this.categories[viz.getOppositeCategory(current_cat)];
            //$("#title_acc_1").text("current selection of "+ this.categories[current_cat]);
        if (opposite !== undefined)
            if (current_view == "macro")
                $("#toggle-switch").button("option", "label", "switch to "+ opposite);
            else
                $("#toggle-switch").button("option", "label", "view " + opposite + " neighbours");
        else
            $("#toggle-switch").button("option", "label", "switch category");
    },
    /*
    * dispatch current view displayed
    */
    display_current_view: function() {
        var current_view = viz.getView();
        viz.logNormal( current_view );
        if (current_view !== undefined) {
            var level = $("#level");
        level.empty().html(current_view + " level <span class='ui-icon ui-icon-help icon-right' title='></span>");
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

    alphabeticListSort: function( listitems, textkey ) {
        listitems.sort(function(a, b) {
            var compA = a[textkey].toUpperCase();
            var compB = b[textkey].toUpperCase();
            return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        })
        return listitems;

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
        for (var nodeid in this.selection) {
            // gets the full neighbourhood for the tag cloud
            var nb = viz.getNeighbourhood(viewLevel,nodeid);
            var taglist = new Array();
            for (var nbid in nb) {
                if ( tempcloud[nbid] !== undefined )
                    tempcloud[nbid]['degree']++;
                // pushes a node if belongs to the opposite category
                else if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                    //viz.logNormal("adding to tag cloud : "+decodeJSON(nb[nbid]['label']));
                    tempcloud[nbid] = {
                        'id': nbid,
                        'label' : decodeJSON(nb[nbid]['label']),
                        'degree' : 1,
                        'occurrences': parseInt(nb[nbid]['occurrences']),
                        'category': decodeJSON(nb[nbid]['category']),
                    };
                }
            }
        }
        var sorted_tags = this.alphabeticListSort( Object.values( tempcloud ), 'label' );
        //viz.logNormal(sorted_tags);
        /* some display sizes const */
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
                    //viz.logNormal("clicked on " + tagid + " - " +tag['label']);
                    //switch to meso view
                    viz.viewMeso(attached_id, attached_cat);
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
        this.cloud.append( '<h3>selection related to <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' );
        this.cloud.append( tagcloud );
    },

    /*
     * updates the label and content DOM divs
     */
    updateInfo: function(lastselection) {
        var current_cat = viz.getProperty("current", "category/category");
        viz.logNormal("current category = "+current_cat);
        var labelinnerdiv = $("<div></div>");
        var contentinnerdiv = $("<div></div>");
        for(var id in lastselection) {
            var node = lastselection[id];
            if (node.category == current_cat)  {
                this.selection[id] = lastselection[id];
                labelinnerdiv.append( $("<b></b>").html(decodeJSON(node.label)) );
                // displays contents only if it's a document
                if ( node.category == 'Document' && node.content != null ) {
                    contentinnerdiv.append( $("<b></b>").html(decodeJSON(node.label)) );
                    contentinnerdiv.append( $("<p></p>").html(decodeJSON(node.content)) );
                }
            }
        }
        if (Object.size( this.selection ) != 0) {
            this.label.empty();
            this.unselect_button.show();
            this.contents.empty();
            this.label.append( this.alphabeticJquerySort( labelinnerdiv, "b", ", &nbsp;" ));
            this.contents.append( contentinnerdiv );
        }
        else
            this.reset();
    },

    /*
     * updates the infodiv contents
     */
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
        this.label.empty().append($("<h2></h2>").html("empty selection"));
        this.contents.empty().append($("<h4></h4>").html("click on a node to begin exploration"));
        this.cloud.empty();
        this.selection = {};
        this.neighbours = {};
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
    },

    } // end of return
};




 /* useful for fullscreen mode */
function getScreenWidth() {
    var x = 0;
    if (self.innerHeight) {
            x = self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
            x = document.documentElement.clientWidth;
    }
    else if (document.body) {
            x = document.body.clientWidth;
    }
    return x;
}

/* useful for fullscreen mode */
function getScreenHeight() {
    var y = 0;
    if (self.innerHeight) {
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        y = document.documentElement.clientHeight;
    }
    else if (document.body) {
        y = document.body.clientHeight;
    }

    return y;
}

$(function(){
    $.extend($.fn.disableTextSelect = function() {
        return this.each(function() {
            if($.browser.mozilla){//Firefox $("#sliderEdgeWeight")
                $(this).css('MozUserSelect','none');
            } else if($.browser.msie) {//IE
                $(this).bind('selectstart',function(){return false;});
            } else {//Opera, etc.
                $(this).mousedown(function(){return false;});
            }
        });
    });
});

/*
 * utility modifying the Object prototype
 * to get its lenght
 */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
/*
 * utility returning a list
 * from the values of a given object
 */
Object.values = function(obj) {
    var values = new Array();
    for (key in obj) {
        values.push(obj[key]);
    }
    return values;
};

/*
 * utility to safely decode encoded
 * values from JSON sent by the java applet
 */
function decodeJSON(encvalue) {
    if (encvalue !== undefined)
        return decodeURIComponent(encvalue).replace(/\+/g, " ").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%2A/g, "*");
    else
        return "";
};

/*
 * Asynchronously displays of node list
 */
function displayNodeRow(label, id, category) {
    //console.console.log("inserting "+label);
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
 * Infodiv object need tinaviz object to retrieve data
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
        var current_view = tinaviz.getView();
        var current_cat = tinaviz.getProperty("current","category/category");
        if (current_cat !== undefined)
            var opposite = this.categories[tinaviz.getOppositeCategory(current_cat)];
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
        var current_view = tinaviz.getView();
        tinaviz.logNormal( current_view );
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
            var nb = tinaviz.getNeighbourhood(viewLevel,nodeid);
            var taglist = new Array();
            for (var nbid in nb) {
                if ( tempcloud[nbid] !== undefined )
                    tempcloud[nbid]['degree']++;
                // pushes a node if belongs to the opposite category
                else if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                    //tinaviz.logNormal("adding to tag cloud : "+decodeJSON(nb[nbid]['label']));
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
        //tinaviz.logNormal(sorted_tags);
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
            tagspan.addClass('tinaviz_node');
            tagspan.html(tag['label']);
            (function() {
                var attached_id = tagid;
                var attached_cat =  tag['category'];
                tagspan.click( function() {
                    //tinaviz.logNormal("clicked on " + tagid + " - " +tag['label']);
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
        this.cloud.append( '<h3>selection related to <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' );
        this.cloud.append( tagcloud );
    },

    /*
     * updates the label and content DOM divs
     */
    updateInfo: function(lastselection) {
        var current_cat = tinaviz.getProperty("current", "category/category");
        tinaviz.logNormal("current category = "+current_cat);
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

function Tinaviz() {

    var wrapper = null;
    var applet = null;
    var cbsAwait = {};
    var cbsRun = {};
    this.isReady = 0;
    this.infodiv = null;

    //return {
        this.init= function() {
            if (wrapper != null || applet != null) return;
            wrapper = $('#tinaviz')[0];
            if (wrapper == null) return;
            applet = wrapper.getSubApplet();
            if (applet == null) return;
            this.auto_resize();
            this.main();
            this.isReady = 1;
        }
        /************************
         * Main method
         *
         ************************/
        this.main = function() {

            this.setView("macro");

            this.dispatchProperty("edgeWeight/min", 0.0);
            this.dispatchProperty("edgeWeight/max", 1.0);
            this.dispatchProperty("nodeWeight/min", 0.0);
            this.dispatchProperty("nodeWeight/max", 1.0);
            this.dispatchProperty("category/category", "NGram");
            this.dispatchProperty("output/nodeSizeMin", 5.0);
            this.dispatchProperty("output/nodeSizeMax", 20.0);
            this.dispatchProperty("output/nodeSizeRatio", 50.0/100.0);

            this.dispatchProperty("selection/radius", 1.0);

            this.bindFilter("Category", "category", "macro");

            this.bindFilter("NodeWeightRange",  "nodeWeight", "macro");
            this.bindFilter("EdgeWeightRange", "edgeWeight",  "macro");
            
            this.bindFilter("NodeFunction", "radiusByWeight", "macro");

            this.bindFilter("Output", "output", "macro");


            // special version of the subgraph copy filter: this one does not use the
            // tinasoft berkeley database to get data

            this.bindFilter("SubGraphCopyStandalone", "category", "meso");
            this.setProperty("meso", "category/source", "macro");
            this.setProperty("meso", "category/category", "Document");
            this.setProperty("meso", "category/mode", "keep");
            /*
            this.bindFilter("NodeWeightRange",  "nodeWeight", "meso");
            this.bindFilter("EdgeWeightRange", "edgeWeight",  "meso");
            */
            this.bindFilter("NodeFunction", "radiusByWeight", "meso");

            this.bindFilter("Output", "output", "meso");


             this.readGraphJava("macro", "French_bipartite_graph.gexf");
            //this.readGraphJava("macro", "FET60bipartite_graph_cooccurrences_.gexf");
            //this.readGraphJava("macro", "CSSScholarsMay2010.gexf");

            //this.togglePause();

            // init the node list with ngrams
            this.updateNodes( "macro", "NGram" );
            // cache the document list
            this.getNodes( "macro", "Document" );

            $("#waitMessage").hide();
            this.infodiv.display_current_category();
            this.infodiv.display_current_view();
        }

        /************************
         * Core applet methods
         *
         ************************/

        /*
         * Core method communicating with the applet
         */
        this.bindFilter= function(name, path, view) {
            if (applet == null) return;
            if (view == null) return applet.getSession().addFilter(name, path);
            return applet.getView(view).addFilter(name, path);
        }

        /*
         * Core method communicating with the applet
         */
        this.dispatchProperty= function(key,value) {
            if (applet == null) return;
            return applet.setProperty("all",key,value);
        }

        /*
         * Core method communicating with the applet
         */
        this.setProperty= function(view,key,value) {
            if (applet == null) return;
            return applet.setProperty(view,key,value);
        }

        /*
         * Core method communicating with the applet
         */
        this.getProperty= function(view,key) {
            if (applet == null) return;
            return applet.getProperty(view,key);
        }

        /*
         * Commands switching between view levels
         */
        this.setView = function(view) {
            if (applet == null) return;
            applet.setView(view);
        }

        /*
         * Gets the the view level name
         */
        this.getView = function(view) {
            if (applet == null) return;
            return applet.getView().getName();
        }

        /*
         * Commits the applet's parameters
         * Accept an optional callback to give some reaction to events
         */
        this.touch= function(view) {
            if (applet == null) return;
            //this.logNormal("touch("+view+")");
            if (view===undefined) {
                applet.touch();
            } else {
                applet.touch(view);
            }
        }

        /*
         *  Adds a node to the current selection
         */
        this.selectFromId = function( id ) {
            if (applet == null) return;
            return applet.selectFromId(id);
        }

        this.resetLayoutCounter= function(view) {
            if (applet == null) return;
            // TODO switch to the other view
            applet.resetLayoutCounter();
        }


        /*

         *  Get the current state of the applet
         */
        this.isEnabled = function() {
            if (applet == null) {
                return false;
            } else {
                return applet.isEnabled();
            }
        }
        /*
         *  Set the current state of the applet to enable
         */
        this.setEnabled =  function(value) {
            if (applet == null) return;
            applet.setEnabled(value);
        }


        /*
        * Search nodes
        */
        this.getNodesByLabel = function(label, type) {
            if (applet == null) return {};
            return $.parseJSON( applet.getNodesByLabel(label, type));
        }

        /*
        * Search and select nodes
        */
        this.searchNodes= function(label, type) {
            if (applet == null) return {};
            var matchlist = this.getNodesByLabel(label, type);
            for (var i = 0; i < matchlist.length; i++ ) {
                applet.selectFromId( decodeJSON( matchlist[i]['id'] ) );
                // todo: auto center!!
                //applet.
            }
        }

        /*
        * Highlight nodes
        */
        this.highlightNodes= function(label, type) {
            if (applet == null) return {};
            var matchlist = this.getNodesByLabel(label, type);
            for (var i = 0; i < matchlist.length; i++ ) {
                applet.highlightFromId( decodeJSON( matchlist[i]['id'] ) );
                // todo: auto center!!
                //applet.
            }
        }

        this.touchCallback= function(view, cb) {
            if (applet == null) return;
            if (view==null) {
                applet.touch();
            }
            if (cb==null) {
               applet.touch(view);
            } else {
                this.enqueueCb(applet.touch(view),cb);
            }
        }

        /*
        * recenter the graph
        */
        this.autoCentering= function() {
            if (applet == null) return false;
            return applet.autoCentering();
        }

        /*
         *  Gets lattributes o a given node
         */
        this.getNodeAttributes = function(id) {
            if (applet == null) return;
            return $.parseJSON( applet.getNodesAttributes(id) );
        }

        /*
         * Gets the list of neighbours for a given node
         */
        this.getNeighbourhood = function(view,id) {
            if (applet == null) return;
            return $.parseJSON( applet.getNeighbourhood(view,id) );
        }


        /************************
         * Core Callback system
         *
         ************************/

        /*
         * Push a callback in the queue
         */
        this.enqueueCb=function(id,cb) {
            cbsAwait[id] = cb;
        }

        /*
         * Runs a callback
         */
        this.runCb=function(id) {
            cbsRun[i]();
            delete cbsRun[i];
        }
        /**
         * Put a callback for the "await" list to the "run" list
         *
         */
        this.activateCb=function(id) {
            cbsRun[id] = cbsAwait[id];
            delete cbsAwait[id];
            return id;
        }

        /**
         * How the callback system works:
         *
         * When the client call the "touch()" method, an update of the current view is
         * scheduled by the applet, then the id of the new revision will be stored together
         * with a callback address, by the javascript.
         *
         * As soon as the current view will reach this revision (or a greater one) the
         * corresponding callback(s) will be called, then removed from the stack.
         *
         */
        this.cbSync=function(id) {
            for (i in cbsAwait) {
                if (i<=id) {
                    setTimeout("tinaviz.runCb("+this.activateCb(i)+")",0);
                }
            }
        }

        /********************************
         *
         * Mouse Callback system
         *
         ********************************/

        /*
         *  Callback of right clics
         */
        this.nodeRightClicked = function(view, data) {
            if (applet == null) return;
            //if (view == "meso") {
                //this.toggleCategory(view);
            //}
        }

        /*
         *  Callback of left clics
         */
        this.nodeLeftClicked = function(view, data) {
            if ( data == null ) return;
            // copies the category from view to meso
            //if (view == "meso") {
                //this.toggleCategory(view);
                //this.setProperty("meso", "category/category", this.getProperty(view, "category/category"));
            //}
        }

        /*
         *  Callback of double left clics
         */
        this.leftDoubleClicked = function(view, data) {
            var category = this.getProperty("current", "category/category");
            this.logNormal( "after double-clic, category = "+category );
            for (var id in data) {
                this.viewMeso(decodeJSON(id), category);
                break;
            }
            /*if (view =="macro") {
            }
            if (view == "meso") {
                //this.toggleCategory(view);
            }*/
        }

        /*
         *  Callback of a node selection/clics
         */
        this.selected = function(view, attr, mouse) {
            if (attr == null) return;
            // always updates infodiv
            data = $.parseJSON(attr);
            this.infodiv.reset();
            this.infodiv.update(view, data);

            // left == selected a node
            if ( mouse == "left" ) {
                //this.nodeLeftClicked(view,data);
            }
            //right == unselected a node
            else if ( mouse == "right" ) {
                //this.nodeRightClicked(view,data);
            }
            else if (mouse == "doubleLeft") {
                this.leftDoubleClicked(view, data);
            }
        }

        /**
        * Callback after CHANGING THE VIEW LEVEL
        */
        this.switchedTo = function(view, selected) {
            if (applet == null) return;

            this.autoCentering();
            /*if (view=="macro") {
                $("#toggle-project").button('enable');
            } else if (view=="meso") {
                $("#toggle-project").button('disable');
            }*/

            // update the buttons
            $("#sliderEdgeWeight").slider( "option", "values", [
                this.getProperty(view, "edgeWeight/min"),
                this.getProperty(view, "edgeWeight/max")*100
            ]);
            $("#sliderNodeWeight").slider( "option", "values", [
                this.getProperty(view, "nodeWeight/min"),
                this.getProperty(view, "nodeWeight/max")*100
            ]);
            this.infodiv.display_current_category();
            this.infodiv.display_current_view();
        }
        /************************
         *
         * I/O system
         *
         ************************/

        // TODO: use a cross-browser compatible way of getting the current URL
        this.readGraphJava= function(view,graphURL) {
            // window.location.href
            // window.location.pathname
            var sPath = document.location.href;
            var gexfURL = sPath.substring(0, sPath.lastIndexOf('/') + 1) + graphURL;
            applet.getSession().updateFromURI(view,gexfURL);
            $('#waitMessage').hide();
        }

        this.readGraphAJAX= function(view,graphURL) {
            if (applet == null) return;
            $.ajax({
                url: graphURL,
                type: "GET",
                dataType: "text",
                beforeSend: function() { $('#waitMessage').show(); },
                error: function() { $('#waitMessage').show(); },
                success: function(gexf) {
                   applet.getSession().updateFromString(view,gexf);
                   $('#waitMessage').hide();
               }
            });
        }

        this.openGraph = function(view,relativePath) {
            if (applet == null) return;
            applet.getSession().updateFromURI(view,path);
        }

        /***********************************
         *
         * Manual actions controler system
         *
         ***********************************/
        /*
         * hide/show labels
         */
        this.toggleLabels = function() {
            if (applet == null) return;
            return applet.getView().toggleLabels();
        }

        /*
         * hide/show nodes
         */
        this.toggleNodes = function() {
            if (applet == null) return;
            return applet.getView().toggleNodes();
        }

        /*
         * hide/show edges
         */
        this.toggleEdges = function() {
            if (applet == null) return;
            return applet.getView().toggleLinks();
        }

        /*
         * play/pause layout engine
         */
        this.togglePause = function() {
            if (applet == null) return;
            return applet.getView().togglePause();
        }

        /*
         * toggles HD rendering
         */
        this.toggleHD = function() {
            if (applet == null) return;
            return applet.getView().toggleHD();
        }
        /*
        * Get the opposite category name (the NOT DISPLAYED one)
        */
        this.getOppositeCategory = function(cat) {
            if (cat == "Document")
                return "NGram";
            else if (cat == "NGram")
                return "Document";
            else alert("error, cannot get opposite category of "+cat);

        }

        /**
         * Manually toggles the category
         */
        this.toggleCategory = function(view) {
            if (applet == null) return;
            // get and set the new category to display
            var next_cat = this.getOppositeCategory( this.getProperty(view, "category/category"));
            this.setProperty(view, "category/category", next_cat);
            //this.unselect();
            // resets the layout
            this.resetLayoutCounter();
            this.touch();
            this.autoCentering();
            // updates the node list table
            this.updateNodes(view, next_cat);
            // adds neighbour nodes (from next_cat) to the selection of the macro view
            /*for(var id in this.infodiv.selection) {
                var neighbours = this.getNeighbourhood("macro", id);
                for (var neighbourId in neighbours) {
                    if (neighbours[neighbourId].category == next_cat) {
                        this.logNormal( "selecting a neighbour "+neighbourId );
                        //this.selectFromId(neighbourId);
                    }
                }
            }*/
        }

        /**
         * Manually toggles the view to meso given an id
         */
        this.viewMeso = function(id, category) {
            // selects unique node
            this.unselect();
            this.selectFromId(id);
            // sets the category of the graph
            this.setProperty("meso", "category/category", category);
            //this.setProperty("macro", "category/category", category);
            this.setView("meso");
            this.touch("meso");
            this.updateNodes("meso", category);
        }


        /*
        * Manually unselects all nodes
        */
        this.unselect= function() {
            if (applet == null) return;
            applet.unselect();
            this.infodiv.reset();
            //if (this.getView() == "meso") {
               // this.setView("macro");
                //tinaviz.resetLayoutCounter();
                
                //this.autoCentering();
            //}
            this.touch("current");
            //applet.clear("meso");
        }


        /*
         *  Retrieves list of nodes
         */
        this.getNodes = function(view, category) {
            if (applet == null) return;
            this.infodiv.data[category] = $.parseJSON( applet.getNodes(view, category) );
            return this.infodiv.data[category];
        }
        /*
         *  Fires the update of node list cache and display
         */
        this.updateNodes = function(view, category)  {
            if ( category == this.infodiv.last_category ) return;
            this.infodiv.display_current_category();
            if (this.infodiv.data[category] === undefined)
                this.infodiv.updateNodeList( this.getNodes( view, category ), category );
            else
                this.infodiv.updateNodeList( this.infodiv.data[category], category );
        }


        /*
         *  Try to log an error with firebug otherwise alert it
         */
        this.logError= function(msg) {
            try {
                console.error(msg);
            }
            catch (e){
                alert(msg);
                return;
            }
        }
        /*
         *  Try to log an normal msg with firebug otherwise returns
         */
        this.logNormal = function(msg) {
            try {
                console.log(msg);
            }
            catch (e) {
                return;
            }
        }


        /****************************************
         *
         * HTML VIZ DIV ADJUSTING/ACTION
         *
         ****************************************/

        /*
         * Dynamic div width
         */
        this.getWidth= function() {
            return $("#vizdiv").width();
        }

        /*
         * Dynamic div height
         */
        this.getHeight= function() {
            return getScreenHeight() - $("#hd").height() - $("#ft").height() - 50;
        }
        /*
         * Callback changing utton states
         */
        this.buttonStateCallback = function(button, enabled) {
            $(document).ready(
                function() {
                    // state = "disable"; if (enabled) { state = "enable"; }
                    $("#toggle-"+button).toggleClass("ui-state-active", enabled);
                    //$("#toggle-"+button).button(state);
                }
            );
        }

        /*
         * PUBLIC METHOD, AUTOMATIC RESIZE THE APPLET
         */
        this.auto_resize = function() {
           this.size(this.getWidth(), this.getHeight());
        }

        /*
         * PRIVATE METHOD, RESIZE THE APPLET
         */
        this.size= function(width, height) {
            if (wrapper == null || applet == null) return;
            wrapper.width = width;
            wrapper.height = height;
            $('#tinaviz').css('width',width);
            $('#tinaviz').css('height',height);
        }
    //};
}

var tinaviz = new Tinaviz();

$(document).ready(function(){


    //No text selection on elements with a class of 'noSelect'
    $('.noSelect').disableTextSelect();
    $('.noSelect').hover(function() {
        $(this).css('cursor','default');
    }, function() {
        $(this).css('cursor','auto');
    });

    $("#title").html("Cartographie des chercheurs français dans le domaine des systèmes complexes - <a href=\"http://tinasoft.eu/Feedback\">report a bug</a>");
    var infodiv = new InfoDiv("#infodiv");

    // auto-adjusting infodiv height
    var new_size = tinaviz.getHeight() - 40;
    $(infodiv.id).css( 'height', new_size);

    $(infodiv.id).accordion({
        fillSpace: true,
    });

    // cleans infodiv
    infodiv.reset();
    // passing infodiv to tinaviz is REQUIRED
    tinaviz.infodiv = infodiv;

    // TODO : handler to open a graph file
    /*$('#htoolbar input[type=file]').change(function(e){
        tinaviz.clear();
        tinaviz.loadAbsoluteGraph( $(this).val() );
    });*/

    // all hover and c$( ".selector" ).slider( "option", "values", [1,5,9] );lick logic for buttons
    $(".fg-button:not(.ui-state-disabled)")
    .hover(
        function(){
            $(this).addClass("ui-state-hover");
        },
        function(){
            $(this).removeClass("ui-state-hover");
        }
    )
    .mousedown(function(){
        $(this).parents('.fg-buttonset-single:first').find(".fg-button.ui-state-active").removeClass("ui-state-active");
        if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ) {
            $(this).removeClass("ui-state-active");
        }
        else {
            $(this).addClass("ui-state-active");
        }
    })
    .mouseup(function(){
        if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ) {
            $(this).removeClass("ui-state-active");
        }
    });

    // binds the click event to tinaviz.searchNodes()

    $("#search").submit(function() {
      var txt = $("#search_input").val();
      if (txt=="") {
            tinaviz.unselect();
      } else {
            tinaviz.searchNodes(txt, "containsIgnoreCase");
      }
      return false;
    });
    /*
    $("#search").keypress(function() {
      var txt = $("#search_input").val();
      if (txt=="") {
        tinaviz.unselect();
      } else {
           tinaviz.highlightNodes(txt, "containsIgnoreCase");
      }
    });
    */
    $("#search_button").button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click( function(eventObject) {
          var txt = $("#search_input").val();
          if (txt=="") {
                tinaviz.unselect();
          } else {
                tinaviz.searchNodes(txt, "containsIgnoreCase");
          }
    });

    // SLIDERS INIT
    $.extend($.ui.slider.defaults, {
        //range: "min",
        min: 0,
        max: 100,
        value: 100.0,
        animate: true,
        orientation: "horizontal",
    });

    // MACRO SLIDERS
    $("#sliderEdgeWeight").slider({
        range: true,
        values: [0, 100],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "edgeWeight/min", ui.values[0] / 100.0);
            tinaviz.setProperty("current", "edgeWeight/max", ui.values[1] / 100.0);
            tinaviz.resetLayoutCounter();
            tinaviz.touch();
        }
    });

    $("#sliderNodeWeight").slider({
        range: true,
        values: [0, 100],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "nodeWeight/min", ui.values[0] / 100.0);
            tinaviz.setProperty("current", "nodeWeight/max", ui.values[1] / 100.0);
            tinaviz.resetLayoutCounter();
            tinaviz.touch();
        }
    });
    /*
    $("#sliderNodeSize").slider({
        value: 50.0,
        max: 100.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "output/nodeSizeRatio", ui.value / 100.0);
            //tinaviz.resetLayoutCounter();
            tinaviz.touch();
        }}
    );
*/
    $("#sliderSelectionZone").slider({
        value: 1.0,
        max: 300.0, // max disk radius, in pixel
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "selection/radius", ui.value);
            tinaviz.touch();
        }
    });

    $("#toggle-showLabels").click(function(event) {
        tinaviz.toggleLabels();
    });

    $("#toggle-showNodes").click(function(event) {
        tinaviz.toggleNodes();
    });

    $("#toggle-showEdges").click(function(event) {
        tinaviz.toggleEdges();
    });

    $("#toggle-paused").button({
        icons: {primary:'ui-icon-pause'},
        text: true,
        label: "pause",
    })
    .click(function(event) {
        tinaviz.togglePause();
        if( $("#toggle-paused").button('option','icons')['primary'] == 'ui-icon-pause'  ) {
            $("#toggle-paused").button('option','icons',{'primary':'ui-icon-play'});
            $("#toggle-paused").button('option','label',"play");
        }
        else {
            $("#toggle-paused").button('option','icons',{'primary':'ui-icon-pause'});
            $("#toggle-paused").button('option','label',"pause");
        }
    });

    $("#toggle-unselect").button({
        icons: {primary:'ui-icon-close'},
    }).click(function(event) {
        tinaviz.unselect();
    });

    $("#toggle-autoCentering").button({
        text: true,
        icons: {
            primary: 'ui-icon-home'
        }
    })
    .click(function(event) {
        tinaviz.autoCentering();
    });

    $("#toggle-switch").button({
        text: true,
        icons: {
            primary: 'ui-icon-arrows'
        },
    }).click(function(event) {
        tinaviz.toggleCategory("current");
    });

   $('#waitMessage').effect('pulsate', {}, 'fast');

    $(window).bind('resize', function() {
        if (tinaviz.enabled()) {
            tinaviz.auto_resize();
            $("#infodiv").css( 'height', getScreenHeight() - $("#hd").height() - $("#ft").height() - 60);
        }
    });
});

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
 * Asynchronous display of node list
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
    /*
    * dispatch current category displayed
    */
    display_current_category: function() {
        var current_cat = tinaviz.getProperty("current","category/value");
        if (current_cat !== undefined)
            var opposite = this.categories[tinaviz.getOppositeCategory(current_cat)];
            //$("#title_acc_1").text("current selection of "+ this.categories[current_cat]);
        if (opposite !== undefined)
            $("#toggle-switch").button("option", "label", "switch to "+ opposite);
        else
            $("#toggle-switch").button("option", "label", "switch category");
    },
    /*
    * dispatch current view displayed
    */
    display_current_view: function() {
        var current_view = tinaviz.getView();
        if (current_view !== undefined)
            $("#title").html("FET Open projects explorer : "+current_view+" view");
        else
            $("#title").html("FET Open projects explorer");
    },

    /*
     * Generic sorting DOM lists
     */
    alphabetSort: function(maindiv, parentdiv, childrendiv, separator) {
        var listitems = parentdiv.children(childrendiv).get();
        listitems.sort(function(a, b) {
           var compA = $(a).html().toUpperCase();
           var compB = $(b).html().toUpperCase();
           return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
        })
        $.each(listitems, function(idx, itm) {
            if ( idx != 0 && idx != listitems.length )
                maindiv.append(separator);
            maindiv.append(itm);
        });
    },

    /*
     * infodiv tag cloud contents
     * Unique node mode = uses the occurrences attr to set the size of the label
     * of the opposite type of a given node
     */
    tagCloudOne: function() {
        var ngsizecoef = 15;
        for (var nodeid in this.selection) {
            // we need the full neighbourhood for the tag cloud
            var nb = tinaviz.getNeighbourhood("macro",nodeid);
            var tagcloud = $("<p></p>");
            for(var nbid in nb) {
                if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                    var tag = $("<span class='tinaviz_node'></span>")
                        .addClass('ui-widget-content')
                        .html( decodeJSON(nb[nbid]['label']) )
                        .click( function(eventObject) {
                            //switch to meso view
                            tinaviz.viewMeso(decodeJSON(nbid), decodeJSON(nb[nbid]['category']));
                        });
                    if ( this.selection[nodeid]['category'] == 'NGram' ) {
                        tag.css('font-size', 12)
                    }
                    else if ( this.selection[nodeid]['category'] == 'Document' ) {
                        tag.css('font-size', Math.floor( ngsizecoef* Math.log( 1.5 + nb[nbid]['occurrences'] )))
                    }
                    tagcloud.append(tag);
                }
            }
            this.cloud.append( "<h3>Related to:</h3>" );
            this.alphabetSort( this.cloud, tagcloud, "span", ", &nbsp;" );
            break;
        }
        return true;
    },

    /*
     * infodiv tag cloud contents
     * multiple mode = sums degrees to set the size of label
     * of the opposite type of a given node
     */
    tagCloudMultiple: function() {
        var sizecoef = 15;
        var tempcloud = {};
        /* builds tempcloud variable */
        for (var nodeid in this.selection) {
            // we need the full neighbourhood for the tag cloud
            var nb = tinaviz.getNeighbourhood("macro",nodeid);
            for(var nbid in nb) {
                nbid = decodeJSON(nbid);
                if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                    if ( tempcloud[nbid] === undefined )
                        tempcloud[nbid] = {
                            'label' : decodeJSON(nb[nbid]['label']),
                            'occurrences' : 1,
                            'category': , decodeJSON(nb[nbid]['category']),
                        };
                    else
                        tempcloud[nbid]['occurrences']++;
                }
            }
        }
        /* displaying tag cloud */
        var tagcloud = $("<p></p>");
        for (var tagid in tempcloud) {
            var tag = $("<span class='tinaviz_node'></span>")
                .addClass('ui-widget-content')
                .css('font-size', Math.floor( sizecoef* Math.log( 1.5 + tempcloud[tagid]['occurrences'] )))
                .html( tempcloud[tagid]['label'] )
                .click( function(eventObject) {
                    //switch to meso view
                    tinaviz.viewMeso(tagid, tempcloud[nbid]['category']));
                });
                tagcloud.append(tag);
            tagcloud.append(" ");
        }
        this.cloud.append( "<h3>Related to:</h3>" );
        this.alphabetSort( this.cloud, tagcloud, "span", ", &nbsp;" );
        return true;
    },

    /*
     * updates the tag cloud
     */
    updateTagCloud: function( ) {
        this.cloud.empty();
        if ( Object.size ( this.selection ) == 1 ) {
            this.tagCloudOne();
        }
        else if ( Object.size ( this.selection ) > 1 ) {
            this.tagCloudMultiple();
        }
    },

    /*
     * updates the label and content DOM divs
     */
    updateInfo: function() {
        var labelinnerdiv = $("<div></div>");
        for(var id in this.selection) {
            var node = this.selection[id];
            labelinnerdiv.append( $("<b></b>").html(decodeJSON(node.label)) );
            if ( node.category == 'NGram' ) {
                // no content to display
            }
            if ( node.category == 'Document' && node.content != null ) {
                this.contents.append( $("<b></b>").html(decodeJSON(node.label)) );
                this.contents.append( $("<p></p>").html(decodeJSON(node.content)) );
            }
        }
        //this.alphabetSort( this.label, labelinnerdiv, "b", ",<br/>" );
        this.alphabetSort( this.label, labelinnerdiv, "b", ", &nbsp;&nbsp;" );
    },

    /*
     * updates the infodiv contents
     */
    update: function(view, lastselection) {
        if ( Object.size ( lastselection ) == 0 ) {
            this.reset();
            return;
        }
        this.label.empty();
        this.unselect_button.show();
        this.contents.empty();
        this.selection = lastselection;
        this.updateInfo();
        this.updateTagCloud();
        return;
    },

    /*
     * Resets the entire infodiv
     */
    reset: function() {
        this.unselect_button.hide();
        this.label.empty().append($("<h2></h2>").html("empty selection"));
        this.contents.empty().append($("<h4></h4>").html("Click on a node to begin exploration"));
        this.cloud.empty();
        this.selection = {};
        this.neighbours = {};
        return;
    },

    /*
     * Init the node list
     */
    updateNodeList: function( node_list ) {
        this.table.empty();
        for (var i = 0; i < node_list.length; i++ ) {
            (function () {
                var rowLabel = decodeJSON(node_list[i]['label']);
                var rowId = decodeJSON(node_list[i]['id']);
                // Do a little bit of work here...
                //if (true) {
                    // Inform the application of the progress
                    //progressFn(value, total);
                    // Process next chunk
                setTimeout("displayNodeRow(\""+rowLabel+"\",\""+rowId+"\")", 0);
                //}
            })();
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
        // MAIN PROGRAM
        this.main = function() {

            this.setView("macro");

            this.dispatchProperty("edgeWeight/min", 0.0);
            this.dispatchProperty("edgeWeight/max", 1.0);
            this.dispatchProperty("nodeWeight/min", 0.0);
            this.dispatchProperty("nodeWeight/max", 1.0);
            this.dispatchProperty("category/value", "NGram");
            this.dispatchProperty("category/mode", "keep");
            this.dispatchProperty("output/nodeSizeMin", 5.0);
            this.dispatchProperty("output/nodeSizeMax", 20.0);
            this.dispatchProperty("output/nodeSizeRatio", 50.0/100.0);

            this.dispatchProperty("selection/radius", 1.0);

            this.bindFilter("Category", "category", "macro");

            this.bindFilter("NodeWeightRange",  "nodeWeight", "macro");
            this.bindFilter("EdgeWeightRange", "edgeWeight",  "macro");
            this.bindFilter("NodeFunction", "radiusByWeight", "macro");
            this.bindFilter("Output", "output", "macro");

            //this.bindFilter("NodeRadius",   "radius",         "macro");

            // special version of the subgraph copy filter: this one does not use the
            // tinasoft berkeley database to get data
            this.bindFilter("SubGraphCopyStandalone", "subgraph", "meso");
            this.setProperty("meso", "subgraph/source", "macro");
            this.setProperty("meso", "subgraph/item", "");
            this.setProperty("meso", "subgraph/category", "NGram");
            /*
            this.bindFilter("NodeWeightRange",  "nodeWeight", "meso");
            this.bindFilter("EdgeWeightRange", "edgeWeight",  "meso");
            */
            this.bindFilter("NodeFunction", "radiusByWeight", "meso");

            this.bindFilter("Output", "output", "meso");


            // this.readGraphJava("macro", "French_bipartite_graph.gexf");
            this.readGraphJava("macro", "FET60bipartite_graph_cooccurrences_.gexf");
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

        this.init= function() {
            if (wrapper != null || applet != null) return;
            wrapper = $('#tinaviz')[0];
            if (wrapper == null) return;
            applet = wrapper.getSubApplet();
            if (applet == null) return;
            this.resize();
            this.main();
            this.isReady = 1;
        }

        this.resize = function() {
           this.size(this.getWidth(), this.getHeight());
        }

        // RESIZE THE APPLET
        this.size= function(width, height) {
            if (wrapper == null || applet == null) return;
            wrapper.width = width;
            wrapper.height = height;
            $('#tinaviz').css('width',width);
            $('#tinaviz').css('height',height);
        }

        // TODO: use a cross-browser compatible way of getting the current URL
        this.readGraphJava= function(view,graphURL) {
                // window.location.href
                // window.location.pathname
                var sPath = document.location.href;
                var gexfURL = sPath.substring(0, sPath.lastIndexOf('/') + 1) + graphURL;
                applet.getSession().updateFromURI(view,gexfURL);
        }

        this.readGraphAJAX= function(view,graphURL) {
            if (applet == null) return;
            $.ajax({
                url: graphURL,
                type: "GET",
                dataType: "text",
                beforeSend: function() { $('#loading').show(); },
                error: function() { $('#loading').hide(); },
                success: function(gexf) {
                   applet.getSession().updateFromString(view,gexf);
                   $('#loading').hide();
               }
            });
        }

        this.openGraph = function(view,relativePath) {
            if (applet == null) return;
            applet.getSession().updateFromURI(view,path);
        }

        this.toggleLabels = function() {
            if (applet == null) return;
            return applet.getView().toggleLabels();
        }

        this.toggleNodes = function() {
            if (applet == null) return;
            return applet.getView().toggleNodes();
        }

        this.toggleEdges = function() {
            if (applet == null) return;
            return applet.getView().toggleLinks();
        }

        this.togglePause = function() {
            if (applet == null) return;
            return applet.getView().togglePause();
        }
        this.toggleHD = function() {
            if (applet == null) return;
            return applet.getView().toggleHD();
        }

        this.setView = function(view) {
            if (applet == null) return;
            applet.setView(view);
        }
        this.getView = function(view) {
            if (applet == null) return;
            return applet.getView().getName();
        }

        /**
         * Commits applets parameters
         * Accept an optional callback to give some reaction to events
         */

        this.touch= function(view) {
            if (applet == null) return;
            if (view==null) {
                applet.touch();
            } else {
                applet.touch(view);
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

        /* Push a callback in the queue */
        this.enqueueCb=function(id,cb) {
            cbsAwait[id] = cb;
        }
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


        /*
        * Tells the NOT DISPLAYED category name
        */
        this.getOppositeCategory = function(cat) {
            if (cat == "Document")
                return "NGram";
            else if (cat == "NGram")
                return "Document";
            else alert("error, cannot get opposite category of "+cat);

        }

        /**
         * Toggle node's category visible
         */
        this.toggleCategory = function(view) {
            if (applet == null) return;
            var KEY = "category/value";
            // TODO switch to the other view
            this.setProperty(view, KEY, this.getOppositeCategory( this.getProperty(view, KEY)));
            tinaviz.resetLayoutCounter();
            this.touch();
            this.autoCentering();
            this.updateNodes(view, this.getProperty(view, KEY));
            // project the selection in the other view
            for(var id in this.selection) {
                var neighbours = this.getNeighbourhood("macro", id);
                for (var neighbourId in neighbours) {
                    if (neighbours[neighbourId].category == opposite) {
                        this.selectFromId(neighbourId);
                    }
                }
            }
        }


        /**
         * Toggle view to meso given an id
         */
        this.viewMeso = function(id, category) {
            // changes view level
            this.setView("meso");
            // sets the center of the graph
            this.setProperty("meso", "subgraph/category", category);
            // sets the neighbours' type
            this.setProperty("meso", "subgraph/item", id );
        }

        this.bindFilter= function(name, path, view) {
            if (applet == null) return;
            if (view == null) return applet.getSession().addFilter(name, path);
            return applet.getView(view).addFilter(name, path);
        }

        this.dispatchProperty= function(key,value) {
            if (applet == null) return;
            return applet.setProperty("all",key,value);
        }

        this.setProperty= function(view,key,value) {
            if (applet == null) return;
            return applet.setProperty(view,key,value);
        }


        this.getProperty= function(view,key) {
            if (applet == null) return;
            return applet.getProperty(view,key);
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

       this.highlightNodes= function(label, type) {
            if (applet == null) return {};
            var matchlist = this.getNodesByLabel(label, type);
            for (var i = 0; i < matchlist.length; i++ ) {
                applet.highlightFromId( decodeJSON( matchlist[i]['id'] ) );
                // todo: auto center!!
                //applet.
            }
        }

        /*
        * unselect all nodes
        */
        this.unselect= function() {
            if (applet != null)  applet.unselect();
            this.infodiv.reset();
            this.setProperty("meso", "subgraph/item", "");
            applet.clear("meso");
        }
        /*
        * recenter the graph
        */
        this.autoCentering= function() {
            if (applet == null) return false;
            return applet.autoCentering();
        }

        this.getNodeAttributes = function(id) {
            if (applet == null) return;
            return $.parseJSON( applet.getNodesAttributes(id) );
        }

        this.getNeighbourhood = function(view,id) {
            if (applet == null) return;
            return $.parseJSON( applet.getNeighbourhood(view,id) );
        }

        this.nodeLeftClicked = function(view, data) {
            if ( data == null ) return;
            if (view=="meso") {
                this.setProperty("meso", "subgraph/category",
                    this.getProperty(view, "category/value"));
            }
            return this.infodiv.update(view, data);
        }

        this.nodeRightClicked = function(view, data) {
            if (applet == null) return;
            if (view == "meso") {
                this.toggleCategory(view);
            }
        }

        this.selected = function(view, attr, mouse) {
            if (attr == null) return;
            data = $.parseJSON(attr);
            this.infodiv.reset();
            if ( mouse == "left" ) {
                this.nodeLeftClicked(view,data);
            } else if ( mouse == "right" ) {
                this.nodeRightClicked(view,data);
            }
        }

        this.selectFromId = function( id ) {
            if (applet == null) return;
            return applet.selectFromId(id);
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
         *  Fires theupdate of node cache
         */
        this.updateNodes = function(view, category)  {
            this.infodiv.display_current_category();
            if (this.infodiv.data[category] === undefined)
                this.infodiv.updateNodeList( this.getNodes( view, category ) );
            else
                this.infodiv.updateNodeList( this.infodiv.data[category] );
        }

        this.enabled = function() {
            if (applet == null) {
                return false;
            } else {
                return applet.isEnabled();
            }
        }
        this.enable =  function() {
            if (applet == null) return;
            applet.setEnabled(true);
        }

        this.disable =  function() {
            if (applet == null) return;
            applet.setEnabled(false);
        }

        this.logError= function(msg) {
            //console.console.error(msg);
        }

        this.logNormal= function(msg) {
            //console.console.log(msg);
        }

        this.logDebug= function(msg) {
            //console.console.info(msg);
        }


        this.resetLayoutCounter= function(view) {
            // TODO switch to the other view
            applet.resetLayoutCounter();
        }

        /**
         * Callback called whenever the applet change of view
         */
        this.switchedTo= function(view) {
            if (applet == null) return;
            this.autoCentering();
            if (view=="macro") {
                $("#toggle-project").button('enable');
            } else if (view=="meso") {
                $("#toggle-project").button('disable');
            }

            // update the buttons
            $("#sliderEdgeWeight").slider( "option", "values", [
                this.getProperty(view, "edgeWeight/min"),
                this.getProperty(view, "edgeWeight/max")*100
            ]);
            $("#sliderNodeWeight").slider( "option", "values", [
                this.getProperty(view, "nodeWeight/min"),
                this.getProperty(view, "nodeWeight/max")*100
            ]);
            this.infodiv.display_current_view();
        }

        this.getWidth= function() {
            return $("#vizdiv").width();
        }

        this.getHeight= function() {
            return getScreenHeight() - $("#hd").height() - $("#ft").height() - 40;
        }

        this.buttonStateCallback = function(button, enabled) {
            // state = "disable"; if (enabled) { state = "enable"; }
            //alert("#toggle-"+button);
            $("#toggle-"+button).toggleClass("ui-state-active", enabled);
            //$("#toggle-"+button).button(state);
         }

    //};
}

var tinaviz = new Tinaviz();

$(document).ready(function(){

    $(function(){
        $.extend($.fn.disableTextSelect = function() {
            return this.each(function(){
                if($.browser.mozilla){//Firefox $("#sliderEdgeWeight")
                    $(this).css('MozUserSelect','none');
                }else if($.browser.msie){//IE
                    $(this).bind('selectstart',function(){return false;});
                }else{//Opera, etc.
                    $(this).mousedown(function(){return false;});
                }
            });
        });
        $('.noSelect').disableTextSelect();//No text selection on elements with a class of 'noSelect'
         $('.noSelect').hover(function() {
            $(this).css('cursor','default');
         }, function() {
            $(this).css('cursor','auto');
        });
    });



    $("#title").html("FET Open projects explorer");
    var infodiv = new InfoDiv("#infodiv");
    // auto-adjusting infodiv height
    $(infodiv.id).css( 'height', getScreenHeight() - $("#hd").height() - $("#ft").height() - 60);
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
        ("#search").submit();
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

    $("#sliderNodeSize").slider({
        value: 50.0,
        max: 100.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("current", "output/nodeSizeRatio", ui.value / 100.0);
            tinaviz.touch();
        }}
    );

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

   $('#waitMessage').effect('pulsate', {}, 'normal');

    $(window).bind('resize', function() {
        if (tinaviz.enabled()) {
            tinaviz.resize();
            $("#infodiv").css( 'height', getScreenHeight() - $("#hd").height() - $("#ft").height() - 60);
        }
    });
});

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
    return decodeURIComponent(encvalue).replace(/\+/g, " ").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%2A/g, "*");
};


function displayNodeRow(label) {
    //console.log("inserting "+label);
    $("#node_table > tbody").append(
        $("<tr></tr>").append(
            $("<td class='tinaviz_node'></td>").text(label).click( function(eventObject) {
                var matchlist = tinaviz.getNodesByLabel(label, "equalsIgnoreCase");
                console.log(matchlist);
                tinaviz.setProperty("meso", "subgraph/item", decodeJSON( matchlist[0]['id'] ));
                tinaviz.touch("meso");
                tinaviz.setLevel("meso");
                tinaviz.recenter();
            })
        )
    );
};

function InfoDiv(divid) {

    return {
    id: divid,
    selection : {},
    neighbours : {},
    label : $( "#node_label" ),
    contents : $( "#node_contents" ),
    cloud : $( "#node_neighbourhood" ),
    unselect_button: $( "#node_unselect" ),
    table: $("#node_table > tbody"),
    data: {},

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
        for (var nodeid in this.selection) {
            var nb = tinaviz.getNeighbourhood(nodeid);
            var ngsizecoef=20;
            var tagcloud = $("<p></p>");
            for(var nbid in nb) {
                if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                    var tag = $("<span class='tinaviz_node'></span>")
                        .addClass('ui-widget-content')
                        .html( decodeJSON(nb[nbid]['label']) )
                        .click( function(eventObject) {
                            //tinaviz.toggleCategory( "macro" );
                            //tinaviz.searchNodes(nb[nbid]['label'], "equalsIgnoreCase");
                        });
                    if ( this.selection[nodeid]['category'] == 'NGram' ) {
                        tag.css('font-size', 12)
                    }
                    else if ( this.selection[nodeid]['category'] == 'Document' ) {
                        tag.css('font-size', Math.floor( ngsizecoef* Math.log( 1 + nb[nbid]['occurrences'] )))
                    }
                    tagcloud.append(tag);
                    //tagcloud.append(" ");
                }
            }
            //this.cloud.append( tagcloud );
            this.alphabetSort( this.cloud, tagcloud, "span", "  " );
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
        var sizecoef=20;
        var tempcloud = {};
        /* builds tempcloud variable */
        for (var nodeid in this.selection) {
            var nb = tinaviz.getNeighbourhood(nodeid);
            for(var nbid in nb) {
                if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                    if ( tempcloud[nbid] === undefined )
                        tempcloud[nbid] = {
                            'label' : decodeJSON(nb[nbid]['label']),
                            'occurrences' : 1
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
                .css('font-size', Math.floor( sizecoef* Math.log( 1 + tempcloud[tagid]['occurrences'] )))
                .html( tempcloud[tagid]['label'] )
                .click( function(eventObject) {
                    //tinaviz.toggleCategory( "macro" );
                    //tinaviz.searchNodes(tempcloud[tagid]['label'], "equalsIgnoreCase");
                });
                tagcloud.append(tag);
            tagcloud.append(" ");
        }
        //this.cloud.append( tagcloud );
        this.alphabetSort( this.cloud, tagcloud, "span", "  " );
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
        this.alphabetSort( this.label, labelinnerdiv, "b", ",<br/>" );
    },

    /*
     * updates the infodiv contents
     */
    update: function(level, lastselection) {
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
                setTimeout("displayNodeRow('"+rowLabel+"')", 0);
                //}
            })();
        }
    },

    } // end of return
};

function Tinaviz() {

    var wrapper = null;
    var applet = null;
    this.isReady = 0;
    this.infodiv = null;

    //return {
        // MAIN PROGRAM
        this.main = function() {

            this.setLevel("macro");

            this.dispatchProperty("edgeWeight/min", 0.0);
            this.dispatchProperty("edgeWeight/max", 1.0);

            this.dispatchProperty("nodeWeight/min", 0.0);
            this.dispatchProperty("nodeWeight/max", 1.0);


            // we want to keep documents
            this.dispatchProperty("category/value", "NGram");
            this.dispatchProperty("category/mode", "keep");

            this.dispatchProperty("radius/value",  100.0/200.0); // because we set default value to 25/200 in the GUI

            this.bindFilter("Category", "category", "macro");
            //this.bindFilter("NodeWeightRange",  "nodeWeight", "macro");
            this.bindFilter("EdgeWeightRange", "edgeWeight",  "macro");
            this.bindFilter("NodeFunction", "radiusByWeight", "macro");
            this.bindFilter("NodeRadius",   "radius",         "macro");

            // special version of the subgraph copy filter: this one does not use the
            // tinasoft berkeley database to get data
            this.bindFilter("SubGraphCopyStandalone", "subgraph", "meso");
            this.setProperty("meso", "subgraph/source", "macro");
            this.setProperty("meso", "subgraph/item", "");
            this.setProperty("meso", "subgraph/category", "NGram");

            //this.bindFilter("NodeWeightRangeHack", "subgraph", "meso");

            this.readGraphJava("macro", "FET60bipartite_graph_cooccurrences_.gexf");
            //this.readGraphJava("macro", "CSSScholarsMay2010.gexf");

            //this.togglePause();
            // init the node list with ngrams
            this.updateNodes( "macro", "NGram" );
            // cache the document list
            this.getNodes( "macro", "Document" );
        }

        this.init= function() {
            if (wrapper != null || applet != null) return;
            wrapper = $('#tinaviz')[0];
            if (wrapper == null) return;
            applet = wrapper.getSubApplet();
            if (applet == null) return;
            this.size(this.getWidth(), this.getHeight());
            this.main();
            this.isReady = 1;
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

        this.setLevel = function(level) {
            if (applet == null) return;
            applet.getSession().setLevel(level);
        }

        /*
        * Commits applets parameters
        */
        this.touch= function(level) {
            if (applet == null) return;
            applet.getView(level).getGraph().touch();
        }

        /*
        * Toggle node's category visible
        */
        this.toggleCategory = function(level) {
            if (applet == null) return;
            var cat = this.getProperty(level, "category/value");
            if (cat == "Document") newcategory = "NGram";
            if (cat == "NGram") newcategory = "Document";
            this.setProperty(level, "category/value", newcategory);
            this.touch(level);
            this.recenter();
            this.updateNodes(level, newcategory);
        }

        this.bindFilter= function(name, path, level) {
            if (applet == null) return;
            if (level == null) return applet.getSession().addFilter(name, path);
            return applet.getView(level).addFilter(name, path);
        }

        this.dispatchProperty= function(key,value) {
            if (applet == null) return;
            return applet.getSession().setProperty(key,value);
        }

        this.setProperty= function(level,key,value) {
            if (applet == null) return;
            return applet.getView(level).setProperty(key,value);
        }

        this.getProperty= function(level,key,value) {
            if (applet == null) return;
            return applet.getView(level).getProperty(key);
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
        this.recenter= function() {
            if (applet == null) return false;
            return applet.recenter();
        }

        this.getNodeAttributes = function(id) {
            if (applet == null) return;
            return $.parseJSON( applet.getNodesAttributes(id) );
        }

        this.getNeighbourhood = function(id) {
            if (applet == null) return;
            return $.parseJSON( applet.getNeighbourhood(id) );
        }

        this.nodeLeftClicked = function(level, data) {
            if ( data == null ) return;
            // TODO replace the hash by a list
            for (key in data) {
                this.setProperty("meso", "subgraph/item", decodeJSON(key));
            }
            if (level=="meso") {
                this.touch(level);
                this.recenter();
            }
            return this.infodiv.update(level, data);
        }

        this.nodeRightClicked = function(level, data) {
            if (applet == null) return;
            if (level=="macro" || level == "meso") {
                this.toggleCategory(level);
            }
        }

        this.selected = function(level, attr, mouse) {
            data = $.parseJSON(attr);
            this.infodiv.reset();
            if ( mouse == "left" ) {
                this.nodeLeftClicked(level,data);
            } else if ( mouse == "right" ) {
                this.nodeRightClicked(level,data);
            }
        }

        this.selectFromId = function( id ) {
            if (applet == null) return;
            return applet.selectFromId(id);
        }

        this.getNodes = function(level, category) {
            if (applet == null) return;
            this.infodiv.data[category] = $.parseJSON( applet.getNodes(level, category) );
            return this.infodiv.data[category];
        }

        this.updateNodes = function(level, category)  {
            if (this.infodiv.data[category] === undefined)
                this.infodiv.updateNodeList( this.getNodes( level, category ) );
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
            //console.error(msg);
        }

        this.logNormal= function(msg) {
            //console.log(msg);
        }

        this.logDebug= function(msg) {
            //console.info(msg);
        }

        this.switchedTo= function(level) {
        }

        this.getWidth= function() {
            return $("#vizdiv").width();
        }

        this.getHeight= function() {
            return getScreenHeight() - $("#hd").height();
        }
    //};
}

var tinaviz = new Tinaviz();

$(document).ready(function(){

    $("#title").html("FET Open projects explorer");
    var infodiv = new InfoDiv("#infodiv");
    // auto-adjusting infodiv height
    $(infodiv.id).css( 'height', getScreenHeight() - $("#hd").height() );
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

    // all hover and click logic for buttons
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

    var searchinput = $("#search_input");
    // binds the click event to tinaviz.searchNodes()
    $("#search_button").button({
        text: false,
        icons: {
            primary: 'ui-icon-search'
        }
    }).click( function(eventObject) {
        tinaviz.searchNodes(searchinput.val(), "containsIgnoreCase");
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
    $("#macroSlider_edgeWeight").slider({
        range: true,
        values: [0, 200],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("macro", "edgeWeight/min", ui.values[0] / 200.0);
            tinaviz.setProperty("macro", "edgeWeight/max", ui.values[1] / 200.0);
            tinaviz.touch("macro");
        }
    });
    /*
    $("#macroSlider_nodeWeight").slider({
        range: true,
        values: [0, 200],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("macro", "nodeWeight/min", ui.values[0] / 200.0);
            tinaviz.setProperty("macro", "nodeWeight/max", ui.values[1] / 200.0);
            tinaviz.touch("macro");
        }
    });*/

    $("#macroSlider_nodeSize").slider({
        value: 50.0,
        max: 200.0,// precision/size
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("macro", "radius/value", ui.value / 200.0);
            tinaviz.touch("macro");
        }}
    );
    $("#toggle-labels-macro").click(function(event) {
        tinaviz.toggleLabels();
    });
    $("#toggle-nodes-macro").click(function(event) {
        tinaviz.toggleNodes();
    });
    $("#toggle-edges-macro").click(function(event) {
        tinaviz.toggleEdges();
    });
    $("#toggle-pause-macro").click(function(event) {
        tinaviz.togglePause();
    });
    $("#toggle-unselect-macro").click(function(event) {
        tinaviz.unselect();
    });
    $("#toggle-recenter-macro").click(function(event) {
        tinaviz.recenter();
    });
});

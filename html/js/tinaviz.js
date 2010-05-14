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
/* useful utility modifying the Object prototype */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};


function InfoDiv() {
    return {
    selection : {},
    neighbours : {},
    label : $( "#node_label" ),
    contents : $( "#node_contents" ),
    cloud : $( "#node_neighbourhood" ),
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
                    var tag = $("<span></span>")
                        .addClass('ui-widget-content')
                        .html( nb[nbid]['label'] );
                    if ( this.selection[nodeid]['category'] == 'NGram' ) {
                        tag.css('font-size', 12)
                    }
                    else if ( this.selection[nodeid]['category'] == 'Document' ) {
                        tag.css('font-size', Math.floor( ngsizecoef* Math.log( 1 + nb[nbid]['occurrences'] )))
                    }
                    tagcloud.append(tag);
                    tagcloud.append(" ");
                }
            }
            this.cloud.append( tagcloud );
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
                            'label' : nb[nbid]['label'],
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
            var tag = $("<span></span>")
                .addClass('ui-widget-content')
                .css('font-size', Math.floor( sizecoef* Math.log( 1 + tempcloud[tagid]['occurrences'] )))
                .html( tempcloud[tagid]['label'] );
            tagcloud.append(tag);
            tagcloud.append(" ");
        }
        this.cloud.append( tagcloud );
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
     * updates the label and contents divs
     */
    updateInfo: function( node ) {
        this.label.append( $("<h2></h2>").html(node.label) );
        if ( node.category == 'NGram' ) {
            // no content to display
        }
        if ( node.category == 'Document' ) {
            this.contents.append( $("<h3></h3>").html(node.label) );
            this.contents.append( $("<p></p>").html(node.content) );
        }
    },
    /*
     * updates the infodiv contents
     */
    update: function(level, lastselection) {
        this.label.empty();
        this.contents.empty();
        for(var id in lastselection) {
            this.selection[id] = lastselection[id];
            this.updateInfo(lastselection[id]);
        }
        this.updateTagCloud();
        return;
    },
    reset: function() {
        this.label.empty().append($("<h2></h2>").html("No node selected"));
        this.contents.empty().append($("<h4></h4>").html("Click on a node to begin exploration"));
        this.cloud.empty();
        this.selection = {};
        this.neighbours = {};
        return;
    }
    } // end of return
};

function Tinaviz() {

    var wrapper = null;
    var applet = null;

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

            this.readGraphJava("macro", "FET60bipartite_graph_cooccurrences_.gexf");

            //tinaviz.togglePause();

        }
        this.init= function() {
            if (wrapper != null || applet != null) return;
            wrapper = $('#tinaviz')[0];
            if (wrapper == null) return;
            applet = wrapper.getSubApplet();
            if (applet == null) return;
            this.size(this.getWidth(), this.getHeight());
            this.main();
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
        },
        */
        this.touch= function(level) {
            if (applet == null) return;
            applet.getView(level).getGraph().touch();
        }
        /*
        bindFilter= function(name, path, level) {
            if (applet == null) return;
            if (level == null) return applet.getSession().addFilter("tinaviz.filters."+name, path);
            return applet.getView(level).addFilter("tinaviz.filters."+name, path);
        },
        */
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
        this.getNodesByLabel= function(label, search_type) {
            if (applet == null || search_type != "equals" || search_type != "contains"|| search_type != "startsWith" || search_type != "endsWith" || search_type != "equalsIgnoreCase") {
                return;
            }
            return applet.getNodesByLabel(label, search_type);
        }
        this.unselect= function() {
            if (applet != null)  applet.unselect();
            this.infodiv.reset();
            this.setProperty("meso", "subgraph/item", "");
            applet.clear("meso");
        }
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
            //alert( applet.getNeighbourhood(id) );
            return $.parseJSON( applet.getNeighbourhood(id) );
        }
        this.nodeLeftClicked = function(level, attr) {
            if ( attr == null ) return;
            return this.infodiv.update(level, attr);
        }
        this.nodeRightClicked = function(level, attr) {
            if (applet == null) return;
            var cat = this.getProperty(level, "category/value");
            if (cat == "Document") newcategory = "NGram";
            if (cat == "NGram") newcategory = "Document";
            this.infodiv.reset();
            this.setProperty("macro", "category/value", newcategory);
            this.touch(level);
            this.recenter();
        }
        this.selected = function(level, attr, mouse) {
            if ( mouse == "left" ) {
                this.nodeLeftClicked(level,$.parseJSON(attr));
            } else if ( mouse == "right" ) {
                this.nodeRightClicked(level,$.parseJSON(attr));
            }
        }
        this.selectFromId = function( id ) {
            if (applet == null) return;
            return applet.selectFromId(id);
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
        }
        this.logNormal= function(msg) {
        }
        this.logDebug= function(msg) {
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

    var infodiv = new InfoDiv();
    infodiv.reset();
    tinaviz.infodiv = infodiv;
    // updates applet size
    $('#htoolbar input[type=file]').change(function(e){
        tinaviz.clear();
        tinaviz.loadAbsoluteGraph( $(this).val() );
    });

    //all hover and click logic for buttons
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
        if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
        else { $(this).addClass("ui-state-active"); }
    })
    .mouseup(function(){
        if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
            $(this).removeClass("ui-state-active");
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

    $("#macroSlider_nodeWeight").slider({
        range: true,
        values: [0, 200],
        animate: true,
        slide: function(event, ui) {
            tinaviz.setProperty("macro", "nodeWeight/min", ui.values[0] / 200.0);
            tinaviz.setProperty("macro", "nodeWeight/max", ui.values[1] / 200.0);
            tinaviz.touch("macro");
        }
    });

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

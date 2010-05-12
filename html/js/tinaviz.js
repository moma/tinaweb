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

function InfoDiv() {
    attr: {},
    neighbours: {},
    /*
     * updates the infodiv tag cloud contents
     * given a node id,
     * displays the opposite category neighbourhood
     */
    displayInfodivTagCloudOne: function(level, id, label, attr) {
        var nb = tinaviz.getNeighbourhood(id);
        var coef=20;
        var neighbours = $( "#node_neighbourhood" );
        neighbours.empty();
        var tagcloud = $("<p></p>");
        for(var nbid in nb) {
            if (attr['category'] != nb[nbid]['category']) {
                var tag = $("<span></span>")
                    .addClass('ui-widget-content')
                    .css('font-size', Math.floor( coef* Math.log( 1 + nb[nbid]['occurrences'] )))
                    .html( nb[nbid]['label'] );
                tagcloud.append(tag);
                tagcloud.append(" ");
            }
        }
        neighbours.append( tagcloud );
        return true;
    },

    /*
     * updates the infodiv tag cloud contents
     * given a node id,
     * displays the opposite category neighbourhood
     */
    displayInfodivTagCloudMultiple: function(level, id, label, attr) {
        //var nb = tinaviz.getNeighbourhood(id);
        var coef=20;
        var neighbours = $( "#node_neighbourhood" );
        neighbours.empty();
        var tagcloud = $("<p></p>");
        for(var nbid in nb) {
            if (attr['category'] != nb[nbid]['category']) {
                var tag = $("<span></span>")
                    .addClass('ui-widget-content')
                    .css('font-size', Math.floor( coef* Math.log( 1 + nb[nbid]['occurrences'] )))
                    .html( nb[nbid]['label'] );
                tagcloud.append(tag);
                tagcloud.append(" ");
            }
        }
        neighbours.append( tagcloud );
        return true;
    }

    updateTagCloud: function(node) {

    },
    updateInfo: function( node, nodelabel, contents ) {
        nodelabel.append( $("<h2></h2>").html(node.label) );
        if ( node.category == 'NGram' ) {
            // no content to display
        }
        if ( node.category == 'Document' ) {
            contents.append( $( "<p></p>".html(node.content) );
        }
    },
    /*
     * updates the infodiv contents
     */
    update: function(level, attr) {
        var nodelabel = $( "#node_label" );
        //nodelabel.empty().html( "<h2>"+label+"</h2>" );
        var contents = $( "#node_contents" );
        var neighbours = $( "#node_neighbourhood" );
        for(var id in attr) {
            if (this.attr[id] === undefined) {
                this.attr[id] = attr[id];
                this.updateInfo(attr[id]);
                //this.updateTagCloud(attr[id]);
            }
        }
        return;
    },
    reset: function() {
        this.attr = {};
        this.neighbours = {};
        return
    }
}

infodiv = new InfoDiv();

function Tinaviz() {

    var wrapper = null;
    var applet = null;

    //return {
        // MAIN PROGRAM
        this.main = function() {

            this.setLevel("macro");

            this.dispatchProperty("edgeWeight/min", 0.0);
            this.dispatchProperty("edgeWeight/max", 1.0);

            this.dispatchProperty("nodeWeight/min", 0.0);
            this.dispatchProperty("nodeWeight/max", 1.0);

            this.dispatchProperty("radiusByWeight/max", 100.0/200.0);

            // we want to keep documents
            this.dispatchProperty("category/value", "Document");
            this.dispatchProperty("category/mode", "keep");

            this.dispatchProperty("radius/value",  100.0/200.0); // because we set default value to 25/200 in the GUI

            this.bindFilter("Category", "category", "macro");
            //this.bindFilter("NodeWeightRange",  "nodeWeight", "macro");
            // filter by edge threshold
            this.bindFilter("EdgeWeightRange", "edgeWeight", "macro");
            this.bindFilter("NodeFunction", "radiusByWeight", "macro");
            this.readGraphJava("macro", "FET60bipartite_graph_cooccurrences_.gexf");

            tinaviz.togglePause();

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

        this.openGraph= function(view,relativePath) {
            if (applet == null) return;
            applet.getSession().updateFromURI(view,path);
        }
        this.toggleLabels= function() {
            if (applet == null) return;
            return applet.getView().toggleLabels();
        }
        this.toggleNodes= function() {
            if (applet == null) return;
            return applet.getView().toggleNodes();
        }
        this.toggleEdges= function() {
            if (applet == null) return;
            return applet.getView().toggleLinks();
        }
        this.togglePause= function() {
            if (applet == null) return;
            return applet.getView().togglePause();
        }
        this.toggleHD= function() {
            if (applet == null) return;
            return applet.getView().toggleHD();
        }
        this.setLevel= function(level) {
            if (applet == null) return;
            applet.getSession().setLevel(level);
        }
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
            return infodiv.update( level, attr);
        }
        this.nodeRightClicked = function(level, attr) {
            if (applet == null) return;
            var cat = this.getProperty(level, "category/value");
            if (cat == "Document") newcategory = "NGram";
            if (cat == "NGram") newcategory = "Document";
            this.setProperty("macro", "category/value", newcategory);
            this.touch(level);
            this.recenter();
        }
        this.nodeSelected = function(level, x, y, id, label, attr, mouse) {
            if ( mouse == "left" ) {
                this.nodeLeftClicked(level, x, y, id, label, $.parseJSON(attr));
            } else if ( mouse == "right" ) {
                this.nodeRightClicked(level, x, y, id, label, $.parseJSON(attr));
            }
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
tinaviz = new Tinaviz();

$(document).ready(function(){
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

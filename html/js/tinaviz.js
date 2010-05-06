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

function Tinaviz() {

    var wrapper = null;
    var applet = null;

    //return {
        // MAIN PROGRAM
        this.main= function() {
            this.setLevel("macro");
            applet.dispatchProperty("category/value", "NGram");
            applet.dispatchProperty("category/mode", "keep");
            this.readGraphJava("macro", "current.gexf");
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
            wrapper.width = width;
            wrapper.height = height;
            $('#tinaviz').css('width',""+ width + "px");
            $('#tinaviz').css('height',"" + height +"px");
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
        this.search= function(txt) {
            this.logNormal("Searching is not implemented yet..");
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
        this.nodeSelected= function(level,x,y,id,label,attr) {
        }
        this.enabled= function() {
            if (applet == null) {
                return false;
            } else {
                return applet.isEnabled();
            }
        }
        this.enable=  function() {
            if (applet == null) return;
            applet.setEnabled(true);
        }
        this.disable=  function() {
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
           return getScreenWidth() - 28;
        }
        this.getHeight= function() {
           return getScreenHeight() - 150;
        }
    //};
}
tinaviz = new Tinaviz();

$(document).ready(function(){

    $('#loading').hide();

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
        value: 25.0,
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

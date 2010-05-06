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

  return {

     // MAIN PROGRAM
     main: function() {
        this.setLevel("macro");
    applet.dispatchProperty("category/value", "NGram");
    applet.dispatchProperty("category/mode", "keep");
        this.readGraph("macro", "current.gexf");
     },

     init: function() {
        if (wrapper != null || applet != null) return;
        wrapper = $('#tinaviz')[0];
    if (wrapper == null) return;

        applet = wrapper.getSubApplet();
    if (applet == null) return;

        this.size(this.getWidth(), this.getHeight());
        this.main();
    },

    // RESIZE THE APPLET
    size: function(width, height) {
        wrapper.width = width;
        wrapper.height = height;
        $('#tinaviz').css('width',""+ width + "px");
        $('#tinaviz').css('height',"" + height +"px");
    },

    readGraph: function(view,graphURL) {
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
    },

    openGraph: function(view,relativePath) {
        if (applet == null) return;
        applet.getSession().updateFromURI(view,path);
    },

    toggleLabels: function() {
        if (applet == null) return;
        return applet.getView().toggleLabels();
    },
    toggleNodes: function() {
        if (applet == null) return;
        return applet.getView().toggleNodes();
    },
    toggleEdges: function() {
        if (applet == null) return;
        return applet.getView().toggleLinks();
    },
    togglePause: function() {
        if (applet == null) return;
        return applet.getView().togglePause();
    },
    toggleHD: function() {
        if (applet == null) return;
        return applet.getView().toggleHD();
    },
    setLevel: function(level) {
        if (applet == null) return;
        applet.getSession().setLevel(level);
    },
/*
    bindFilter: function(name, path, level) {
        if (applet == null) return;
        if (level == null) return applet.getSession().addFilter("tinaviz.filters."+name, path);
        return applet.getView(level).addFilter("tinaviz.filters."+name, path);
    },
    */
    bindFilter: function(name, path, level) {
        if (applet == null) return;
        if (level == null) return applet.getSession().addFilter(name, path);
        return applet.getView(level).addFilter(name, path);
    },

    dispatchProperty: function(key,value) {
        if (applet == null) return;
        return applet.getSession().setProperty(key,value);
    },

    setProperty: function(level,key,value) {
        if (applet == null) return;
        return applet.getView(level).setProperty(key,value);
    },

    getProperty: function(level,key,value) {
        if (applet == null) return;
        return applet.getView(level).getProperty(key);
    },

    search: function(txt) {
        this.logNormal("Searching is not implemented yet..");
    },


    unselect: function() {
        if (applet != null)  applet.unselect();
        this.setProperty("meso", "subgraph/item", "");
        applet.clear("meso");
    },

    recenter: function() {
        if (applet == null) return false;
        return applet.recenter();
    },

    nodeSelected: function(level,x,y,id,label,attr) {
    },

    enabled: function() {
        if (applet == null) {
            return false;
        } else {
            return applet.isEnabled();
        }
    },
    enable:  function() {
        if (applet == null) return;
        applet.setEnabled(true);
    },

    disable:  function() {
        if (applet == null) return;
        applet.setEnabled(false);
    },

    logError: function(msg) {
    },
    logNormal: function(msg) {
    },
    logDebug: function(msg) {
    },
    switchedTo: function(level) {
    },

    getWidth: function() {
       return getScreenWidth() - 28;
    },
    getHeight: function() {
       return getScreenHeight() - 150;
    }
  };
}

$(document).ready(function(){
    var tinaviz = new Tinaviz();
    $('#loading').hide();

    $('#toolbar input[type=file]').change(function(e){
      tinaviz.clear();
      tinaviz.loadAbsoluteGraph( $(this).val() );
    });




    $('#pause').button({
        text: false,
        icons: {
            primary: 'ui-icon-pause'
        }
    }).click(function() {
        tinaviz.togglePause();
    });
    /*
    .click(function() {
        var options;
        if ($(this).text() == 'play') {
            options = {
                label: 'pause',
                icons: {
                    primary: 'ui-icon-pause'
                }
            };
        } else {
            options = {
                label: 'play',
                icons: {
                    primary: 'ui-icon-play'
                }
            };
        }
        $(this).button('option', options);
    });*/
    /*
    $('#stop').button({
        text: false,
        icons: {
            primary: 'ui-icon-stop'
        }
    })
    .click(function() {
        $('#play').button('option', {
            label: 'play',
            icons: {
                primary: 'ui-icon-play'
            }
        });
    });*/

    $('#recenter').button({
        text: false,
        icons: {
            primary: 'ui-icon-seek-next'
        }
    }).click(function() {

    });

    $("#toggles").buttonset();

    $('#nodes').button({
        text: "nodes",
        icons: {
            primary: 'ui-icon-nodes'
        }
    }).click(function() {
        tinaviz.toggleNodes();
    });
    $('#edges').button({
        text: "edges",
        icons: {
            primary: 'ui-icon-edges'
        }
    }).click(function() {
        tinaviz.toggleEdges();
    });
    $('#labels').button({
        text: "labels",
        icons: {
            primary: 'ui-icon-labels'
        }
    }).click(function() {
        tinaviz.toggleLabels();
    });

    $('#reset').button({
        text: "reset",
        icons: {
            primary: 'ui-icon-thunder'
        }
    }).click(function() {

        tinaviz.recenter();
    });

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
    }});

});

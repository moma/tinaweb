
function Tinaviz() {
  var wrapper = null;
  var applet = null;
  var width = null;
  var height = null;
  var categoryFilter = "keepCategoryFilter";
  var categoryFilterSwitch = "including";
  
    resized: function() {
        if (applet == null) return;
        wrapper.width = computeAppletWidth();
        wrapper.height = computeAppletHeight();
        // update the overlay layout (eg. recenter the toolbars)
        $('.htoolbar').css('left', (  (wrapper.width - parseInt($('#htoolbariframe').css('width'))) / 2   ));
    },
    
    // Public methods
    loadFromURI: function(uri) {
        if (applet == null) return;
        applet.getSession().updateFromURI(view,uri);
    },
    loadFromString: function(view,gexf) {
        if (applet == null) return;
        applet.getSession().updateFromString(view,gexf);

    },
   
    toggleLabels: function() {
        if (applet == null) return;
        applet.getView().toggleLabels(); 
    },
    toggleNodes: function() {
        if (applet == null) return;
        applet.getView().toggleNodes();
    },
    toggleEdges: function() {
        if (applet == null) return;
        applet.getView().toggleLinks();
    },
    togglePause: function() {
        if (applet == null) return;
        applet.getView().togglePause();
    },
    
    toMacro: function() {
        if (applet == null) return;
        applet.getSession().toMacroLevel();
    },
    
    toMeso: function() {
        if (applet == null) return;
        applet.getSession().toMesoLevel();
    },
    
    toMicro: function() {
        if (applet == null) return;
        applet.getSession().toMicroLevel();
    },
    
    unselect: function() {
        if (applet == null) return;
        applet.unselect();
    },
    clear: function() {
        if (applet == null) return;
        try {
            applet.getSession().clear();
        } catch (e) {
            console.log("exception: "+e);
        
        }
    },

    nodeSelected: function(level,x,y,id,label,attr) {
        if (applet == null) return;
        console.log("nodeSelected("+level+","+x+","+y+","+id+","+label+","+attr+") called!");
    },

    takePDFPicture: function () {
        var outputFilePath = "graph.pdf";
        var result;
        try {
            result = viz.takePDFPicture(outputFilePath);
        } catch (e) {
            console.log(e);
            return;
        }
        console.log('Saving to '+outputFilePath+'</p>');
        setTimeout("downloadFile('"+outputFilePath+"', 60)",2000);
    },

    takePicture: function() {
        var outputFilePath = "graph.png";
        var result;
        try {
            result = viz.takePicture(outputFilePath);
        } catch (e) {
             console.log(e);
             return;
        }
        console.log('Saving to '+outputFilePath+'</p>');
        setTimeout("downloadFile('"+outputFilePath+"', 60)",2000);
    },

    downloadFile: function(outputFilePath, timeout) {
    },
 
    loadDataGraph: function(view,filename) {
    },
     // using string technique
    loadRelativeGraph: function(view,filename) {
    },
     // using string technique
    loadAbsoluteGraph: function(view,filename) {
    },

    loadAbsoluteGraphFromURI: function(filename) {
    },

    isEnabled: function() {
        if (applet == null) {
            return false;
        } else {
            return applet.isEnabled();
        }
    },
    setEnabled:  function(enabled) {
        if (applet == null) return;
        applet.setEnabled(enabled);
    }
  };
}

tinaviz = new Tinaviz();

$(document).ready(function() {

});

function getWidth() {
    var x = 0;
    if (self.innerHeight) {
            x = self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) 
{
            x = document.documentElement.clientWidth;
    }
    else if (document.body) {
            x = document.body.clientWidth;
    }
    return x;
}

function getHeight() {
    var y = 0;
    if (self.innerHeight) {
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) 
{
        y = document.documentElement.clientHeight;
    }
    else if (document.body) {
        y = document.body.clientHeight;
    }
    return y;
}



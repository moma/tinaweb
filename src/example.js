
Nalarium.Trace.enable();

function Tinaviz() {
  var wrapper = null;
  var applet = null;
  var categoryFilter = "keepCategoryFilter";
  var categoryFilterSwitch = "including";
  
  return {
     init: function() {
        if (wrapper != null || applet != null) return;
        wrapper = $('#vizframe').contents().find('#tinaviz')[0];
        applet = wrapper.getSubApplet();
        this.resized();
        

         this.toMacro();
         // this.toggleEdges();
         // this.togglePause();

        this.log("loading default graph..");

         $.ajax({
            type: "GET",
	        url: "celegans.gexf",
	        dataType: "text",
	        success: function(xml) {tinaviz.loadFromString("macro",xml);}
        });

    },
    
    setup: function() {

        // TODO pass the ID to the elishowk API
        var context = {
         root:  {
            uuid: id,
         },
         neighborhood: [
            {
             uuid: '432561326751248',
             label: 'this is an ngram',
             category: 'NGram'
             },
            {
             uuid: '715643267560489',
             label: 'PROJECT',
             category: 'Document'
             },
         ]
        };


        var template = '<?xml version="1.0" encoding="UTF-8"?>\n\
<gexf xmlns="http://www.gephi.org/gexf" xmlns:viz="http://www.gephi.org/gexf/viz">\n\
        <meta lastmodifieddate="19-Feb-2010"><description>Generic Map/2002-2007</description></meta>\n\
    <graph>\n\
        <attributes class="node">\n\
        </attributes>\n\
        <tina>\n\
        </tina>\n\
        <nodes>\n\
<?js for (var i = 0, n = neighborhood.length; i < n; i++) { ?>\
            <node id="#{neighborhood[i].uuid}" label="#{neighborhood[i].label}">\n\
                <attvalues>\n\
                    <attvalue for="0" value="#{neighborhood[i].category}" />\n\
                </attvalues>\n\
            </node>\n\
<?js } ?>\
        </nodes>\n\
        <edges>\n\
<?js for (var i = 0, n = neighborhood.length; i < n; i++) { ?>\
            <edge id="#{i}" source="#{root.uuid}" target="#{neighborhood[i].uuid}" weight="1.0" />\n\
<?js } ?>\
        </edges>\n\
    </graph>\n\
</gexf>';


        /* call the template engine (tenjin is really fast!)*/
        var output = Shotenjin.render(template, context);
        
        this.log(output);

    },
    
    resized: function() {
        if (applet == null) return;
        
        // we update both the applet size and the frame size
        
        wrapper.width = this.getWidth();
        wrapper.height = this.getHeight();
        
        $('#vizframe').css('width',""+ wrapper.width + "px");
        $('#vizframe').css('height',"" + wrapper.height +"px");
    },
    
    // Public methods
    loadFromURI: function(view,uri) {
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
    toggleHD: function() {
        if (applet == null) return;
        applet.getView().toggleHD();
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
            this.log("exception: "+e);
        
        }
    },

    nodeSelected: function(level,x,y,id,label,attr) {
        if (applet == null) return;
        this.log("nodeSelected("+level+","+x+","+y+","+id+","+label+","+attr+") called!");
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
    },
    
    error: function(msg) {
        Nalarium.Trace.writeLine('Error: '+msg);
    },
    log: function(msg) {
        Nalarium.Trace.writeLine('Log: '+msg);
    },
    debug: function(msg) {
        Nalarium.Trace.writeLine('Debug: '+msg);
    },

    getWidth: function() {
         return 800;
    },
    getHeight: function() {
        return 800;
    },
    
    switchedto: function(level) {
       // TODO
    }
   
  };
}

tinaviz = new Tinaviz();

function getScreenWidth() {
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

function getScreenHeight() {
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

 
$(document).ready(function() {
   
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
				if( $(this).is('.ui-state-active.fg-button-toggleable, .fg-buttonset-multi .ui-state-active') ){ $(this).removeClass("ui-state-active"); }
				else { $(this).addClass("ui-state-active"); }	
		})
		.mouseup(function(){
			if(! $(this).is('.fg-button-toggleable, .fg-buttonset-single .fg-button,  .fg-buttonset-multi .fg-button') ){
				$(this).removeClass("ui-state-active");
			}
	});
	
});


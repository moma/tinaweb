 


function Tinaviz(args) {

    var openDefaults = {
            success: function(){},
            error: function(msg){},
            view: "macro",
            url: ""
    };
                            
    var opts = {
        context: '',
        engine: 'software',
        branding: true,
        width: 0,
        height: 0
    };
    for (x in args) { opts[x] = args[x] };
    
    // PRIVATE MEMBERS
    var wrapper = null;
    var applet = null;
    var cbsAwait = {};
    var cbsRun = {};

    var callbackReady = function () {};
    var callbackImported = function(success) {};
    var callbackViewChanged = function(view) {};
  
    // PUBLIC MEMBERS
    this.isReady = 0;
    this.infodiv = {};

    this.height = opts.height;
    this.width = opts.width;
    this.tag = opts.tag;
    this.path = opts.path;
    this.engine = opts.engine;
    this.context = opts.context;
    this.branding= opts.branding;
    
    
    this.init= function() {
        wrapper = $("#tinaviz")[0]; // we need to get the html tag immediately
        if (wrapper == null) {
            alert("Error: couldn't get the applet!");
            return;
        }

        applet = wrapper;

        if (applet == null) {
            alert("Error: couldn't get the applet!");
            return;
        }
        this.applet = applet;
        callbackReady(this);
        this.isReady = 1;
     }

     this.ready=function(cb) {
        // TODO: if not ready, append to the callbacks
        // if ready, execute asynchronously
        
		callbackReady = cb;
	 }
	 
     this.open=function(args) {
        
        var opts = {};
        
        // initialize using default values
        for (x in openDefaults) { opts[x] = openDefaults[x]; };
        
        // overload using parameters values
        for (x in args) { opts[x] = args[x]; };
        
        if (args["url"] === undefined) {
          for (x in opts) { openDefaults[x] = opts[x]; };
        
        }
        
        var view = this.view(opts.view);

        callbackImported = function(msg){
            if (msg=="success") { opts.success(); } else { opts.error(msg); }
        };
                
        if (args["url"] === undefined) {
            return;
        }
        alert("loading "+args.url);
        $.ajax({
                url: opts.url,
                type: "GET",
                dataType: "text",
                error: function() { 
                    try {
                        if (opts.url.search("://") != -1) {
                            view.updateFromURI(opts.url);
                        } else {
                            var sPath = document.location.href;
                            view.updateFromURI(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url);
                        }
                    } catch (e) {
                        console.error("CATCHED JAVA ERROR "+e);
                        opts.error(e);
                    }
                 },
                success: function(gexf) {
                    var f = false;
                    console.log("success, calling updateFromString");
                    try {
                        view.updateFromString(gexf);
                    } catch (e) {
                        Console.error("CATCHED JAVA ERROR "+e);
                        f = true;
                    }
                    if (f) {
                        try {
                            if (opts.url.search("://") != -1) {
                                view.updateFromURI(opts.url);
                            } else {
                                var sPath = document.location.href;
                                view.updateFromURI(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url);
                            }
                        } catch (e) {
                            console.error("CATCHED JAVA ERROR "+e);
                            opts.error(e);
                        }
                    }

               }
         });
            
        
     }
     this.event=function(args) {
        var opts = {
            viewChanged: function(view){},
            categoryChanged: function(view){}
        };
        for (x in args) { opts[x] = args[x] };
   
        callbackViewChanged = opts.viewChanged;
        callbackCategoryChanged = opts.categoryChanged;
     }

     this.getHTML = function() {
            var path = this.path;
            var context = this.context;
            var engine = this.engine;

            var archives = path+'tinaviz-all.jar';
            
            var brand = "true";
            if (!this.branding) brand = "false";

            return '<!--[if !IE]> --> \
                            <object id="tinaviz" \
                                        classid="java:tinaviz.Main" \
                                        type="application/x-java-applet" \
                                        archive="'+archives+'" \
                                        width="1" height="1" \
                                        standby="Loading Tinaviz..." > \
 \
                              <param name="archive" value="'+archives+'" /> \
                              <param name="mayscript" value="true" /> \
                              <param name="scriptable" value="true" /> \
 \
                              <param name="image" value="css/branding/appletLoading.gif" /> \
                                <param name="boxmessage" value="Loading TinaViz..." /> \
                              <param name="boxbgcolor" value="#FFFFFF" /> \
                              <param name="progressbar" value="true" /> \
                              <!--<param name="noddraw.check" value="true">--> \
                                <param name="engine" value="'+engine+'" /> \
                                <param name="js_context" value="'+context+'" /> \
                                <param name="root_prefix" value="'+path+'" /> \
                                <param name="branding_icon" value="'+brand+'" /> \
                              <!--<![endif]--> \
 \
                              <object id="tinaviz" classid="clsid:CAFEEFAC-0016-0000-FFFF-ABCDEFFEDCBA" \
                                  width="1" height="1" \
                                  standby="Loading Processing software..."  > \
 \
                                <param name="code" value="tinaviz.Main" /> \
                                <param name="archive" value="'+archives+'" />\
                                <param name="mayscript" value="true" /> \
                                <param name="scriptable" value="true" /> \
 \
                              <param name="image" value="css/branding/appletLoading.gif" /> \
                                <param name="boxmessage" value="Loading TinaViz..." /> \
                                <param name="boxbgcolor" value="#FFFFFF" /> \
                                <param name="progressbar" value="true" /> \
                                <!--<param name="noddraw.check" value="true">--> \
                                <param name="engine" value="'+engine+'" /> \
                                <param name="js_context" value="'+context+'" />\
                                <param name="root_prefix" value="'+path+'" /> \
                                <param name="branding_icon" value="'+brand+'" /> \
                                <p>\
                                    <strong>\
                                        This browser does not have a Java Plug-in.\
                                        <br />\
                                        <a href="http://www.java.com/getjava" title="Download Java Plug-in">\
                                            Get the latest Java Plug-in here.\
                                        </a>\
                                    </strong>\
                                </p>\
\
                              </object>\
\
                              <!--[if !IE]> -->\
                            </object>\
                            <!--<![endif]-->';
        
        }
        
        /************************
         * Core applet methods
         *
         ************************/


        /*
         * Core method communicating with the applet
         */
        this.dispatchProperty= function(key,value) {
            if (applet == null) return;
            return applet.set("all",key,value);
        }

        /*
         * Core method communicating with the applet
         */
        this.set= function(view,key,value) {
            if (applet == null) return;
            return applet.set(view,key,value);
        }

        /*
         * Core method communicating with the applet
         */
        this.get= function(view,key) {
            if (applet == null) return;
            return applet.get(view,key);
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
        this.getViewName = function(view) {
            if (applet == null) return;
            return applet.getView().getName();
        }

        /*
         * Gets the the view level name
         */
        this.getViewName = function(view) {
            if (applet == null) return;
            return applet.getView().getName();
        }
        
        /*
         * Commits the applet's parameters
         * Accept an optional callback to give some reaction to events
         */
        this.touch= function(view) {
            if (applet == null) return;
            if (view===undefined) {
                applet.touch();
            } else {
                applet.touch(view);
            }
        }

        
        /*
         *  Adds a node to the current selection
         *  callback is boolean activating this.selected() callback
         */
        this.selectFromId = function(id, callback) {
            if (applet == null) return;
            return applet.selectFromId(id,callback);
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
                applet.selectFromId( decodeJSON( matchlist[i]['id'] ), true );
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
                //this.set("meso", "category/category", this.get(view, "category/category"));
            //}
        }

        /*
         *  Callback of double left clics
         */
        this.leftDoubleClicked = function(view, data) {
            var category = this.get("current", "category/category");
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
            //this.logNormal("selected");
            // always updates infodiv
            data = $.parseJSON(attr);
            this.infodiv.reset();
            var neighbours = this.infodiv.update(view, data);
   
            // left == selecteghbourd a node
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
        
        this.constructNewViewObject = function(viewName) {
            var view = this.view(viewName);
            
            var reply = {
                category: view.get("category/category"),
                nodes: []
            };
            
            reply.name = viewName;
            
            // we construct our new style "view" object
            
            for (node in view.getNodesArray()) {
                var n = { edges: [] };
                for (w in node.getWeightsArray()) {
                    n.edges.append({ weight: w });
                }
                reply["nodes"].append(n);
            }
            
            reply.get = function(arg) {
                return view.get(arg);
            };
            
            
            //console.dir(reply);
            
            return reply;
        }

        /**
        * Callback after CHANGING THE VIEW LEVEL
        */
        this.switchedTo = function(viewName, selected) {
            if (applet == null) return;

            var view = this.constructNewViewObject(viewName);
            callbackViewChanged(view);
        }
        

        /************************
         *
         * I/O system
         *
         ************************/

        // TODO: use a cross-browser compatible way of getting the current URL
        this.readGraphJava= function(view,url) {
            // window.location.href
            // window.location.pathname
            if (url.search("://") != -1) {
                applet.getSession().updateFromURI(view,url);
            } else {
                var sPath = document.location.href;
                var url = sPath.substring(0, sPath.lastIndexOf('/') + 1) + url;
                applet.getSession().updateFromURI(view,url);
            }P2D
            //$('#waitMessage').hide();
        }


        this.readGraphAJAX= function(view,graphURL) {
            if (applet == null) return;
            $.ajax({
                url: graphURL,
                type: "GET",
                dataType: "text",
                beforeSend: function() {},
                error: function() { this.readGraphJava(view, graphURL); },
                success: function(gexf) {
                    applet.getSession().updateFromString(view,gexf);
               }
            });
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
            return this.view().toggleLabels();
        }

        /*
         * hide/show nodes
         */
        this.toggleNodes = function() {
            if (applet == null) return;
            return this.view().toggleNodes();
        }

        /*
         * hide/show edges
         */
        this.toggleEdges = function() {
            if (applet == null) return;
            return this.view().toggleLinks();
        }

        /*
         * play/pause layout engine
         */
        this.togglePause = function() {
            if (applet == null) return;
            return this.view().togglePause();
        }

        /*
         * toggles HD rendering
         */
        this.toggleHD = function() {
            if (applet == null) return;
            return this.view().toggleHD();
        }
        /*
        * Get the opposite category name (the NOT DISPLAYED one)
        */
        this.getOppositeCategory = function(cat) {
            if (cat == "Document")
                return "NGram";
            else if (cat == "NGram")
                return "Document";
            //else alert("error, cannot get opposite category of "+cat);
            return "Document";
        }

        /**
         * Manually toggles the category
         */
        this.toggleCategory = function(view) {
            if (applet == null) return;
            

            if (this.getViewName()=="macro") {
                //console.log("infodiv neighbours:" + this.infodiv.neighbours);
                //console.dir(this.infodiv.neighbours);
                if (this.infodiv.neighbours !== undefined) {
                    //console.log("infodiv neighbours:" + this.infodiv.neighbours);
                    //console.dir(this.infodiv.neighbours);
                    // adds neighbours (from opposite categ) to the selection
                    if (this.infodiv.neighbours.length > 1) {
                        //console.log("infodiv neighbours:" + this.infodiv.neighbours);
                        //console.dir(this.infodiv.neighbours);
                        for(var i=0; i<this.infodiv.neighbours.length; i++) {
                            this.logNormal(neighbours[i].id);
                            if (i==this.infodiv.neighbours.length) {
                                //alert("selecting neighbour "+this.infodiv.neighbours[i].id);
                            	this.selectFromId(this.infodiv.neighbours[i].id, true);
                            } else {
                                //alert("toggleCategory 3!!");
                                this.selectFromId(this.infodiv.neighbours[i].id, false);
                            }
                        }  
                    } else if (this.infodiv.neighbours.length == 1) {
                        //alert("selecting single neighbour "+this.infodiv.neighbours[i].id);
                        this.selectFromId(this.infodiv.neighbours[0].id, true);
                    }
                }
            }
            // get and set the new category to display
            
            var next_cat = this.getOppositeCategory( this.get(view, "category/category") );
            this.set(view, "category/category", next_cat);
            // touch and centers the view
            this.touch();
            this.autoCentering();
            // updates the node list table
            this.updateNodes(view, next_cat);
        }

        /**
         * Manually toggles the view to meso given an id
         */
        this.viewMeso = function(id, category) {
            // selects unique node
            this.unselect();
            this.selectFromId(id, true);
            // sets the category of the graph
            this.set("meso", "category/category", category);
            //this.set("macro", "category/category", category);
            this.setView("meso");
            this.touch("meso");
            this.updateNodes("meso", category);
        }

        this.toggleView= function() {
            var current_cat = this.get("current","category/category");
            if (this.getViewName() == "macro") {
                // check if selection is empty
                if (Object.size(this.infodiv.selection) != 0) {
                    this.set("meso", "category/category", current_cat);
                    this.setView("meso");
                    this.updateNodes("meso", current_cat);
                } else {
                    alert("please first select some nodes before switching to meso level");
                }
            } else if (this.getViewName() == "meso") {
                this.set("macro", "category/category", current_cat);
                this.setView("macro");
                this.updateNodes("macro", current_cat);
            }
        }
        
        this.session=function() {
            return applet.session();
        }
        
        
        this.view=function(v) {
            return applet.view(v);
        }
        
        /*
        * Manually unselects all nodes
        */
        this.unselect= function() {
            if (applet == null) return;
            if (this.getViewName() == "meso") {
                applet.unselectCurrent();
            } else {
                applet.unselect();
            }


            this.infodiv.reset();
            //if (this.getViewName() == "meso") {
               // this.setView("macro");
                //tinaviz.resetLayoutCounter();
                
                //this.autoCentering();
            //}
            //this.touch("current"); // don't touch, so we do not redraw the graph
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
         this.size= function(width, height) {
            $('#tinaviz').css("height",""+(height)+"px");
            $('#tinaviz').css("width",""+(width)+"px");
            wrapper.height = height;
            wrapper.width = width;
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
         * Callback changing utton states
         */
        this.graphImportedCallback = function(msg) {
            callbackImported(msg);
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
    
        
 
    this.tag.html( this.getHTML() );
}


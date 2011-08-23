/*
    Copyright (C) 2009-2011 CREA Lab, CNRS/Ecole Polytechnique UMR 7656 (Fr)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */


function Tinaviz(args) {

    var openDefaults = {
        success: function(){},
        error: function(msg){},
        before: function(){},
        after: function(){},
        clear: true,
        view: "macro",
        url: "",
        layout: "tinaforce"
    };

    var cbCounter = 0;
    var callbacks = {};

    var opts = {
        context: "",
        path: "",
        engine: 'software',
        branding: true,
        pause: false,
        width: 800,
        height: 600
    };
    for (x in args) {
        opts[x] = args[x]
    }

    // PRIVATE MEMBERS
    var wrapper = null;
    var applet = null;
    var cbsAwait = {};
    var cbsRun = {};


    // PUBLIC MEMBERS
    this.toBeSelected = new Array();

    this.callbackReady = function () {};
    this.callbackBeforeImport = function() {};
    this.callbackImported = function(success) {};
    this.callbackViewChanged = function(view) {};
    this.callbackSelectionChanged = function(view) {};

    this.isReady = 0;
    this.infodiv = {};

    this.opts = opts;
    this.height = opts.height;
    this.width = opts.width;
    this.tag = opts.tag;
    this.path = opts.path;

    this.libPath = this.path + "js/tinaviz/";
    this.engine = opts.engine;
    this.context = opts.context;
    this.branding = opts.branding;

    /**
     * Called by the applet when it's ready
     *
     */
    this._initCallback = function() {
        if (this.xulrunner == true) {
            wrapper = $('#vizframe').contents().find("#tinaviz")[0];
        } else {
            wrapper = $("#tinaviz")[0];
        }
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

        this.setupDefaults();

        callbackReady(this);
        this.isReady = 1;
    }

    this.setupDefaults=function() {
        // setup defaults
        //this.set("pause",false, "Boolean");
    }
    this.ready=function(cb) {
        // TODO: if not ready, append to the callbacks
        // if ready, execute asynchronously

        callbackReady = cb;
    }
    this.getPath=function() {
        return this.path;
    }

    this.open=function(args) {

        var opts = {};

        // initialize using default values
        for (x in openDefaults) {
            opts[x] = openDefaults[x];
        }

        // overload using parameters values
        for (x in args) {
            opts[x] = args[x];
        }

        if (args["url"] === undefined) {
            for (x in opts) {
                openDefaults[x] = opts[x];
            }
        } else {

         if (args["url"] != "") {
             // we canced the loading if the URL is empty

        if (opts.layout) {
            this.set("layout.algorithm", opts.layout, "String")
        }
        callbackImported = function(msg){
            if (msg=="success") {
                opts.success();
            } else {
                opts.error(msg);
            }
        };

        callbackBeforeImport = opts.before;
        callbackBeforeImport();

        $.ajax({
            url: opts.url,
            type: "GET",
            dataType: "text", // if we use 'text', we need to disable cache
            cache: false, //
            error: function(e,f,g) {
                tinaviz.logNormal("AJAX error = "+e.statusText);

            /*
                try {
                    if (opts.url.search("://") != -1) {
                        tinaviz.logNormal("applet.openURI("+opts.url+", "+opts.clear+");");
                        applet.getView().openURI(opts.url, opts.clear);
                    } else {
                        var sPath = document.location.href;
                        tinaviz.logNormal("applet.openURI("+(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url)+", "+opts.clear+");");
                        applet.getView().openURI(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url, opts.clear);
                    }
                } catch (e) {
                    alert("Couldn't import graph: "+e);
                    opts.error(e);
                }
                 */
            },
            success: function(gexf) {

                // alert("success, calling updateFromString");
                   try {
                        if (opts.url.search("://") != -1) {
                            tinaviz.logNormal("applet.openURI("+opts.url+");");
                            applet.openURI(opts.url);
                        } else {
                            var sPath = document.location.href;
                            tinaviz.logNormal("applet.openURI("+(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url)+");");
                            applet.openURI(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url);
                        }
                    } catch (e) {
                        tinaviz.logError("Couldn't import graph: "+e);
                        opts.error(e);
                    }
            }
        });
         }
       }
    }


    this.event=function(args) {
        var opts = {
            viewChanged: function(view){},
            categoryChanged: function(view){},
            selectionChanged: function(selection){},
            getNeighbourhood: function(node_list, neighbours){}
        };
        for (x in args) {
            opts[x]=args[x]
        }
        this.callbackViewChanged = opts.viewChanged;
        this.callbackCategoryChanged = opts.categoryChanged;
        this.callbackSelectionChanged = opts.selectionChanged;
        this.callbackGetNeighbourhood = opts.getNeighbourhood;
    }

    this._setNeighbourhood = function(id,rawNeighbourhood) {
        //alert("got" +data.edges);
        console.log("_setNeighbourhood("+id+"): applet.setNeighbourhood("+id+", "+$.toJSON(rawNeighbourhood)+");")
        var jsonNeighbourhood = $.toJSON(rawNeighbourhood);
        if (jsonNeighbourhood == null | jsonNeighbourhood == undefined) {
            console.error("_setNeighbourhood("+id+"): invalid neigbourhood, "+rawNeighbourhood+" cannot be JSONified");
            jsonNeighbourhood = {};
        }
        applet.setNeighbourhood(id, jsonNeighbourhood);

    }
    this.askForNeighbours = function(dataset, id, category) {
        switch (category) {
            case 'Document':
                TinaService.getDocument(dataset, id, {
                    success: function(data, textStatus, XMLHttpRequest) {
                        tinaviz._setNeighbourhood(category+"::"+id, data.edges);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {

                    },
                    complete: function(XMLHttpRequest, textStatus) {

                    },
                    beforeSend: function() {
                    }
                }
                );
                break;
            case 'NGram':
                TinaService.getNGram(dataset, id, {
                    success: function(data, textStatus, XMLHttpRequest) {
                        tinaviz._setNeighbourhood(category+"::"+id, data.edges);
                    },
                    error: function(XMLHttpRequest, textStatus, errorThrown) {
                    },
                    complete: function(XMLHttpRequest, textStatus) {
                    },
                    beforeSend: function() {
                    }
                }
                );
                break;
        }
    }

    /*
     * Search nodes by label
     */
    this.getNodesByLabel = function(label, type) {
        if (label.length <3) return {};
        return $.parseJSON( applet.getNodesByLabel(label, type));
    }

    /*
     * Search and select nodes by a pattern
     */
    this.selectByPattern = function(pattern, patternMode) {
        if (pattern.length > 0 && pattern.length <3) return;
        applet.selectByPattern(pattern, patternMode);
    }

    /*
     * Search and select nodes
     */
    this.selectByNeighbourPattern = function(pattern, patternMode, category) {
        if (pattern.length > 0 && pattern.length <3) return;
        applet.selectByNeighbourPattern(pattern, patternMode, category);
    }

    /*
     * Search and highlight nodes
     */
    this.highlightByPattern = function(pattern, patternMode) {
        //if (pattern.length < 3) return;
        applet.highlightByPattern(pattern, patternMode);
    }

    //this.highlightNodes= function(label, type) {
    //    var matchlist = this.getNodesByLabel(label, type);
    //    for (var i = 0; i < matchlist.length; i++ ) {
    //        this.select(decodeJSON( matchlist[i]['id'] ) );
    //    }
    //}
    
    /*
     * Search and highlight nodes by their neighborhood
     */
    this.highlightByNeighbourPattern = function(pattern, patternMode) {
        //if (pattern.length < 3) return;
        applet.highlightByNeighbourPattern(pattern, patternMode);
    }

    //this.highlightNodes= function(label, type) {
    //    var matchlist = this.getNodesByLabel(label, type);
    //    for (var i = 0; i < matchlist.length; i++ ) {
    //        this.select(decodeJSON( matchlist[i]['id'] ) );
    //    }
    //}
    
    /*
     *  Gets attributes o a given node
     */
    this.getNodeAttributes = function(view,id) {
        if (applet == null) return {};
        return $.parseJSON(applet.getNodeAttributes(view,id));
    }

    // called by the applet
    this._callbackGetNeighbourhood = function(selection_list_str,neighbour_node_list_str) {
        // do some magic before calling the callback
        //alert("var selection_list = $.parseJSON("+selection_list_str+");");
        var selection_list = $.parseJSON(selection_list_str);
        //alert("var neighbour_node_list = $.parseJSON("+neighbour_node_list_str+");");
        var neighbour_node_list = $.parseJSON(neighbour_node_list_str);
        //alert("this.callbackGetNeighbourhood(selection_list, neighbour_node_list);");
        this.callbackGetNeighbourhood(selection_list, neighbour_node_list);
    }

    /*
     * Calls for the list of neighbours for a given node list
     * its callback is defined in this.event, called from main.js
     */
    this.getNeighbourhood = function(view, node_list) {
        applet.getNeighbourhood(view, $.toJSON( node_list ));
        // do not return.. this is a callback call
    }

    /*
     * Gets neighbours from TinaService using AJAX
     */
    this.getNeighboursFromDatabase = function(id) {
        var elem = id.split('::');
        TinaService.getNGrams(
            0, elem[1],
            {
                success: function(data) {
                }
            }
         );
    }

    /**
     * Callback after clicks on nodes
     *
     * @param selection
     * @param mouse
     * @return
     */
    this._callbackSelectionChanged = function(selection, mouse) {
        this.callbackSelectionChanged({
            'viewName':'macro',
            'data':$.parseJSON(selection),
            'mouseMode':mouse
        });
    }



/**
 * Todo put this outside of the Tinaviz object
 */
    this._callbackViewChanged = function(data) {
        var view = $.parseJSON(data);
        var cat = this.getCategory();

        this.infodiv.updateNodeList(view, cat);

        this.infodiv.display_current_category();
        this.infodiv.display_current_view();

         var level = $("#level");
         level.button('option','label', view + " level");
         var title = $("#infodiv > h3:first");

           // MACRO
           if (view == "macro") {
                if (cat=="Document") {
                     // disable
       $("#category-A").fadeIn();
       $("#category-B").fadeOut();
                 } else if (cat=="NGram") {
       $("#category-A").fadeOut();
       $("#category-B").fadeIn();
                }
                 level.removeClass("ui-state-highlight");
                 title.removeClass("ui-state-highlight");
            // MESO
            } else {
                   $("#category-A").fadeIn();
                   $("#category-B").fadeIn();
                 level.addClass("ui-state-highlight");
                 title.addClass("ui-state-highlight");
                 this.recenter();
            }


    }

    this.recenter = function() {
         this.set("camera.target", "all", "String");
    }
    this.centerOnSelection = function() {
         this.set("camera.target", "selection", "String");
    }
    this.setLayout = function(name) {
        this.set("layout.algorithm", name, "String");
    }

    // setters/getters/enablers/togglers for pausing (the layout animation)
    this.setPause = function(value) {
        this.set("pause", value, "Boolean");
    }
    this.getPause = function() {
        return this.get("pause");
    }
    this.pause = function() {
        this.setPause(true);
    }
    this.togglePause = function() {
        var n = !this.getPause();
        this.setPause(n);
        return n;
    }

    /**
    * Select a node from it's ID (String)
    * this can be a String or a String array (to select multiple nodes)
    */
    this.select = function(toBeSelected) {
        if ($.isArray(toBeSelected)) {
          this.set("select", toBeSelected, "Json");
        } else {
          this.set("select", toBeSelected, "String");
        }
    }

    /**
     * Manually unselect all nodes
     */
    this.unselect = function() {
         this.set("select", "", "String");
    }

    /**
     * Get the opposite category name (the NOT DISPLAYED one)
     */
    this.getOppositeCategory = function(cat) {
        if (cat == "Document")
            return "NGram";
        else if (cat == "NGram")
            return "Document";
        return "Document";
    }


    // get/set the current visualized category  (Document, NGram..)
    this.getCategory = function() { return this.get("filter.node.category"); }
    this.setCategory = function(value) { this.set("filter.node.category", value, "String"); }

    // get/set the current view (macro, meso)
    this.getView = function() { return this.get("filter.view"); }
    this.setView = function(view) { this.set("filter.view", view, "String"); }

    // toggle the current view (switch from macro to meso, or meso to macro)
    this.toggleView = function() {
        //toolbar.resetSlidersValues();
        if (this.getView() == "macro") {
            if (this.infodiv.selection.length != 0) {  // check if selection is empty
                this.setView("meso");
            } else {
                this.logError("You need to select a node before switching to meso view");
            }
        } else if (this.getView() == "meso") {
            this.setView("macro");
        }
    }

    // switch to the meso view of a particular node
    // you must specify the node's ID ans which kind of neighbourhood (Document, NGram) should be shown
    this.viewMeso = function(id, category) {
            var cat = tinaviz.getCategory();
            tinaviz.setView("macro");
            // we create by and an animation by specifying some delay between actions
            // not that pretty (we need some easing, eg. with Tween.js?) but it is functional (pun intended)
            $.doTimeout(150, function(){
                tinaviz.unselect(); // unselect nodes in current category
                $.doTimeout(150, function(){
                    //$.doTimeout( 400, function(){
                    tinaviz.setCategory(category);
                    $.doTimeout(150, function(){
                        tinaviz.unselect();  // unselect nodes in the desired category
                        $.doTimeout(600, function(){
                            tinaviz.select(id);
                            $.doTimeout(1300, function(){
                                tinaviz.setView("meso");
                                if (category != cat) tinaviz.infodiv.updateNodeList("meso", category);
                                // always enable
                                $("#category-A").fadeIn();
                                $("#category-B").fadeIn();
                                //this.infoviz.updateNodeList("meso", category);
                                tinaviz.recenter();
                                false;
                            });
                            false;
                        });
                        false;
                    });
                    false;
                });
                false;
            });
    }


    // Retrieves the list of all nodes.  Usage: var nodes = tinaviz.getNodes("macro", "NGram")
    this.getNodes = function(view, category) { return $.parseJSON( applet.getNodes(view, category) );  }

    // resize the applet
    this.size = function(width, height) {
        if (wrapper == null || applet == null) return;
        $('#tinaviz').css("height",""+(height)+"px");
        $('#tinaviz').css("width",""+(width)+"px");
        wrapper.height = height;
        wrapper.width = width;
        applet.resize(width, height);
    }

    // TODO CHECK IF OBSOLETE?
    // Callback to update a button's state
    this._buttonStateCallback = function(button, enabled) {
        toolbar.updateButton(button, enabled);
    }


    // Called by the applet when a graph is imported. Then we call the USER-defined graph imported callback
    this._graphImportedCallback = function(msg) { callbackImported($.parseJSON(msg)); }

    // Call a callback using its callback_id, and pass on some result data
    this.callCb = function(id,data) { $.doTimeout(500, function() { callbacks[id]($.parseJSON(data)); }); }

    /*
     * Create a new callback, and store it in "callbacks" table
     * the callback will have some unique id, which is returned
     *
     * example:  tinaviz.makeCb("getCoolStuffFromTheApplet", function(data) {})
     */
    this.makeCb = function(key,cb) {
        ++cbCounter;
        var id = "" + cbCounter;
        callbacks[id] = cb;
        applet.getWithCb(id, key);
    }

    // Synchronously get a value from the applet. The applet acts as a key-value store
    this.get = function(key) { return applet.get(key); }

    /**
     * Asynchronously set a value to all views
     *
     * The type "t" (latest parameter) of the value is optional, but can be specified
     * with one of these values:
     * "String" (eg. "hello")
     * "Int" (eg. 0)
     * "Double" (eg. 1.0)
     * "Float" (eg. 1.0f)
     * "Boolean" (eg. 1, 0, true, false)
     */
    this.set = function(key, obj, t) {
        this.logDebug("tinaviz.set: "+key+" -> "+obj+" ("+t+")");
        if (t === undefined) {
            this.logDebug("tinaviz.set: Warning, setting a value ("+key+","+obj+") without type!");
            applet.send(key, obj, "");
        } else {
           if (t.indexOf("Tuple2") != -1) {
              if (t.indexOf("[Double]") != -1) {
                  applet.sendTuple2(key, obj[0], obj[1], "Double");
              } else if (t.indexOf("[Int]") != -1) {
                  applet.sendTuple2(key, obj[0], obj[1], "Int");
              } else if (t.indexOf("[Float]") != -1) {
                  applet.sendTuple2(key, obj[0], obj[1], "Float");
              } else {
                  applet.sendTuple2(key, obj[0], obj[1], "");
              }
           } else if (t=="Json") {
             applet.send(key,$.toJSON(obj), t);
           } else {
              this.logDebug("tinaviz.set: Warning, setting a value ("+key+","+obj+") with unknown type!");
              applet.send(key, obj, t);
           }
        }
    }

    // Log an information message to the console
    this.logNormal = function(msg) { try { console.log(msg); } catch (e){ return; } };

    // Log a debug message to the console
    this.logDebug = function(msg) { try { console.log(msg); } catch (e){ return; } };

    // Log an error message to the screen
    this.logError = function(msg) { try { console.error(msg); } catch (e){ alert(msg); return; } };

    /**
     * Generate the HTML tag to embed the applet in the webpage
     */
    this.getHTML = function() {
        var path = this.libPath;
        var context = this.context;
        var engine = this.engine;
        var w = this.width;
        var h = this.height;

        var brand = "true";
        if (this.branding == false) brand = "false";

        // WARNING - TRAP HERE
        // deployJava.js writes the HTML somewhere on the current page (sigh).
        // since that's not what we want (we want to manipulate the HTLM and put it at a specific place) we hack the DOM
        // to temporary store any call to document.write( .. ) in a buffer, then we return the buffer and restore the
        // old write function
        var buff = '';
        var func = document.write;
        document.write = function(arg){
            buff += arg;
        }

        // we use the Java Applet Tag generator script (deployJava.js) provided by (RIP) Sun Microsystems
        var res = deployJava.writeAppletTag(
        // deployJava.js parameters
        {
            id: "tinaviz",                            // HTML tag ID
            code: 'eu.tinasoft.tinaviz.Main.class',   // the Java class
            archive: path+'tinaviz-2.0-SNAPSHOT.jar', // the JAR archive (better as absolute URL, it seems)
            width: w,                                 // applet width
            height: h,                                // applet height
            image: 'css/branding/appletLoading.gif',  // waiting page, actually just a picture, while Java is loading
            standby: "Loading Tinaviz..."             // waiting message
        },
        // tinaviz applet parameters
        {
            engine: engine,                           // 2D/3D engine to use (can cause issues, I disabled it)
            js_context: context,                      // Javascript context path (DOM hierarchy). very, *very* important
            root_prefix: path,                        // path to the webpage (eg. http://www.mysite.com/page/)
            branding_icon: brand,                     // do we brand it or not?
            progressbar: false,                       // do we show the built-in Java loading bar?
            boxbgcolor: "#FFFFFF",                    // background color of the waiting panel
            boxmessage: "Loading Tinaviz...",         // message of the waiting panel (wtf, there are two..?)
            image: "css/branding/appletLoading.gif",  // image of the waiting panel (wtf, need to be set twice..?)
            mayscript: true,                          // can the applet interact with JS? OF COURSE you will set to True
            scriptable: true                          // like mayscript. maybe there are two params to indicate which
        });                                           // side (page or applet) is allowed to control the other?
        document.write = func; // we remove the DOM hack, to restore the original write function
        return buff; // we return the "catched" HTML content. we're done.
    }

    /**
     * Basically, calling Tinaviz() will create a new applet instance by injecting the HTML tag in the page
     *
     */
    this.tag.html( this.getHTML() );
}

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
    this.toBeSelected = new Array();

    this.callbackReady = function () {};
    this.callbackBeforeImport = function() {};
    this.callbackImported = function(success) {};
    this.callbackViewChanged = function(view) {};
    this.callbackSelectionChanged = function(view) {};

    // PUBLIC MEMBERS
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
    this.iframeFileName = "iframe.html";

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
        this.set("pause",false);
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
        }

        if (opts.layout) {
            this.set("layout.algorithm", opts.layout)
        }
        callbackImported = function(msg){
            if (msg=="success") {
                opts.success();
            } else {
                opts.error(msg);
            }
        };

        if (args["url"] === undefined) {
            return;
        }

        callbackBeforeImport = opts.before;
        callbackBeforeImport();

        $.ajax({
            url: opts.url,
            type: "GET",
            dataType: "text", // if we use 'text', we need to disable cache
            cache: "false", //
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
                var f = false;
                // alert("success, calling updateFromString");
                try {
                    tinaviz.logNormal("view.openString(..)");
                    applet.openString(gexf);
                } catch (e) {
                    tinaviz.logNormal("Couldn't load graph using openString, trying with openURI..");
                    f = true;
                }
                if (f) {
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

            }
        });


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
     * Search nodes
     */
    this.getNodesByLabel = function(label, type) {
        if (label.length < 3) return {};
        return $.parseJSON( applet.getNodesByLabel(label, type));
    }

    /*
     * Search and select nodes
     * viewToSearch: visualization,macro,meso,current
     */
    this.searchNodes= function(matchLabel, matchCategory,  matchType, viewToSearch, center) {
        if (matchLabel.length < 3) return;
        applet.selectNodesByLabel(matchLabel, matchCategory, matchType, viewToSearch, center);
    }


    /*
     * Highlight nodes
     */
    this.highlightNodes= function(label, type) {
        var matchlist = this.getNodesByLabel(label, type);
        for (var i = 0; i < matchlist.length; i++ ) {
            this.select(decodeJSON( matchlist[i]['id'] ) );
        }
    }

    /*
     *  Gets attributes o a given node
     */
    this.getNodeAttributes = function(view,id) {
        if (applet == null) return {};
        return $.parseJSON(
            applet.getNodeAttributes(view,id)
            );
    }

    // called by the applet
    this._callbackGetNeighbourhood = function(selection_list_str,neighbour_node_list_str) {
        // do some magic before calling the callback
        var selection_list = $.parseJSON(selection_list_str);
        var neighbour_node_list = $.parseJSON(neighbour_node_list_str);
        this.callbackGetNeighbourhood(selection_list, neighbour_node_list);
    }

    /*
     * Calls for the list of neighbours for a given node list
     * its callback is defined in this.event, called from main.js
     */
    this.getNeighbourhood = function(view, node_list) {
        applet.getNeighbourhood(view, $.toJSON( node_list ));
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
     * @param view
     * @param attr
     * @param mouse
     * @return
     */
    this._callbackSelectionChanged = function(selection, mouse) {
        //console.log("_callbackSelectionChanged : "+ attr);

        this.callbackSelectionChanged({
            'viewName':'macro',
            'data':$.parseJSON(selection),
            'mouseMode':mouse
        })
    }


    /**
     * Callback after CHANGING THE VIEW LEVEL
     */
    this._callbackViewChanged = function(viewName, selected) {
        var view = this.constructNewViewObject(viewName);
        this.callbackViewChanged(view);
    }


    this.recenter = function() {
        this.set("recenter",true, "Boolean");
    }
    this.setLayout = function(name) {
        this.set("layout.algorithm", name, "String");
    }
    this.setPause = function(value) {
        this.set("pause",value, "Boolean");
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
      */

    this.select = function(uuid) {
          applet.set("select", uuid, "String");
    }

    /**
     * Manually unselect all nodes
     */
    this.unselect = function() {
        this.select("");
        this.infodiv.reset();
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


    this.getCategory = function() {
        return this.get("filter.node.category");
    }

    this.setCategory = function(value) {
        this.set("filter.node.category", value, "String");
    }

    /**
     * Get the current view: eg. "macro", "meso"..
     *
     */
    this.getView = function() {
        return this.get("filter.view");
    }

    /**
     * Set the current view. Will force the applet
     * to show the new corresponding graph
     * argument:
     *  - view: String. eg. "macro", "meso"..
     *
     */
    this.setView = function(view) {
        this.set("filter.view", view, "String");
    }

    /**
     * Manual toggle of the current view (Eg. when button is pressed)
     *
     */
    this.toggleView = function() {
        if (this.getView() == "macro") {
            // check if selection is empty
            if (this.infodiv.selection.length != 0) {
                this.setView("meso");
            this.infodiv.updateNodeList("meso", this.getCategory());
            } else {
                alert("You need to select a node before switching to meso view");
            }
        } else if (this.getView() == "meso") {
            this.setView("macro");
            this.infodiv.updateNodeList("macro", this.getCategory());
        }
    }

    /**
     * Switch to meso view of a particular node
     * arguments:
     *   - id: String
     *   - category: String
     */
    this.viewMeso = function(id, category) {
        // selects unique node
        this.unselect();
        this.select(id);
        // sets the category of the graph
        this.setCategory(category);
        //this.set("macro", "filter.node.category", category);
        this.setView("meso");
        //this.infoviz.updateNodeList("meso", category);
    }



    /**
     *  Retrieves list of all nodes
     *
     *  Usage:
     *  nodes = tinaviz.getNodes("macro", "NGram")
     */
    this.getNodes = function(view, category) {
        var nodes = applet.getNodes(view, category);
        return $.parseJSON( nodes );
    }

    /**
     * Dynamic div width
     */
    this.size = function(width, height) {
        if (wrapper == null || applet == null) return;
        $('#tinaviz').css("height",""+(height)+"px");
        $('#tinaviz').css("width",""+(width)+"px");
        wrapper.height = height;
        wrapper.width = width;
    }

    /**
     * Callback changing button states
     */
    this._buttonStateCallback = function(button, enabled) {
        toolbar.updateButton(button, enabled);
    }

    /**
     * Callback changing utton states
     */
    this._graphImportedCallback = function(msg) {
        callbackImported(msg);
    }


    this.callCb = function(id,data) {
        $.doTimeout( 1000, function() {
            callbacks[id]($.parseJSON(data))
        });

    }

    // call with:  makeCb("test.tina", function(data) {})
    this.makeCb = function(key,cb) {
        ++cbCounter;
        var id = "" + cbCounter;
        callbacks[id] = cb;
        applet.getWithCb(id, key);
    }

        /**
     * Core method communicating with the applet
     */
    this.get = function(key) {
        return applet.get(key);
    }

    /**
     * Set a value to all views
     * Argument "t" is optional. But if given, must be a string with one of these values:
     * "String"
     * "Int"
     * "Double"
     * "Float"
     * "Boolean" : 1, 0, true, false
     */

    this.set = function(key, obj, t) {
         //alert("key:"+key+" obj: "+obj);
        if (t === undefined) {
            this.logNormal("set("+key+","+obj+")");
            applet.set(key,obj);
        } else {
           if (t=="json") {
           applet.setAs(key,$.toJSON(obj), t);
           } else {
           this.logNormal("setAs("+key+","+obj+","+t+")");
           applet.setAs(key, obj, t);
           }
        }
    }

    /**
     * Set a value, to be converted to a Scala type


    //this.set = function(key, json) {
    //    applet.msgNoCb(key,$.toJSON(json));
    //}

    /**
     * Called by the applet
     */
    this.logNormal = function(msg) {
        try {
            console.log(msg);
        }
        catch (e){
            return;
        }
    };

    /**
     * Called by the applet
     */
    this.logDebug = function(msg) {
        try {
            console.log(msg);
        }
        catch (e){
            return;
        }
    };

    /**
     * Called by the applet
     */
    this.logError = function(msg) {
        try {
            console.error(msg);
        }
        catch (e){
            alert(msg);
            return;
        }
    };

    this.getHTML = function() {
        var path = this.libPath;
        var context = this.context;
        var engine = this.engine;
        var w = this.width;
        var h = this.height;

        var brand = "true";
        if (this.branding == false) brand = "false";


        var buff = '';
        var func = document.write;
        document.write = function(arg){
            buff += arg;
        }
        var res = deployJava.writeAppletTag({
            id: "tinaviz",
            code: 'eu.tinasoft.tinaviz.Main.class',
            archive: path+'tinaviz-2.0-SNAPSHOT.jar',
            width: w,
            height: h,
            image: 'css/branding/appletLoading.gif',
            standby: "Loading Tinaviz..."
        }, {
            engine: engine,
            js_context: context,
            root_prefix: path,
            branding_icon: brand,
            progressbar: false,
            boxbgcolor: "#FFFFFF",
            boxmessage: "Loading Tinaviz...",
            image: "css/branding/appletLoading.gif",
            mayscript: true,
            scriptable: true
        });
        document.write = func;
        return buff;
    }
    this.tag.html( this.getHTML() );
}

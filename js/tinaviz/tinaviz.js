
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

    var opts = {
        context: "",
        path: "",
        engine: 'software',
        branding: true,
        pause: false,
        width: 0,
        height: 0
    };
    for (x in args) {
        opts[x] = args[x]
    }
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

    this.views = {
        current: {
            name: function() {
                return applet.getView().getName();
            },

            // TODO put current viz manipulation methods here
            set: function(key,value,x) {
                if (x===undefined || x==null) {
                    applet.getView().set(key, value, true);
                } else {
                    applet.getView().set(key, value, x);
                }
            },
            get: function(key) {
                //alert("get current "+key);
                return applet.getView().get(key);
            },

            category: function(x) {
                if (x===undefined || x==null) {
                    return applet.getView().getString("category/category");
                } else {
                    applet.getView().set("category/category", x, true);
                }
            },
            filter: function(x,y) {
                applet.getView().filter(x,y);
            },

            categories: {
                Document: {
                    layout: {
                        iter: 0
                    // TODO
                    // put other layout parameters here
                    }
                },
                NGram: {
                    layout: {
                        iter: 0
                    // TODO
                    // put other layout parameters here
                    }
                }
            }
        },
        macro: {
            name: function() {
                return 'macro';
            },

            // setters/getters used for communication with the applet
            set: function(key,value,x) {
                if (x===undefined || x==null) {
                    applet.getView("macro").set(key, value,true);
                } else {
                    applet.getView("macro").set(key, value,x);
                }
            },

            get: function(key) {
                return applet.getView('macro').get(key);
            },

            category: function(x) {
                if (x===undefined || x==null) {
                    return applet.getView('macro').getString("category/category");
                } else {
                    applet.getView('macro').set("category/category", x, true);
                }
            },
            selection: new Array(),

            categories: {
                Document: {
                    layout: {
                        iter: 0
                    // TODO
                    // put other layout parameters here
                    }
                },
                NGram: {
                    layout: {
                        iter: 0
                    // TODO
                    // put other layout parameters here
                    }
                }
            },

            filter: function(x,y) {
                applet.getView('macro').filter(x,y);
            }
        },
        meso: {
            name: function() {
                return 'meso';
            },

            // setters/getters used for communication with the applet
            set: function(key,value,x) {
                if (x===undefined || x==null) {
                    applet.getView("meso").set(key, value,true);
                } else {
                    applet.getView("meso").set(key, value,x);
                }
            },
            get: function(key) {
                return applet.getView('meso').get(key);
            },

            category: function(x) {
                if (x===undefined || x==null) {
                    return applet.getView('meso').getString("category/category");
                } else {
                    applet.getView('meso').set("category/category", x, true);
                }
            },

            selection: new Array(),

            categories: {
                Document: {
                    layout: {
                        iter: 0
                    // TODO
                    // put other layout parameters here
                    }
                },
                NGram: {
                    layout: {
                        iter: 0
                    // TODO
                    // put other layout parameters here
                    }
                }
            },
            filter: function(x,y) {
                applet.getView('meso').filter(x,y);
            }
        }
    };

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

    this.init= function() {
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
        this.setPause(opts.pause);
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

        if (opts.clear) {
            this.views.current.set("layout/iter", 0);
        //applet.clear();
        }

        if (opts.layout) {
            this.views.current.set("layout/name", opts.layout)
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

        //alert("loading "+args.url);
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
                        tinaviz.logNormal("applet.getView().openURI("+opts.url+", "+opts.clear+");");
                        applet.getView().openURI(opts.url, opts.clear);
                    } else {
                        var sPath = document.location.href;
                        tinaviz.logNormal("applet.getView().openURI("+(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url)+", "+opts.clear+");");
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
                    tinaviz.logNormal("view.openString(.., "+opts.clear+")");
                    applet.getView().openString(gexf, opts.clear);
                } catch (e) {
                    tinaviz.logNormal("Couldn't load graph using openString, trying with openURI..");
                    f = true;
                }
                if (f) {
                    try {
                        if (opts.url.search("://") != -1) {
                            tinaviz.logNormal("applet.getView().openURI("+opts.url+", "+opts.clear+");");
                            applet.getView().openURI(opts.url, opts.clear);
                        } else {
                            var sPath = document.location.href;
                            tinaviz.logNormal("applet.getView().openURI("+(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url)+", "+opts.clear+");");
                            applet.getView().openURI(sPath.substring(0, sPath.lastIndexOf('/') + 1) + opts.url, opts.clear);
                        }
                    } catch (e) {
                        tinaviz.logError("Couldn't import graph: "+e);
                        opts.error(e);
                    }
                }

            }
        });


    }

    this.setLayout = function(name) {
        this.set("layout/name", name);
    }

    this.event = function(args) {
        var opts = {
            viewChanged: function(view){},
            categoryChanged: function(view){},
            selectionChanged: function(selection){}
        };
        for (x in args) {
            opts[x]=args[x]
        }

        this.callbackViewChanged = opts.viewChanged;
        this.callbackCategoryChanged = opts.categoryChanged;
        this.callbackSelectionChanged = opts.selectionChanged;
    }

    /*
     * Core method communicating with the applet
     */
    this.get = function(key) {
        return applet.getView().get(key);
    }

    /*
     * Set a value to all views
     */
    this.set = function(key,value, sync) {

        if (sync===undefined || sync==null) {
            applet.setParam(key,value, false);
        } else {
            applet.setParam(key,value, true);
        }

    }

    /*
     * Commands switching between view levels
     */
    this.setView = function(view) {
        applet.setView(view);
    }

    /*
     * called by the applet to fill the graph
     */
    this.askForNeighbours = function(dataset, id, category) {
        switch (category) {
            case 'Document':
                TinaService.getDocument(dataset, id, {
                    success: function(data, textStatus, XMLHttpRequest) {
                        //alert("got" +data.edges);
                        applet.setNeighbourhood(category+"::"+id, $.toJSON(data.edges));
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
                        applet.setNeighbourhood(category+"::"+id, $.toJSON(data.edges));
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
     *  Adds a node to the current selection
     *  callback is boolean activating this.selected() callback
     */
    this.selectFromId = function(id, callback) {
        if (id===undefined) return;
        applet.selectFromUUID(id,callback);
    }

    this.resetLayoutCounter= function(view) {
        this.views[view].set("layout/iter",0,false);
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
    this.setEnabled = function(value) {
        applet.setEnabled(value);
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
            applet.highlightFromId( decodeJSON( matchlist[i]['id'] ) );
        // todo: auto center!!
        //applet.
        }
    }


    /*
    * recenter the graph
    */
    this.autoCentering= function() {
        applet.autoCentering();
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

    /*
     * Gets the list of neighbours for a given node
     */
    this.getNeighbourhood = function(view,id) {
        return $.parseJSON( applet.getNeighbourhood(view,id) );
    }

    this.getNeighboursFromDatabase = function(id) {
        var elem = id.split('::');

        TinaService.getNGrams(
            0,
            elem[1],
            {
                success: function(data) {
                }
            }
        );
    }

    /**
     * Callback for clicks on nodes
     *
     * @param view
     * @param attr
     * @param mouse
     * @return
     */
    this.selected = function(view, attr, mouse) {

        var data = $.parseJSON(attr);

        this.callbackSelectionChanged({
            'viewName':view,
            'data':data,
            'mouseMode':mouse
        })
    }

    this.constructNewViewObject = function(viewName) {
        var view = this.views[viewName];

        var reply = {
            layoutCounter: 0,
            category: view.get("category/category"),
            nodes: new Array()
        };

        reply.name = viewName;

        // we add some additionnal steps
        // to be compatible with old LiveConnect
        // implementations

        var i = 0;

        /*
        var nodesArray = view.getNodesArray();
        for (i=0;i < nodesArray.length;i++) {
            node = nodesArray[i];
            var n = {
                edges: new Array()
            };
            console.log("creating the reply:"+node);
            console.dir(node);
            if (node===undefined) {
                console.log("node was undefined");
            } else {
            var edgesArray = node.getWeightsArray();
                var j = 0;
                for (j=0;edgesArray.length;j++) {
                    n.edges.push({
                        weight: edgesArray[j]
                    });
                }
            }
            reply.nodes.push(n);
        }
         */

        reply.get = function(arg) {
            return view.get(arg);
        };

        return reply;
    }

    /*
    * Callback after CHANGING THE VIEW LEVEL
    */
    this.switchedTo = function(viewName, selected) {
        var view = this.constructNewViewObject(viewName);
        this.callbackViewChanged(view);
    }


    this.toggleLabels = function() {
        return applet.getView().toggleLabels();
    }

    /*
     * hide/show nodes
     */
    this.toggleNodes = function() {
        return applet.getView().toggleNodes();
    }

    /*
     * hide/show edges
     */
    this.toggleEdges = function() {
        return applet.getView().toggleLinks();
    }

    /*
     * play/pause layout engine
     */
    this.togglePause = function() {
        return applet.getView().togglePause();
    }

    this.setPause = function(value) {
        applet.getView().setPause(value);
    }

    /*
     * toggles HD rendering
     */
    this.toggleHD = function() {
        return applet.getView().toggleHD();
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

    /*
     * Manually toggles the view to meso given an id
     */
    this.viewMeso = function(id, category) {
        // selects unique node
        //logNormal("calling viewMeso("+id+","+category+")");
        this.unselect();
        this.selectFromId(id, true);
        // sets the category of the graph
        this.views.meso.set("category/category", category);
        //this.set("macro", "category/category", category);
        this.setView("meso");
        this.updateNodes("meso", category);
    }

    this.getCategory= function() {
        return this.get("category/category");
    }

    this.setCategory= function(value) {
        this.set("category/category", value,false);
    }

    this.toggleView= function() {
        var current_cat = this.getCategory();
        if (this.views.current.name() == "macro") {
            // check if selection is empty
            if (Object.size(this.infodiv.selection) != 0) {
                this.views.meso.set("category/category", current_cat, false);
                this.setView("meso");
                this.updateNodes("meso", current_cat);
            } else {
                alert("please first select some nodes before switching to meso level");
            }
        } else if (this.views.current.name() == "meso") {
            this.views.macro.set("category/category", current_cat, false);
            this.setView("macro");
            this.updateNodes("macro", current_cat);
        }
    }

    this.session=function() {
        return applet.getSession();
    }

    this.getView=function(view) {
        if (applet == null) return;
        if (view===undefined) {
            applet.getView();
        } else {
            applet.getView(view);
        }
    }

    /*
     * Manually unselects all nodes
     */
    this.unselect= function() {
        applet.unselect();
        this.infodiv.reset();
    }

    /*
     * Retrieves list of nodes
     *  nodes = tinaviz.getNodes("macro", "NGram")
     */
    this.getNodes = function(view, category) {
        this.infodiv.data[category] = $.parseJSON( applet.getNodes(view, category) );
        return this.infodiv.data[category];
    }

    /*
     *  Fires the update of node list cache and display
     */
    this.updateNodes = function(view, category)  {
        if ( category == this.infodiv.last_category ) return;
        this.infodiv.display_current_category();
        if (this.infodiv.data[category] === undefined || this.infodiv.data[category].length == 0)
            this.infodiv.updateNodeList( this.getNodes( view, category ), category );
        else
            this.infodiv.updateNodeList( this.infodiv.data[category], category );
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
        if (wrapper == null || applet == null) return;
        $('#tinaviz').css("height",""+(height)+"px");
        $('#tinaviz').css("width",""+(width)+"px");
        wrapper.height = height;
        wrapper.width = width;
    }

    /*
     * Callback changing button states
     */
    this.buttonStateCallback = function(button, enabled) {
        toolbar.updateButton(button, enabled);
    }

    /*
     * Callback changing utton states
     */
    this.graphImportedCallback = function(msg) {
        callbackImported(msg);
    }

    this.getHTML = function() {
        var path = this.libPath;
        var context = this.context;
        var engine = this.engine;

        var brand = "true";
        if (this.branding == false) brand = "false";


        var buff = '';
        var func = document.write;
        document.write = function(arg){
            buff += arg;
        }
        var res = deployJava.writeAppletTag({
            id: "tinaviz",
            code: 'tinaviz.Main.class',
            archive: path+'tinaviz-all.jar',
            width: 10,
            height: 10,
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


/*
 JQUERY TINAVIZ PLUGIN - FOR NEXT VERSION OF TINAVIZ

(function($){
 $.fn.truncate = function() {
    tinaviz = new Tinaviz();
    this.tag.html( tinaviz.getHTML() );
    return tinaviz;
 };
})(jQuery);

 */

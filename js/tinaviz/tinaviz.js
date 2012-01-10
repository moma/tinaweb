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

var cblatency = 100;
var cbCounter = 0;
var callbacks = {};

// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function(){
      return  window.requestAnimationFrame       ||
              window.webkitRequestAnimationFrame ||
              window.mozRequestAnimationFrame    ||
              window.oRequestAnimationFrame      ||
              window.msRequestAnimationFrame     ||
              function(callback){
                window.setTimeout(callback, 1000 / 24);
              };
})();


$(window).focus(function() {
    tinaviz.unfreeze();
});

$(window).blur(function() {
    tinaviz.freeze();
});

var callCallback = function(cb_id, cb_args) {
        var cb = callbacks[cb_id];
        //console.log("calling callback "+cb_id+" with delay "+cblatency);
        $.doTimeout(cblatency, function() {
            var args = $.parseJSON(cb_args);

            // show the content of the cb
            //console.log(args);

            cb(args);
        });
        //delete callbacks[cb_id];
    }

var makeCallback = function(cb) {
        if (cb === undefined) cb = function() {};
        var id = cbCounter++;
        //console.log("made callback "+id);
        callbacks[id] = cb;
        return ""+id;// applet will convert it anyway
}

function Tinaviz(args) {

    var opts = {
        context: "",
        path: "",
        engine: 'software',
        brandingIcon: "",
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

    this.toBeSelected = new Array();

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
    this.brandingIcon = this.libPath + "tina_icon.png";

    this.getPath=function() {
        return this.path;
    }

    this.open=function(url, cb) {
        console.log("url : "+url);
        if (url.search("://") == -1)
            url = document.location.href.substring(0, document.location.href.lastIndexOf('/') + 1) + url;

        tinaviz.logNormal("applet.openURI("+url+");");
        try {
           applet.openURI(makeCallback(cb), url);
        } catch (e) {
           tinaviz.logError("Couldn't import graph: "+e);
           cb({"success":false,"error":e});
        }
     }

/*
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
    */
    /*
    this.askForNeighbours = function(dataset, id, category) {
    	if (TinaService === undefined) {
    		console.log("askForNeighbours disabled: TinaService.getDocument unavailable");
    		return;
    	}
    	
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
     */

    /*
     * Search nodes
     */
    this.getNodesByLabel = function(label, type, cb) {
        if (label.length < 3) cb({});
        applet.getNodesByLabel(makeCallback(cb), label, type);
    }

    /*
     * Search and select nodes
     */
    this.selectByPattern = function(pattern, patternMode, cb) {
        if (pattern.length > 0 && pattern.length < 3) return;
        applet.selectByPattern(makeCallback(cb), pattern, patternMode);
    }

    /*
     * Search and select nodes
     */
    this.selectByNeighbourPattern = function(pattern, patternMode, category, cb) {
        if (pattern.length > 0 && pattern.length < 3) return;
        applet.selectByNeighbourPattern(makeCallback(cb), pattern, patternMode, category);
    }

    /*
     * Search and highlight nodes
     */
    this.highlightByPattern = function(pattern, patternMode, cb) {
        //if (pattern.length < 3) return;
        applet.highlightByPattern(makeCallback(cb), pattern, patternMode);
    }


    /*
     * Search and highlight nodes by their neighborhood
     */
    this.highlightByNeighbourPattern = function(pattern, patternMode, cb) {
        //if (pattern.length < 3) return;
        applet.highlightByNeighbourPattern(makeCallback(cb), pattern, patternMode);
    }

    
    /*
     *  Gets attributes o a given node
     */
    this.getNodeAttributes = function(view, id, cb) {
        applet.getNodeAttributes(makeCallback(cb), view, id);
    }

    /*
     * Calls for the list of neighbours for a given node list
     * its callback is defined in this.event, called from main.js
     */
    this.getNeighbourhood = function(view, node_list, cb) {
        applet.getNeighbourhood(makeCallback(cb), view, $.toJSON( node_list ));
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

    this.recenter = function(cb) {
         this.set("camera.target", "all", "String", cb);
    }
    this.centerOnSelection = function(cb) {
         this.set("camera.target", "selection", "String", cb);
    }
    this.setLayout = function(name, cb) {
        this.set("layout.algorithm", name, "String", cb);
    }
    this.setPause = function(value, cb) {
        this.set("pause", value, "Boolean", cb);
    }
    this.getPause = function(cb) {
        this.get("pause", cb);
    }
    this.pause = function(cb) {
        this.setPause(true, cb);
    }
    this.togglePause = function(cb) {
        this.getPause(function(value) {
            tinaviz.setPause(!value, cb);
        });
    }

    /**
    * Select a node from it's ID (String)
    * this can be a String or a String array (to select multiple nodes)
    */
    this.select = function(toBeSelected, cb) {
        if ($.isArray(toBeSelected)) {
          this.set("select", toBeSelected, "Json", cb);
        } else {
          this.set("select", toBeSelected, "String", cb);
        }
    }

    /**
     * Manually unselect all nodes
     */
    this.unselect = function(cb) {
         this.set("select", "", "String", cb);
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


    this.getCategory = function(cb) {
        this.get("filter.node.category", cb);
    }

    this.setCategory = function(value, cb) {
         this.set("filter.node.category", value, "String", cb);
    }

    this.freeze = function() {
        if (applet !== undefined && applet != null) applet.freeze();
    }

    this.unfreeze = function() {
        if (applet !== undefined && applet != null) applet.unfreeze();
    }


    /**
     * Get the current view: eg. "macro", "meso"..
     *
     */
    this.getView = function(cb) {
        this.get("filter.view",cb);
    }

    /**
     * Set the current view. Will force the applet
     * to show the new corresponding graph
     * argument:
     *  - view: String. eg. "macro", "meso"..
     *
     */
    this.setView = function(view, cb) {
        // we hide the complexity..
        this.set("filter.view", view, "String", function(data) {
            cb({ view: data["filter.view"] });
        });
    }

    /**
     * Manual toggle of the current view (Eg. when button is pressed)
     *
     */

    this.toggleView = function(cb) {
        //toolbar.resetSlidersValues();
        this.getView(function(data) {
           if (data.view == "macro" ) {
                if (this.infodiv.selection.length != 0) {
                    this.setView("meso", cb);
                } else {
                    alert("You need to select a node before switching to meso view");
                    cb();
                }
           } else if (data.view == "meso") {
                 this.setView("macro", cb);
           }
        });
    }

    /**
     * Switch to meso view of a particular node (BUG won't work with multiple selection)
     * arguments:
     *   - id: String
     *   - category: String
     */
    this.viewMeso = function(id, category) {
            var cat = tinaviz.getCategory();
            tinaviz.setView("macro", function() {
                $.doTimeout(100, function(){
                    tinaviz.unselect(); // unselect nodes in current category
                    $.doTimeout(100, function(){
                        //$.doTimeout( 400, function(){
                        tinaviz.setCategory(category);
                        $.doTimeout(100, function(){
                            tinaviz.unselect();  // unselect nodes in the desired category
                            $.doTimeout(100, function(){
                                tinaviz.select(id);
                                $.doTimeout(1500, function(){
                                    tinaviz.setView("meso");
                                    //alert("recentering");
                                    //alert("setting category to "+category);
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
            });
    }


    /**
     *  Retrieves list of all nodes
     *
     *  Usage:
     *  nodes = tinaviz.getNodes("macro", "NGram")
     */
    this.getNodes = function(view, category, cb) {
        applet.getNodes(makeCallback(cb), view, category);
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
        applet.resize(width, height);
    }

    /**
     * Core method communicating with the applet
     */
    this.getAs = function(key,type,cb) {
        applet.sendGet(makeCallback(cb), key, type);
        return undefined;
    }


    /**
     * Core method communicating with the applet
     */
    this.get = function(key,cb) {
        applet.sendGet(makeCallback(cb), key, "Any");
        return undefined;
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

    this.set = function(key, obj, t, cb) {
         //if (t=="Json") alert("key:"+key+" obj: "+obj+" t: "+t);
        console.log("applet.send key: "+key+" , obj: "+obj+", t:"+t);
        var cbId = makeCallback(cb);
        if (t === undefined) {
            this.logNormal("Warning, setting unknow ("+key+","+obj+")");
            applet.sendSet(cbId, key, obj, "");
        } else {
           if (t.indexOf("Tuple2") != -1) {
              if (t.indexOf("[Double]") != -1) {
                  applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Double");
              } else if (t.indexOf("[Int]") != -1) {
                  applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Int");
              } else if (t.indexOf("[Float]") != -1) {
                  applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Float");
              } else {
                  applet.sendSetTuple2(cbId, key, obj[0], obj[1], "");
              }
           } else if (t=="Json") {
             applet.sendSet(cbId, key, $.toJSON(obj), t);
           } else {
              //this.logNormal("send("+key+","+obj+","+t+")");
              applet.sendSet(cbId, key, obj, t);
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

        var buff = '';
        var func = document.write;
        document.write = function(arg){
            buff += arg;
        }
        var res = deployJava.writeAppletTag({
            id: "tinapplet",
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
            brandingIcon: this.brandingIcon,
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

    // callback 0
    makeCallback(function(data) {
        //console.log("applet said it is initialized");

        if (this.xulrunner == true) {
            wrapper = $('#vizframe').contents().find("#tinapplet")[0];
        } else {
            wrapper = $("#tinapplet")[0];
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

        // install some default callback
        makeCallback(function(data) {
            console.log("graph imported");
        });

        // click
        makeCallback(function(data) {
            console.log("graph clicked. mouse: "+data.mouse);
        });

        // view changed
        makeCallback(function(data) {
            console.log("view changed: "+data.view);
        })


        console.log("calling user-provided init callback");
        opts.init();

    });
    this.tag.html( this.getHTML() );
}

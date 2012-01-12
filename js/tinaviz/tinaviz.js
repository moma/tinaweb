var Tinaviz, callCallback, callbacks, cbCounter, cblatency, makeCallback;

cblatency = 100;

cbCounter = 0;

callbacks = {};

$(window).focus(function() {
  return tinaviz.unfreeze();
});

$(window).blur(function() {
  return tinaviz.freeze();
});

callCallback = function(cb_id, cb_args) {
  return delay(cblatency, function() {
    return callbacks[cb_id]($.parseJSON(cb_args));
  });
};

makeCallback = function(cb) {
  var id;
  if (cb == null) cb = function() {};
  id = cbCounter++;
  callbacks[id] = cb;
  return "" + id;
};

Tinaviz = function(args) {
  var applet, opts, wrapper, x;
  opts = {
    context: "",
    path: "",
    engine: "software",
    brandingIcon: "",
    pause: false,
    width: 800,
    height: 600
  };
  for (x in args) {
    opts[x] = args[x];
  }
  wrapper = null;
  applet = null;
  this.toBeSelected = new Array();
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
  this.getPath = function() {
    return this.path;
  };
  this.open = function(url, cb) {
    console.log("url : " + url);
    if (url.search("://") === -1) {
      url = document.location.href.substring(0, document.location.href.lastIndexOf("/") + 1) + url;
    }
    tinaviz.logNormal("applet.openURI(" + url + ");");
    try {
      return applet.openURI(makeCallback(cb), url);
    } catch (e) {
      tinaviz.logError("Couldn't import graph: " + e);
      return cb({
        success: false,
        error: e
      });
    }
  };
  this.getNodesByLabel = function(label, type, cb) {
    return alert("ERROR getNodesByLabel is broken");
  };
  this.selectByPattern = function(pattern, patternMode, cb) {
    if (pattern.length > 0 && pattern.length < 3) return;
    return applet.selectByPattern(makeCallback(cb), pattern, patternMode);
  };
  this.selectByNeighbourPattern = function(pattern, patternMode, category, cb) {
    if (pattern.length > 0 && pattern.length < 3) return;
    return applet.selectByNeighbourPattern(makeCallback(cb), pattern, patternMode, category);
  };
  this.highlightByPattern = function(pattern, patternMode, cb) {
    return applet.highlightByPattern(makeCallback(cb), pattern, patternMode);
  };
  this.highlightByNeighbourPattern = function(pattern, patternMode, cb) {
    return applet.highlightByNeighbourPattern(makeCallback(cb), pattern, patternMode);
  };
  this.getNodeAttributes = function(view, id, cb) {
    return applet.getNodeAttributes(makeCallback(cb), view, id);
  };
  this.getNeighbourhood = function(view, node_list, cb) {
    return applet.getNeighbourhood(makeCallback(cb), view, $.toJSON(node_list));
  };
  this.getNeighboursFromDatabase = function(id) {
    var elem;
    elem = id.split("::");
    return TinaService.getNGrams(0, elem[1], {
      success: function(data) {}
    });
  };
  this.recenter = function(cb) {
    return this.set("camera.target", "all", "String", cb);
  };
  this.centerOnSelection = function(cb) {
    return this.set("camera.target", "selection", "String", cb);
  };
  this.setLayout = function(name, cb) {
    return this.set("layout.algorithm", name, "String", cb);
  };
  this.setPause = function(value, cb) {
    return this.set("pause", value, "Boolean", cb);
  };
  this.getPause = function(cb) {
    return this.get("pause", cb);
  };
  this.pause = function(cb) {
    return this.setPause(true, cb);
  };
  this.togglePause = function(cb) {
    return this.getPause(function(data) {
      return tinaviz.setPause(!data.pause, cb);
    });
  };
  this.unselect = function(cb) {
    return this.set("select", "", "String", cb);
  };
  this.select = function(toBeSelected, cb) {
    var t;
    t = $.isArray(toBeSelected) ? "Json" : "String";
    return this.set("select", toBeSelected, t, cb);
  };
  this.getOppositeCategory = function(cat) {
    if (cat === "Document") {
      return "NGram";
    } else {
      if (cat === "NGram") return "Document";
    }
    return "Document";
  };
  this.makeWrap = function(alias, real, cb) {
    if (cb != null) {
      return function(input) {
        var output;
        output = {};
        output[alias] = input[real];
        return cb(output);
      };
    } else {
      return function(data) {};
    }
  };
  this.getCategory = function(cb) {
    var alias, real;
    alias = "category";
    real = "filter.node.category";
    return this.get(real, this.makeWrap(alias, real, cb));
  };
  this.setCategory = function(value, cb) {
    var alias, real;
    alias = "category";
    real = "filter.node.category";
    return this.set(real, value, "String", this.makeWrap(alias, real, cb));
  };
  this.freeze = function() {
    if (applet !== void 0 && (applet != null)) return applet.freeze();
  };
  this.unfreeze = function() {
    if (applet !== void 0 && (applet != null)) return applet.unfreeze();
  };
  this.getView = function(cb) {
    var alias, real;
    alias = "view";
    real = "filter.view";
    return this.get(real, this.makeWrap(alias, real, cb));
  };
  this.setView = function(view, cb) {
    var alias, real;
    alias = "view";
    real = "filter.view";
    return this.set(real, value, "String", this.makeWrap(alias, real, cb));
  };
  this.viewMeso = function(id, category) {
    return tinaviz.getCategory(function(data) {
      var cat;
      cat = data.category;
      return tinaviz.setView("macro", function() {
        return tinaviz.unselect(function() {
          return tinaviz.setCategory(category, function() {
            return tinaviz.select(id, function() {
              return tinaviz.setView("meso", function() {
                if (category !== cat) {
                  tinaviz.infodiv.updateNodeList("meso", category);
                }
                $("#category-A").fadeIn();
                $("#category-B").fadeIn();
                return tinaviz.recenter();
              });
            });
          });
        });
      });
    });
  };
  this.getNodes = function(view, category, cb) {
    return applet.getNodes(makeCallback(cb), view, category);
  };
  this.size = function(width, height) {
    if (!(wrapper != null) || !(applet != null)) return;
    $("#tinaviz").css("height", "" + height + "px");
    $("#tinaviz").css("width", "" + width + "px");
    wrapper.height = height;
    wrapper.width = width;
    return applet.resize(width, height);
  };
  this.getAs = function(key, type, cb) {
    applet.sendGet(makeCallback(cb), key, type);
    return;
  };
  this.get = function(key, cb) {
    applet.sendGet(makeCallback(cb), key, "Any");
    return;
  };
  this.set = function(key, obj, t, cb) {
    var cbId;
    console.log("applet.send key: " + key + " , obj: " + obj + ", t:" + t);
    cbId = makeCallback(cb);
    if (t === void 0) {
      this.logNormal("Warning, setting unknow (" + key + "," + obj + ")");
      applet.sendSet(cbId, key, obj, "");
    } else {
      if (t.indexOf("Tuple2") !== -1) {
        if (t.indexOf("[Double]") !== -1) {
          applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Double");
        } else if (t.indexOf("[Int]") !== -1) {
          applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Int");
        } else if (t.indexOf("[Float]") !== -1) {
          applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Float");
        } else {
          applet.sendSetTuple2(cbId, key, obj[0], obj[1], "");
        }
      } else if (t === "Json") {
        applet.sendSet(cbId, key, $.toJSON(obj), t);
      } else {
        applet.sendSet(cbId, key, obj, t);
      }
    }
    return;
  };
  this.logNormal = function(msg) {
    try {
      return console.log(msg);
    } catch (e) {

    }
  };
  this.logDebug = function(msg) {
    try {
      return console.log(msg);
    } catch (e) {

    }
  };
  this.logError = function(msg) {
    try {
      return console.error(msg);
    } catch (e) {
      alert(msg);
    }
  };
  this.getHTML = function() {
    var buff, context, engine, func, h, path, res, w;
    path = this.libPath;
    context = this.context;
    engine = this.engine;
    w = this.width;
    h = this.height;
    buff = "";
    func = document.write;
    document.write = function(arg) {
      return buff += arg;
    };
    res = deployJava.writeAppletTag({
      id: "tinapplet",
      code: "eu.tinasoft.tinaviz.Main.class",
      archive: path + "tinaviz-2.0-SNAPSHOT.jar",
      width: w,
      height: h,
      image: "css/branding/appletLoading.gif",
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
  };
  makeCallback(function(data) {
    if (this.xulrunner === true) {
      wrapper = $("#vizframe").contents().find("#tinapplet")[0];
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
    makeCallback(function(data) {
      return console.log("graph imported");
    });
    makeCallback(function(data) {
      return console.log("graph clicked. mouse: " + data.mouse);
    });
    makeCallback(function(data) {
      return console.log("view changed: " + data.view);
    });
    console.log("calling user-provided init callback");
    return opts.init();
  });
  return this.tag.html(this.getHTML());
};

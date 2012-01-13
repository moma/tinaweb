var Tinaviz, callCallback, callbacks, cbCounter, cblatency, makeCallback;

cblatency = 100;

cbCounter = 0;

callbacks = {};

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

Tinaviz = (function() {

  function Tinaviz() {
    log("Tinaviz: called constructor()");
    this.applet = void 0;
    this.appletTag = "#tinapplet";
    this.path = "";
    this.libPath = this.path + "js/tinaviz/";
    this.brandingIcon = this.libPath + "tina_icon.png";
    this.context = "";
    this.engine = "software";
    this.brandingIcon = "";
  }

  Tinaviz.prototype._open = function(url, cb) {
    log("Tinaviz: _open() -> opening " + url);
    try {
      return applet.openURI(makeCallback(cb), url);
    } catch (e) {
      logError("Tinaviz: _open() -> Couldn't import graph: " + e);
      return cb({
        success: false,
        error: e
      });
    }
  };

  Tinaviz.prototype.getNodesByLabel = function(label, type, cb) {
    return alert("ERROR getNodesByLabel is broken");
  };

  Tinaviz.prototype.selectByPattern = function(pattern, patternMode, cb) {
    if (pattern.length > 0 && pattern.length < 3) return;
    return this.applet.selectByPattern(makeCallback(cb), pattern, patternMode);
  };

  Tinaviz.prototype.selectByNeighbourPattern = function(pattern, patternMode, category, cb) {
    if (pattern.length > 0 && pattern.length < 3) return;
    return this.applet.selectByNeighbourPattern(makeCallback(cb), pattern, patternMode, category);
  };

  Tinaviz.prototype.highlightByPattern = function(pattern, patternMode, cb) {
    return this.applet.highlightByPattern(makeCallback(cb), pattern, patternMode);
  };

  Tinaviz.prototype.highlightByNeighbourPattern = function(pattern, patternMode, cb) {
    return this.applet.highlightByNeighbourPattern(makeCallback(cb), pattern, patternMode);
  };

  Tinaviz.prototype.getNodeAttributes = function(view, id, cb) {
    return this.applet.getNodeAttributes(makeCallback(cb), view, id);
  };

  Tinaviz.prototype.getNeighbourhood = function(view, node_list, cb) {
    return this.applet.getNeighbourhood(makeCallback(cb), view, $.toJSON(node_list));
  };

  Tinaviz.prototype.freeze = function() {
    return this.applet.freeze();
  };

  Tinaviz.prototype.unfreeze = function() {
    return this.applet.unfreeze();
  };

  Tinaviz.prototype.getNodes = function(view, category, cb) {
    return this.applet.getNodes(makeCallback(cb), view, category);
  };

  Tinaviz.prototype._resize = function(_arg) {
    var height, width;
    width = _arg.width, height = _arg.height;
    log("Tinaviz: resize() -> self-resizing");
    $("" + this._config.element).css("height", "" + height + "px");
    $("" + this._config.element).css("width", "" + width + "px");
    this.applet.height = height;
    this.applet.width = width;
    return this.applet.resize(width, height);
  };

  Tinaviz.prototype.getAs = function(key, type, cb) {
    this.applet.sendGet(makeCallback(cb), key, type);
  };

  Tinaviz.prototype.get = function(key, cb) {
    this.applet.sendGet(makeCallback(cb), key, "Any");
  };

  Tinaviz.prototype.set = function(key, obj, t, cb) {
    var cbId, o;
    debug("Tinaviz: set(key: " + key + ", obj: " + obj + ", t: " + t + ")");
    cbId = makeCallback(cb);
    if (!t) {
      o = _(obj);
      if (o.isNumber) {
        t = "Double";
      } else if (o.isBoolean) {
        t = "Boolean";
      } else if (current.isString) {
        t = "String";
      } else {
        log("Warning, setting unknow (" + key + ", " + obj + ")");
        this.applet.sendSet(cbId, key, obj, "");
        return;
      }
    }
    if (t.indexOf("Tuple2") !== -1) {
      if (t.indexOf("[Double]") !== -1) {
        this.applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Double");
      } else if (t.indexOf("[Int]") !== -1) {
        this.applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Int");
      } else if (t.indexOf("[Float]") !== -1) {
        this.applet.sendSetTuple2(cbId, key, obj[0], obj[1], "Float");
      } else {
        this.applet.sendSetTuple2(cbId, key, obj[0], obj[1], "");
      }
    } else if (t === "Json") {
      this.applet.sendSet(cbId, key, $.toJSON(obj), t);
    } else {
      this.applet.sendSet(cbId, key, obj, t);
    }
  };

  Tinaviz.prototype._generateAppletHTML = function() {
    var buff, func, res;
    buff = "";
    func = document.write;
    document.write = function(arg) {
      return buff += arg;
    };
    res = deployJava.writeAppletTag({
      id: "tinapplet",
      code: "eu.tinasoft.tinaviz.Main.class",
      archive: this.libPath + "tinaviz-2.0-SNAPSHOT.jar",
      width: this.width,
      height: this.height,
      image: "css/branding/appletLoading.gif",
      standby: "Loading Tinaviz..."
    }, {
      engine: this.engine,
      js_context: this.context,
      root_prefix: this.path,
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

  Tinaviz.prototype._inject = function(cb) {
    var _this = this;
    log("Tinaviz: preparing first hook..");
    makeCallback(function(data) {
      log("Tinaviz: Injected..");
      _this.applet = $(_this.appletTag)[0];
      if (_this.applet == null) {
        alert("Error: couldn't get the applet!");
        return;
      }
      return _this.cb();
    });
    log("Tinaviz: Injecting...");
    return tag.html(this._generateAppletHTML());
  };

  return Tinaviz;

})();

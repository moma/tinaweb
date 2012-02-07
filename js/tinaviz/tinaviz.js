var Tinaviz, callCallback, callbacks, cbCounter, cblatency, makeCallback,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

cblatency = 2;

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
    this._inject = __bind(this._inject, this);
    this.set = __bind(this.set, this);
    this.get = __bind(this.get, this);
    this.getAs = __bind(this.getAs, this);
    this._resize = __bind(this._resize, this);
    this.getNodes = __bind(this.getNodes, this);
    this.unfreeze = __bind(this.unfreeze, this);
    this.freeze = __bind(this.freeze, this);
    this.getNeighbourhood = __bind(this.getNeighbourhood, this);
    this.getNodeAttributes = __bind(this.getNodeAttributes, this);
    this.highlightByNeighbourPattern = __bind(this.highlightByNeighbourPattern, this);
    this.highlightByPattern = __bind(this.highlightByPattern, this);
    this.selectByNeighbourPattern = __bind(this.selectByNeighbourPattern, this);
    this.selectByPattern = __bind(this.selectByPattern, this);
    this.getNodesByLabel = __bind(this.getNodesByLabel, this);
    this._open = __bind(this._open, this);
    this.configure_using = __bind(this.configure_using, this);    this.applet = void 0;
    this.config = {
      jarFile: "tinaviz-2.0-SNAPSHOT.jar",
      loadingImage: "css/branding/appletLoading.gif",
      appletId: "tinapplet",
      elementId: "vizdiv",
      path: "",
      assets: "",
      context: "",
      engine: "software",
      brandingIcon: "",
      width: 10,
      height: 10
    };
  }

  Tinaviz.prototype.configure_using = function(params) {
    var key, value, _results;
    _results = [];
    for (key in params) {
      value = params[key];
      _results.push(this.config[key] = value);
    }
    return _results;
  };

  Tinaviz.prototype._open = function(url, cb) {
    log("Tinaviz: _open() -> opening " + url);
    try {
      return this.applet.openURI(makeCallback(cb), url);
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
    if (pattern.length > 2) {
      return this.applet.selectByPattern(makeCallback(cb), pattern, patternMode);
    }
  };

  Tinaviz.prototype.selectByNeighbourPattern = function(pattern, patternMode, category, cb) {
    if (pattern.length > 2) {
      return this.applet.selectByNeighbourPattern(makeCallback(cb), pattern, patternMode, category);
    }
  };

  Tinaviz.prototype.highlightByPattern = function(pattern, patternMode, cb) {
    if (pattern.length > 2) {
      return this.applet.highlightByPattern(makeCallback(cb), pattern, patternMode);
    }
  };

  Tinaviz.prototype.highlightByNeighbourPattern = function(pattern, patternMode, cb) {
    if (pattern.length > 2) {
      return this.applet.highlightByNeighbourPattern(makeCallback(cb), pattern, patternMode);
    }
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
    var height, width, _ref, _ref2, _ref3;
    width = _arg.width, height = _arg.height;
    log("Tinaviz: resize() -> self-resizing");
    $("" + this.config.element).css("height", "" + height + "px");
    $("" + this.config.element).css("width", "" + width + "px");
    if ((_ref = this.applet) != null) _ref.height = height;
    if ((_ref2 = this.applet) != null) _ref2.width = width;
    return (_ref3 = this.applet) != null ? typeof _ref3.resize === "function" ? _ref3.resize(width, height) : void 0 : void 0;
  };

  Tinaviz.prototype.getAs = function(key, type, cb) {
    this.applet.sendGet(makeCallback(cb), key, type);
  };

  Tinaviz.prototype.get = function(key, cb) {
    this.applet.sendGet(makeCallback(cb), key, "Any");
  };

  Tinaviz.prototype.set = function(key, obj, t, cb) {
    var cbId, o;
    cbId = makeCallback(cb);
    debug("Tinaviz: set(key: " + key + ", obj: " + obj + ", t: " + t + ", cb: " + cbId + ")");
    if (t == null) {
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
    log("type ----> " + t);
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
      id: this.config.appletId,
      code: "eu.tinasoft.tinaviz.Main.class",
      archive: "" + this.config.path + this.config.jarFile,
      width: this.config.width,
      height: this.config.height,
      image: this.config.loadingImage,
      standby: "Loading Tinaviz..."
    }, {
      engine: this.config.engine,
      js_context: this.config.context,
      root_prefix: this.config.path,
      brandingIcon: this.config.path + "tina_icon.png",
      progressbar: false,
      boxbgcolor: "#FFFFFF",
      boxmessage: "Loading Tinaviz...",
      image: this.config.loadingImage,
      mayscript: true,
      scriptable: true
    });
    document.write = func;
    return buff;
  };

  Tinaviz.prototype._inject = function(cb) {
    var _this = this;
    makeCallback(function(data) {
      _this.applet = $("#" + _this.config.appletId)[0];
      if (_this.applet) {
        return cb();
      } else {
        return alert("applet couldn't be initialized, should put this in results");
      }
    });
    log(this.config);
    return $("#" + this.config.elementId).html(this._generateAppletHTML());
  };

  return Tinaviz;

})();

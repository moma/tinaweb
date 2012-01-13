var Tinaweb,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Tinaweb = (function(_super) {

  __extends(Tinaweb, _super);

  function Tinaweb() {
    log("Tinaweb: constructor called.. calling super()");
    Tinaweb.__super__.constructor.call(this);
    log("Tinaweb: configuring with default config");
    this._config = {
      element: "#tinaviz",
      gexf: "sample.gexf.gz",
      view: "macro",
      category: "Document",
      node_id: "",
      search: "",
      a_node_size: 0.50,
      b_node_size: 0.50,
      cursor_size: 0.01,
      a_edge_filter_min: 0.0,
      a_edge_filter_max: 1.0,
      a_node_filter_min: 0.0,
      a_node_filter_max: 1.0,
      b_edge_filter_min: 0.0,
      b_edge_filter_max: 1.0,
      b_node_filter_min: 0.0,
      b_node_filter_max: 1.0,
      layout: "tinaforce",
      layout_speed: 30,
      pause: false,
      demo: false
    };
    this._status = "done";
    this._demo_running = false;
    this._demo_possible = false;
    log("Tinaweb: end of constructor");
  }

  Tinaweb.prototype.configure_using = function(params) {
    var key, value, _results;
    log("Tinaweb: configure_using(params) -> loading..");
    _results = [];
    for (key in params) {
      value = params[key];
      _results.push(this._config[key] = value);
    }
    return _results;
  };

  Tinaweb.prototype.load_url_params = function() {
    return loadURLParamsUsing(this._config);
  };

  Tinaweb.prototype.computeSize = function() {
    log("Tinaweb: default computeSize() function");
    return {
      width: 10,
      height: 10
    };
  };

  Tinaweb.prototype.resize = function() {
    log("Tinaweb: default resize() -> self-resizing");
    return this._resize(this.computeSize());
  };

  Tinaweb.prototype.open = function(url, cb) {
    log("Tinaweb: open " + url);
    if (url.search("://") === -1) {
      url = document.location.href.substring(0, document.location.href.lastIndexOf("/") + 1) + url;
    }
    return this._open(url, cb);
  };

  Tinaweb.prototype.recenter = function(cb) {
    return this.set("camera.target", "all", "String", cb);
  };

  Tinaweb.prototype.centerOnSelection = function(cb) {
    return this.set("camera.target", "selection", "String", cb);
  };

  Tinaweb.prototype.setLayout = function(name, cb) {
    return this.set("layout.algorithm", name, "String", cb);
  };

  Tinaweb.prototype.setPause = function(value, cb) {
    if (value == null) value = true;
    return this.set("pause", value, "Boolean", cb);
  };

  Tinaweb.prototype.getPause = function(cb) {
    return this.get("pause", cb);
  };

  Tinaweb.prototype.pause = function(cb) {
    return this.setPause(cb);
  };

  Tinaweb.prototype.togglePause = function(cb) {
    return this.getPause(function(data) {
      return this.setPause(!data.pause, cb);
    });
  };

  Tinaweb.prototype.unselect = function(cb) {
    return this.set("select", "", "String", cb);
  };

  Tinaweb.prototype.select = function(toBeSelected, cb) {
    var t;
    t = $.isArray(toBeSelected) ? "Json" : "String";
    return this.set("select", toBeSelected, t, cb);
  };

  Tinaweb.prototype.getOppositeCategory = function(cat) {
    if (cat === "Document") {
      return "NGram";
    } else {
      return "Document";
    }
  };

  Tinaweb.prototype.makeWrap = function(alias, real, cb) {
    var _cb;
    _cb = function(data) {};
    if (cb != null) {
      _cb = function(input) {
        var output;
        output = {};
        output[alias] = input[real];
        return cb(output);
      };
    }
    return _cb;
  };

  Tinaweb.prototype.getCategory = function(cb) {
    var alias, real;
    alias = "category";
    real = "filter.node.category";
    return this.get(real, this.makeWrap(alias, real, cb));
  };

  Tinaweb.prototype.setCategory = function(value, cb) {
    var alias, real;
    alias = "category";
    real = "filter.node.category";
    return this.set(real, value, "String", this.makeWrap(alias, real, cb));
  };

  Tinaweb.prototype.getView = function(cb) {
    var alias, real;
    alias = "view";
    real = "filter.view";
    return this.get(real, this.makeWrap(alias, real, cb));
  };

  Tinaweb.prototype.setView = function(view, cb) {
    var alias, real;
    alias = "view";
    real = "filter.view";
    return this.set(real, value, "String", this.makeWrap(alias, real, cb));
  };

  Tinaweb.prototype.install = function() {
    var _this = this;
    log("Tinaweb: install() -> calling preInstall");
    if (typeof this.preInstall === "function") this.preInstall();
    log("Tinaweb: install() -> calling @_inject => { ... }");
    return this._inject(function() {
      var delayBetweenChanges, waitTimeBeforeStartingDemo;
      log("Tinaweb: _inject() -> creating callbacks");
      makeCallback(_this.graphImported);
      makeCallback(_this.selectionChanged);
      makeCallback(_this.viewChanged);
      log("Tinaweb: _inject() -> binding automatic resize");
      $(window).bind("resize", function() {
        return _this.resize;
      });
      log("Tinaweb: _inject() -> binding blur and focus");
      $(window).bind("blur", function() {
        return _this.freeze;
      });
      $(window).bind("focus", function() {
        return _this.unfreeze;
      });
      log("Tinaweb: _postInject() -> checking for demo mode");
      if (_this._config.demo != null) _this._demo_possible = true;
      waitTimeBeforeStartingDemo = 6;
      delayBetweenChanges = 10;
      log("Tinaweb: _postInject() -> sending parameters to the applet");
      _this.set("filter.a.edge.weight", [_this._config.a_edge_filter_min, _this._config.a_edge_filter_max], "Tuple2[Double]");
      _this.set("filter.a.node.weight", [_this._config.a_node_filter_min, _this._config.a_node_filter_max], "Tuple2[Double]");
      _this.set("filter.b.edge.weight", [_this._config.b_edge_filter_min, _this._config.b_edge_filter_max], "Tuple2[Double]");
      _this.set("filter.b.node.weight", [_this._config.b_node_filter_min, _this._config.b_node_filter_max], "Tuple2[Double]");
      _this.set("filter.a.node.size", _this._config.a_node_size, "Double");
      _this.set("filter.b.node.size", _this._config.b_node_size, "Double");
      _this.set("filter.node.category", _this._config.category, "String");
      _this.set("selectionRadius", _this._config.cursor_size, "Double");
      _this.set("layout", _this._config.layout, "String");
      _this.set("layoutSpeed", _this._config.layout_speed, "Int");
      _this.set("pause", _this._config.pause, "Boolean");
      log("Tinaweb: _postInject() terminated, calling postInstall() if available");
      return typeof _this.postInstall === "function" ? _this.postInstall() : void 0;
    });
  };

  return Tinaweb;

})(Tinaviz);

var Tinaweb,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Tinaweb = (function(_super) {

  __extends(Tinaweb, _super);

  function Tinaweb() {
    this.install = __bind(this.install, this);
    this.setView = __bind(this.setView, this);
    this.getView = __bind(this.getView, this);
    this.setCategory = __bind(this.setCategory, this);
    this.getCategory = __bind(this.getCategory, this);
    this.select = __bind(this.select, this);
    this.unselect = __bind(this.unselect, this);
    this.togglePause = __bind(this.togglePause, this);
    this.pause = __bind(this.pause, this);
    this.getPause = __bind(this.getPause, this);
    this.setPause = __bind(this.setPause, this);
    this.setLayout = __bind(this.setLayout, this);
    this.centerOnSelection = __bind(this.centerOnSelection, this);
    this.recenter = __bind(this.recenter, this);
    this.open = __bind(this.open, this);
    this.resize = __bind(this.resize, this);
    this.computeSize = __bind(this.computeSize, this);
    this.load_url_params = __bind(this.load_url_params, this);    log("Tinaweb: constructor called.. calling super()");
    Tinaweb.__super__.constructor.call(this);
    log("Tinaweb: configuring with default config");
    this._tinaweb_defaults = {
      elementId: "vizdiv",
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
      antialiasing_threshold: 1500,
      pause: false,
      demo: false
    };
    this._status = "done";
    this._demo_running = false;
    this._demo_possible = false;
    log("Tinaweb: end of constructor");
  }

  Tinaweb.prototype.load_url_params = function() {
    return loadURLParamsUsing(this.config);
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
    var _this = this;
    return this.getPause(function(data) {
      return _this.setPause(!data.pause, cb);
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

  Tinaweb.prototype.setView = function(value, cb) {
    var alias, real;
    alias = "view";
    real = "filter.view";
    return this.set(real, value, "String", this.makeWrap(alias, real, cb));
  };

  Tinaweb.prototype.install = function() {
    var _this = this;
    log("Tinaweb: install() -> loading some additionnal default settings");
    this.configure_using(this._tinaweb_defaults);
    log("Tinaweb: install() -> calling preInstall if available");
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
      log("Tinaweb: _inject() -> binding mouse enter/leave events");
      $(window).mouseleave(function() {
        return _this.freeze();
      });
      $(window).mouseenter(function() {
        return _this.unfreeze();
      });
      log("Tinaweb: _postInject() -> checking for demo mode");
      if (_this.config.demo != null) _this._demo_possible = true;
      waitTimeBeforeStartingDemo = 6;
      delayBetweenChanges = 10;
      log("Tinaweb: _postInject() -> sending (some) default parameters to the applet");
      _this.set("filter.a.edge.weight", [_this.config.a_edge_filter_min, _this.config.a_edge_filter_max], "Tuple2[Double]");
      _this.set("filter.a.node.weight", [_this.config.a_node_filter_min, _this.config.a_node_filter_max], "Tuple2[Double]");
      _this.set("filter.b.edge.weight", [_this.config.b_edge_filter_min, _this.config.b_edge_filter_max], "Tuple2[Double]");
      _this.set("filter.b.node.weight", [_this.config.b_node_filter_min, _this.config.b_node_filter_max], "Tuple2[Double]");
      _this.set("filter.a.node.size", _this.config.a_node_size, "Double");
      _this.set("filter.b.node.size", _this.config.b_node_size, "Double");
      _this.set("filter.node.category", _this.config.category, "String");
      _this.set("selectionRadius", _this.config.cursor_size, "Double");
      _this.set("layout", _this.config.layout, "String");
      _this.set("layoutSpeed", _this.config.layout_speed, "Double");
      _this.set("pause", _this.config.pause, "Boolean");
      _this.set("antiAliasingThreshold", _this.config.antialiasing_threshold, "Int", log("Tinaweb: _postInject() terminated, calling postInstall() if available"));
      return typeof _this.postInstall === "function" ? _this.postInstall() : void 0;
    });
  };

  return Tinaweb;

})(Tinaviz);

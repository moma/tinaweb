var Application, app,
  __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

Application = (function(_super) {

  __extends(Application, _super);

  function Application() {
    this.viewChanged = __bind(this.viewChanged, this);
    this.selectionChanged = __bind(this.selectionChanged, this);
    this.resize = __bind(this.resize, this);
    this.graphLoadingProgress = __bind(this.graphLoadingProgress, this);
    this.animateAppletInfo = __bind(this.animateAppletInfo, this);
    this.postInstall = __bind(this.postInstall, this);
    this.preInstall = __bind(this.preInstall, this);
    Application.__super__.constructor.apply(this, arguments);
  }

  Application.prototype.preInstall = function() {
    log("Application: preInstall");
    this.configure_using(default_config);
    return this.configure_using(this.load_url_params());
  };

  Application.prototype.postInstall = function() {
    log("Application: postInstall");
    if (this.config.layout === "phyloforce") {
      this.infodiv = PhyloInfoDiv;
    } else {
      this.infodiv = InfoDiv;
    }
    log("Application: configuring page layout, and info panel's DIV");
    this.infodiv.id = "infodiv";
    this.infodiv.label = $("#node_label");
    this.infodiv.contents = $("#node_contents");
    this.infodiv.cloud = $("#node_neighbourhood");
    this.infodiv.cloudSearch = $("#node_neighbourhoodForSearch");
    this.infodiv.cloudSearchCopy = $("#node_neighbourhoodCopy");
    this.infodiv.unselect_button = $("#toggle-unselect");
    this.infodiv.node_table = $("#node_table > tbody");
    this.infodiv.categories = {
      NGram: "Keywords",
      Document: "Projects"
    };
    log("Application: resizing here");
    this.resize();
    $("#infodiv").accordion({
      fillSpace: true
    });
    this.infodiv.reset();
    toolbar.init();
    log("Application: trying to automatically open GEXF file from config");
    if (this.config.gexf != null) {
      if (this.config.gexf !== "") {
        return this.open("" + this.config.gexf, this.graphLoadingProgress);
      }
    }
  };

  Application.prototype.animateAppletInfo = function() {
    var txt,
      _this = this;
    if (status !== "loaded") {
      txt = $("#appletInfo").text();
      $("#appletInfo").text("" + txt + ".");
      return delay(400, function() {
        return _this.animateAppletInfo();
      });
    }
  };

  Application.prototype.graphLoadingProgress = function(data) {
    var _this = this;
    this.status = data.status;
    if (this.status === "downloading") {
      $("#appletInfo").effect("pulsate", "fast");
      $("#appletInfo").text("Downloading data..");
      show("#appletInfo");
      return this.animateAppletInfo();
    } else if (this.status === "downloaded") {
      $("#appletInfo").effect("pulsate", "fast");
      return $("#appletInfo").text("Generating graph..");
    } else if (this.status === "updated") {} else if (this.status === "loaded") {
      log("graph loaded");
      log("update the node list (may fail)");
      this.infodiv.updateNodeList("macro", this.config.category);
      log("displaying current category");
      this.infodiv.display_current_category();
      log("displaying current view");
      this.infodiv.display_current_view();
      $("#appletInfo").text("Graph generated, please wait..");
      delay(100, function() {
        show("#toggle-paused");
        return delay(200, function() {
          show("#toggle-switch");
          return delay(200, function() {
            show("#level");
            return delay(200, function() {
              show("#cursor-size-block");
              return delay(400, function() {
                show("#category-A");
                show("#category-legend");
                return delay(300, function() {
                  show("#search");
                  show("#search_button");
                  return delay(200, function() {
                    show("#toggle-recenter");
                    return delay(100, function() {
                      show("#export-gexf");
                      return delay(1000, function() {
                        return $("#appletInfo").animate({
                          opacity: "toggle",
                          height: "toggle"
                        }, "slow", function() {});
                      });
                    });
                  });
                });
              });
            });
          });
        });
      });
      if (this.config.node_id !== "") {
        delay(200, function() {
          return _this.select(_this.config.node_id);
        });
      }
      if (this.config.search !== "") {
        $("#search_input").val(this.config.search);
        return this.selectByPattern(this.config.search, "containsIgnoreCase");
      }
    } else if (this.status === "error") {
      return $("#notification").notify("create", {
        title: "Tinasoft Notification",
        text: "Error loading the network, please consult logs"
      });
    } else {
      return log("unknow status " + this.status);
    }
  };

  Application.prototype.resize = function() {
    var height, infoDivWidth, width;
    log("Application: custom computeSize()");
    infoDivWidth = 390;
    width = getScreenWidth() - infoDivWidth - 55;
    height = getScreenHeight() - $("#hd").height() - $("#ft").height() - 60;
    $("#appletdiv").css("width", width);
    $("#infodiv").css("width", infoDivWidth);
    $("#infodivparent").css("height", height);
    this.config.width = width;
    this.config.height = height;
    return this._resize({
      width: width,
      height: height
    });
  };

  Application.prototype.viewMeso = function(id, category) {
    var _this = this;
    log("Application: viewMeso(" + id + ", " + category + ")");
    return this.getCategory(function(data) {
      var cat;
      cat = data.category;
      return _this.setView("macro", function() {
        return _this.unselect(function() {
          return _this.setCategory(category, function() {
            return _this.select(id, function() {
              return _this.setView("meso", function() {
                if (category !== cat) {
                  _this.infodiv.updateNodeList("meso", category);
                }
                show("#category-A");
                show("#category-B");
                return _this.recenter();
              });
            });
          });
        });
      });
    });
  };

  Application.prototype.selectionChanged = function(data) {
    var mouse, selection,
      _this = this;
    log("-- selection automatically changed:");
    mouse = data.mouse;
    selection = data.selection;
    return this.getView(function(data) {
      var active, selectionIsEmpty, view;
      view = data.view;
      active = $("#infodiv").accordion("option", "active");
      selectionIsEmpty = Object.size(selection) === 0;
      log("selectionIsEmpty: " + selectionIsEmpty);
      if (!selectionIsEmpty && active !== 0) {
        log("Application: selection is not empty, and active tab is not 0");
        $("#infodiv").accordion("activate", 0);
      } else if (selectionIsEmpty && active !== "false") {
        log("Application: selection is empty and active is not false");
        $("#infodiv").accordion("activate", 0);
      }
      if (mouse === "left") {} else if (mouse === "right") {} else if (mouse === "doubleLeft") {
        log("Application: double click on left mouse:");
        if (!selectionIsEmpty) {
          _this.getCategory(function(data) {
            var category;
            category = data.category;
            return _this.setView("meso", function() {
              log("switching to " + category);
              return _this.setCategory(category, function() {
                _this.infodiv.updateNodeList("meso", category);
                _this.infodiv.display_current_category();
                _this.infodiv.update(view, selection);
                return _this.centerOnSelection(function() {});
              });
            });
          });
        }
      }
      _this.infodiv.display_current_category();
      return _this.infodiv.update(view, selection);
    });
  };

  Application.prototype.viewChanged = function(data) {
    var view,
      _this = this;
    log("Application: default view automatically changed to " + data.view);
    view = data.view;
    return this.getCategory(function(data) {
      var category, level, title;
      category = data.category;
      _this.infodiv.updateNodeList(view, category);
      _this.infodiv.display_current_category();
      _this.infodiv.display_current_view();
      level = $("#level");
      level.button("option", "label", "" + view + " level");
      title = $("#infodiv > h3:first");
      if (view === "macro") {
        if (cat === "Document") {
          show("#category-A", "fast");
          hide("#category-B", "fast");
        } else if (cat === "NGram") {
          hide("#category-A", "fast");
          show("#category-B", "fast");
        }
        level.removeClass("ui-state-highlight");
        return title.removeClass("ui-state-highlight");
      } else {
        show("#category-A", "fast");
        show("#category-B", "fast");
        level.addClass("ui-state-highlight");
        title.addClass("ui-state-highlight");
        return _this.recenter();
      }
    });
  };

  return Application;

})(Tinaweb);

app = new Application;

$(document).ready(function() {
  log("document ready.. installing app");
  log(app);
  return app.install();
});

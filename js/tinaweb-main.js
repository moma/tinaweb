var MyTinaweb, tinaweb,
  __hasProp = Object.prototype.hasOwnProperty,
  __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

MyTinaweb = (function(_super) {

  __extends(MyTinaweb, _super);

  function MyTinaweb(config) {
    this.config = config;
    log("MyTinaweb: called constructor using some config");
  }

  MyTinaweb.prototype.resize = function() {
    var height, infoDivWidth, width;
    log("MyTinaweb: custom computeSize()");
    infoDivWidth = 390;
    width = getScreenWidth() - infoDivWidth - 55;
    height = getScreenHeight() - $("#hd").height() - $("#ft").height() - 60;
    $("#appletdiv").css("width", width);
    $("#infodiv").css("width", infoDivWidth);
    $("#infodivparent").css("height", height);
    return this._resize({
      width: width,
      height: height
    });
  };

  MyTinaweb.prototype.preInstall = function() {
    log("MyTinaweb: preInstall");
    this.configure(this.config);
    this.configure(loadURLParamsUsing(this.config));
    this.config = {
      path: "",
      tag: "#vizdiv",
      logo: "css/logo.png",
      context: "",
      engine: "software"
    };
    this.libPath = this.path + "js/tinaviz/";
    this.config.brandingIcon = "" + this.config.libPath + "tina_icon.png";
    return this.configure(this.config);
  };

  MyTinaweb.prototype.postInstall = function() {
    log("MyTinaweb: postInstall");
    if (this.config.layout === "phyloforce") {
      this.infodiv = PhyloInfoDiv;
    } else {
      this.infodiv = InfoDiv;
    }
    log("MyTinaweb: configuring page layout, and info panel's DIV");
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
    $("#infodiv").accordion({
      fillSpace: true
    });
    this.infodiv.reset();
    toolbar.init();
    log("MyTinaweb: trying to automatically open GEXF file from config");
    if (this.config.gexf != null) {
      if (this.config.gexf !== "") {
        return this.open("" + this.config.gexf, this.graphLoadingProgress);
      }
    }
  };

  MyTinaweb.prototype.animateAppletInfo = function() {
    if (this.status !== "loaded") {
      $("#appletInfo").text($("#appletInfo").text() + ".");
      return delay(400, this.animateAppletInfo);
    }
  };

  MyTinaweb.graphLoadingProgress = function(data) {
    var status;
    status = data.status;
    if (status === "downloading") {
      $("#appletInfo").effect("pulsate", "fast");
      $("#appletInfo").text("Downloading data..");
      show("#appletInfo");
      return this.animateAppletInfo();
    } else if (status === "downloaded") {
      $("#appletInfo").effect("pulsate", "fast");
      return $("#appletInfo").text("Generating graph..");
    } else if (status === "updated") {} else if (status === "loaded") {
      log("graph loaded");
      log("update the node list (may fail)");
      this.infodiv.updateNodeList("macro", prefs.category);
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
      if (prefs.node_id !== "") {
        delay(200, function() {
          return this.select(prefs.node_id);
        });
      }
      if (prefs.search !== "") {
        $("#search_input").val(prefs.search);
        return this.selectByPattern(prefs.search, "containsIgnoreCase");
      }
    } else if (status === "error") {
      return $("#notification").notify("create", {
        title: "Tinasoft Notification",
        text: "Error loading the network, please consult logs"
      });
    } else {
      return log("unknow status " + status);
    }
  };

  MyTinaweb.prototype.viewMeso = function(id, category) {
    var _this = this;
    return this.getCategory(function(data) {
      var cat;
      cat = data.category;
      return _this.setView("macro", function() {
        return _this.unselect(function() {
          var _this = this;
          return this.setCategory(category, function() {
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

  MyTinaweb.prototype.selectionChanged = function(data) {
    var active, selectionIsEmpty,
      _this = this;
    log("-- selection automatically changed: " + data.selection);
    active = $("#infodiv").accordion("option", "active");
    selectionIsEmpty = Object.size(data.selection) === 0;
    log("selectionIsEmpty: " + selectionIsEmpty);
    if (!selectionIsEmpty && active !== 0) {
      log("MyTinaweb: selection is not empty, and active tab is not 0");
      $("#infodiv").accordion("activate", 0);
    } else if (selectionIsEmpty && active !== "false") {
      log("MyTinaweb: selection is empty and active is not false");
      $("infodiv").accordion("activate", 0);
    }
    if (data.mouse === "left") {} else if (data.mouse === "right") {} else if (data.mouse === "doubleLeft") {
      log("MyTinaweb: double click on left mouse:");
      this.setView("meso", function() {
        _this.getCategory(function(data2) {
          return log("switching to " + data2.category);
        });
        return _this.setCategory(data2.category, function() {
          return _this.centerOnSelection(function() {
            this.infodiv.updateNodeList("meso", data2.category);
            return this.infodiv.display_current_category();
          });
        });
      });
    }
    return this.infodiv.update(data.view, data.selection);
  };

  MyTinaweb.prototype.viewChanged = function(data) {
    var view,
      _this = this;
    log("MyTinaweb: default view automatically changed to " + data.view);
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

  return MyTinaweb;

})(Tinaweb);

tinaweb = new MyTinaweb(default_config);

var callSlider, sliderData, toolbar;

callSlider = function(sliderobj, slider) {
  if (sliderData[slider].scheduled !== true) {
    sliderData[slider].scheduled = true;
    return $.doTimeout(sliderData[slider].delay, function() {
      var vals;
      if (sliderData[slider].type === "Tuple2[Double]") {
        vals = $(sliderobj).slider("values");
        app.set(slider, [vals[0] / sliderData[slider].size, vals[1] / sliderData[slider].size], sliderData[slider].type);
      } else {
        if (sliderData[slider].type === "Double") {
          app.set(slider, $(sliderobj).slider("value") / sliderData[slider].size, sliderData[slider].type);
        }
      }
      return sliderData[slider].scheduled = false;
    });
  }
};

$(document).ready(function() {
  $.extend($.ui.slider.defaults, {
    min: 0,
    max: 100,
    value: 100.0,
    animate: true,
    orientation: "horizontal"
  });
  jQuery.fn.disableTextSelect = function() {
    return this.each(function() {
      if (typeof this.onselectstart !== "undefined") {
        return this.onselectstart = function() {
          return false;
        };
      } else if (typeof this.style.MozUserSelect !== "undefined") {
        return this.style.MozUserSelect = "none";
      } else {
        this.onmousedown = function() {
          return false;
        };
        return this.style.cursor = "default";
      }
    });
  };
  jQuery(".unselectable").disableTextSelect();
  $(".unselectable").hover((function() {
    return $(this).css("cursor", "default");
  }), function() {
    return $(this).css("cursor", "auto");
  });
  $("#nodeRadiusSelector").change(function() {
    return app.set("filter.map.node.radius", $("#nodeRadiusSelector").val(), "String");
  });
  $("#nodeShapeSelector").change(function() {
    return app.set("filter.map.node.shape", $("#nodeShapeSelector").val(), "String");
  });
  return $("#nodeColorSelector").change(function() {
    return app.set("filter.map.node.color", $("#nodeColorSelector").val(), "String");
  });
});

toolbar = {
  values: {
    search: "",
    sliders: {
      magnify: 0.5,
      cursor_size: 0.5,
      nodeFilter: {
        min: 0.0,
        max: 1.0
      },
      edgeFilter: {
        min: 0.0,
        max: 1.0
      }
    },
    buttons: {
      pause: false,
      showNodes: true,
      showEdges: true,
      hd: false
    }
  }
};

toolbar.lastSearch = "";

toolbar.checkSearchForm = function() {
  var txt;
  txt = $("#search_input").val();
  if (txt !== toolbar.lastSearch) {
    toolbar.lastSearch = txt;
    app.highlightByPattern(txt, "containsIgnoreCase");
  }
  return delay(200, toolbar.checkSearchForm);
};

toolbar.checkSearchFormNoRepeat = function() {
  var txt;
  txt = $("#search_input").val();
  if (txt !== toolbar.lastSearch) {
    toolbar.lastSearch = txt;
    return app.highlightByPattern(txt, "containsIgnoreCase");
  }
};

toolbar.runSearchFormNoRepeat = function() {
  var txt;
  txt = $("#search_input").val();
  log("runSearchFormNoRepeat: " + txt);
  app.unselect(function() {
    var cat, whenDone;
    app.infodiv.reset();
    cat = app.getCategory();
    whenDone = function() {
      if (txt !== "") {
        return app.centerOnSelection();
      } else {
        return app.recenter();
      }
    };
    if (cat === "Document") {
      return app.selectByPattern(txt, "containsIgnoreCase", whenDone);
    } else {
      return app.selectByPattern(txt, "containsIgnoreCase", whenDone);
    }
  });
  return false;
};

sliderData = {
  "filter.a.node.weight": {
    scheduled: false,
    delay: 250,
    size: 100,
    type: "Tuple2[Double]"
  },
  "filter.a.edge.weight": {
    scheduled: false,
    delay: 250,
    size: 100,
    type: "Tuple2[Double]"
  },
  "filter.b.node.weight": {
    scheduled: false,
    delay: 250,
    size: 100,
    type: "Tuple2[Double]"
  },
  "filter.b.edge.weight": {
    scheduled: false,
    delay: 250,
    size: 100,
    type: "Tuple2[Double]"
  },
  "filter.a.node.size": {
    scheduled: false,
    delay: 100,
    size: 100,
    type: "Double"
  },
  "filter.b.node.size": {
    scheduled: false,
    delay: 100,
    size: 100,
    type: "Double"
  },
  selectionRadius: {
    scheduled: false,
    delay: 50,
    size: 1,
    type: "Double"
  }
};

toolbar.init = function() {
  $("#search").submit(function() {
    toolbar.runSearchFormNoRepeat();
    return false;
  });
  $("#search").keypress(function() {
    return toolbar.checkSearchFormNoRepeat();
  });
  $("#export-gexf").button({
    text: true
  }).click(function(eventObject) {
    return app.set("export", "GEXF", "String");
  });
  $("#export-png").button({
    text: true
  }).click(function(eventObject) {
    return app.set("export", "PNG", "String");
  });
  $("#export-pdf").button({
    text: true
  }).click(function(eventObject) {
    return app.set("export", "PDF", "String");
  });
  $("#level").button({
    text: true,
    icons: {
      primary: "ui-icon-help"
    }
  }).click(function(eventObject) {
    return app.getView(function(data) {
      if (data.view === "macro") {
        if (app === void 0 || app.infodiv.selection.length === 0) {
          return alert("You need to select a node before switching to meso view");
        } else {
          return app.setView("meso");
        }
      } else {
        if (data.view === "meso") return app.setView("macro");
      }
    });
  });
  $("#level").attr("title", "click to switch the level");
  $("#search_button").button({
    text: false,
    icons: {
      primary: "ui-icon-search"
    }
  }).click(function(eventObject) {});
  $("#sliderAEdgeWeight").slider({
    range: true,
    values: [app.config.a_edge_filter_min * 100.0, app.config.a_edge_filter_max * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderAEdgeWeight", "filter.a.edge.weight");
    }
  });
  $("#sliderANodeWeight").slider({
    range: true,
    values: [app.config.a_node_filter_min * 100.0, app.config.a_node_filter_max * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderANodeWeight", "filter.a.node.weight");
    }
  });
  $("#sliderBEdgeWeight").slider({
    range: true,
    values: [app.config.b_edge_filter_min * 100.0, app.config.b_edge_filter_max * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderBEdgeWeight", "filter.b.edge.weight");
    }
  });
  $("#sliderBNodeWeight").slider({
    range: true,
    values: [app.config.b_node_filter_min * 100.0, app.config.b_node_filter_max * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderBNodeWeight", "filter.b.node.weight");
    }
  });
  $("#sliderANodeSize").slider({
    value: app.config.a_node_size * 100.0,
    max: 100.0,
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderANodeSize", "filter.a.node.size");
    }
  });
  $("#sliderBNodeSize").slider({
    value: app.config.b_node_size * 100.0,
    max: 100.0,
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderBNodeSize", "filter.b.node.size");
    }
  });
  $("#sliderSelectionZone").slider({
    value: app.config.cursor_size * 300.0,
    max: 300.0,
    animate: true,
    change: function(event, ui) {
      return callSlider("#sliderSelectionZone", "selectionRadius");
    }
  });
  $("#toggle-paused").button({
    icons: {
      primary: "ui-icon-pause"
    },
    text: true,
    label: "pause"
  }).click(function(event) {
    return app.togglePause(function(data) {
      var p;
      p = $("#toggle-paused");
      if (p.button("option", "icons")["primary"] === "ui-icon-pause") {
        p.button("option", "icons", {
          primary: "ui-icon-play"
        });
        return p.button("option", "label", "play");
      } else {
        p.button("option", "icons", {
          primary: "ui-icon-pause"
        });
        return p.button("option", "label", "pause");
      }
    });
  });
  $("#toggle-unselect").button({
    icons: {
      primary: "ui-icon-close"
    }
  }).click(function(event) {
    toolbar.lastsearch = "";
    return app.unselect(function(data) {
      return app.infodiv.reset();
    });
  });
  $("#toggle-recenter").button({
    text: true,
    icons: {
      primary: "ui-icon-home"
    }
  }).click(function(event) {
    return app.recenter(function() {});
  });
  $("#toggle-switch").button({
    text: true,
    icons: {
      primary: "ui-icon-arrows"
    }
  }).click(function(event) {
    return app.getCategory(function(data) {
      var cat, next_cat;
      cat = data.category;
      log("clicked on category switch. cat: " + cat);
      log(data);
      next_cat = app.getOppositeCategory(cat);
      log("opposite cat: " + next_cat);
      return app.getView(function(data) {
        var neighbours, viewName;
        viewName = data.view;
        log("view name: " + viewName);
        if (viewName === "macro") {
          if (next_cat === "Document") {
            show("#category-A");
            hide("#category-B");
          } else if (next_cat === "NGram") {
            hide("#category-A");
            show("#category-B");
          }
        } else {
          show("#category-A");
          show("#category-B");
        }
        neighbours = app.infodiv.neighbours;
        return app.setCategory(next_cat, function(data) {
          log(" category should be set now");
          return app.centerOnSelection(function(data) {
            var myArray, pos;
            if (viewName === "macro") {
              myArray = new Array();
              for (pos in neighbours) {
                myArray.push(neighbours[pos]);
              }
              return app.select(myArray, function() {
                log("selected my array");
                app.infodiv.updateNodeList(viewName, next_cat);
                return app.infodiv.display_current_category();
              });
            } else {
              app.infodiv.updateNodeList(viewName, next_cat);
              return app.infodiv.display_current_category();
            }
          });
        });
      });
    });
  });
  hide("#export-view");
  hide("#search  hide ");
  hide("#level");
  hide("#search_button");
  hide("#toggle-recenter");
  hide("#toggle-switch");
  hide("#toggle-unselect");
  hide("#toggle-paused");
  hide("#cursor-size-block");
  hide("#category-A");
  hide("#category-B");
  return hide("#category-legend");
};

toolbar.updateButton = function(button, state) {
  toolbar.values.buttons[button] = state;
  return $("#toggle-" + button).toggleClass("ui-state-active", state);
};

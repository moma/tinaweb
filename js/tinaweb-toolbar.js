var callSlider, sliderData, toolbar;

callSlider = function(sliderobj, slider) {
  if (sliderData[slider].scheduled !== true) {
    sliderData[slider].scheduled = true;
    return $.doTimeout(sliderData[slider].delay, function() {
      var vals;
      if (sliderData[slider].type === "Tuple2[Double]") {
        vals = $(sliderobj).slider("values");
        tinaviz.set(slider, [vals[0] / sliderData[slider].size, vals[1] / sliderData[slider].size], sliderData[slider].type);
      } else {
        if (sliderData[slider].type === "Double") {
          tinaviz.set(slider, $(sliderobj).slider("value") / sliderData[slider].size, sliderData[slider].type);
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
    return tinaviz.set("filter.map.node.radius", $("#nodeRadiusSelector").val(), "String");
  });
  $("#nodeShapeSelector").change(function() {
    return tinaviz.set("filter.map.node.shape", $("#nodeShapeSelector").val(), "String");
  });
  return $("#nodeColorSelector").change(function() {
    return tinaviz.set("filter.map.node.color", $("#nodeColorSelector").val(), "String");
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
    tinaviz.highlightByPattern(txt, "containsIgnoreCase");
  }
  return setTimeout("toolbar.checkSearchForm()", 200);
};

toolbar.checkSearchFormNoRepeat = function() {
  var txt;
  txt = $("#search_input").val();
  if (txt !== toolbar.lastSearch) {
    toolbar.lastSearch = txt;
    return tinaviz.highlightByPattern(txt, "containsIgnoreCase");
  }
};

toolbar.runSearchFormNoRepeat = function() {
  var txt;
  txt = $("#search_input").val();
  console.log("runSearchFormNoRepeat:" + txt);
  tinaviz.unselect(function() {
    var cat, whenDone;
    tinaviz.infodiv.reset();
    cat = tinaviz.getCategory();
    whenDone = function() {
      if (txt !== "") {
        return tinaviz.centerOnSelection();
      } else {
        return tinaviz.recenter();
      }
    };
    if (cat === "Document") {
      return tinaviz.selectByPattern(txt, "containsIgnoreCase", whenDone);
    } else {
      return tinaviz.selectByPattern(txt, "containsIgnoreCase", whenDone);
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
    return tinaviz.set("export", "GEXF", "String");
  });
  $("#export-png").button({
    text: true
  }).click(function(eventObject) {
    return tinaviz.set("export", "PNG", "String");
  });
  $("#export-pdf").button({
    text: true
  }).click(function(eventObject) {
    return tinaviz.set("export", "PDF", "String");
  });
  $("#level").button({
    text: true,
    icons: {
      primary: "ui-icon-help"
    }
  }).click(function(eventObject) {
    return tinaviz.getView(function(data) {
      if (data.view === "macro") {
        if (tinaviz === void 0 || tinaviz.infodiv.selection.length === 0) {
          return alert("You need to select a node before switching to meso view");
        } else {
          return tinaviz.setView("meso");
        }
      } else {
        if (data.view === "meso") return tinaviz.setView("macro");
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
    values: [parseFloat(prefs.a_edge_filter_min) * 100.0, parseFloat(prefs.a_edge_filter_max) * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderAEdgeWeight", "filter.a.edge.weight");
    }
  });
  $("#sliderANodeWeight").slider({
    range: true,
    values: [parseFloat(prefs.a_node_filter_min) * 100.0, parseFloat(prefs.a_node_filter_max) * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderANodeWeight", "filter.a.node.weight");
    }
  });
  $("#sliderBEdgeWeight").slider({
    range: true,
    values: [parseFloat(prefs.b_edge_filter_min) * 100.0, parseFloat(prefs.b_edge_filter_max) * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderBEdgeWeight", "filter.b.edge.weight");
    }
  });
  $("#sliderBNodeWeight").slider({
    range: true,
    values: [parseFloat(prefs.b_node_filter_min) * 100.0, parseFloat(prefs.b_node_filter_max) * 100.0],
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderBNodeWeight", "filter.b.node.weight");
    }
  });
  $("#sliderANodeSize").slider({
    value: parseFloat(prefs.a_node_size) * 100.0,
    max: 100.0,
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderANodeSize", "filter.a.node.size");
    }
  });
  $("#sliderBNodeSize").slider({
    value: parseFloat(prefs.b_node_size) * 100.0,
    max: 100.0,
    animate: true,
    slide: function(event, ui) {
      return callSlider("#sliderBNodeSize", "filter.b.node.size");
    }
  });
  $("#sliderSelectionZone").slider({
    value: parseFloat(prefs.cursor_size) * 300.0,
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
    return tinaviz.togglePause(function(data) {
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
    return tinaviz.unselect(function(data) {
      return tinaviz.infodiv.reset();
    });
  });
  $("#toggle-recenter").button({
    text: true,
    icons: {
      primary: "ui-icon-home"
    }
  }).click(function(event) {
    return tinaviz.recenter(function() {});
  });
  $("#toggle-switch").button({
    text: true,
    icons: {
      primary: "ui-icon-arrows"
    }
  }).click(function(event) {
    return tinaviz.getCategory(function(data) {
      var cat, next_cat;
      cat = data.category;
      console.log("clicked on category switch. cat: " + cat);
      console.log(data);
      next_cat = tinaviz.getOppositeCategory(cat);
      console.log("opposite cat: " + next_cat);
      return tinaviz.getView(function(data) {
        var neighbours, viewName;
        viewName = data.view;
        console.log("view name: " + viewName);
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
        neighbours = tinaviz.infodiv.neighbours;
        return tinaviz.setCategory(next_cat, function(data) {
          console.log(" category should be set now");
          return tinaviz.centerOnSelection(function(data) {
            var myArray, pos;
            if (viewName === "macro") {
              myArray = new Array();
              for (pos in neighbours) {
                myArray.push(neighbours[pos]);
              }
              return tinaviz.select(myArray, function() {
                console.log("selected my array");
                tinaviz.infodiv.updateNodeList(viewName, next_cat);
                return tinaviz.infodiv.display_current_category();
              });
            } else {
              tinaviz.infodiv.updateNodeList(viewName, next_cat);
              return tinaviz.infodiv.display_current_category();
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

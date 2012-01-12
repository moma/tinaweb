var checkDemoMode, delay, demo, repeat, status, tinaviz, unlockDemo;

delay = function(t, f) {
  console.log("t: " + t);
  console.log("t");
  console.log("f: " + f);
  console.log("f");
  return setTimeout(f, t);
};

repeat = function(t, f) {
  return setInterval(f, t);
};

demo = false;

unlockDemo = false;

checkDemoMode = function() {
  tinaviz.centerOnSelection();
  return tinaviz.getView(function(data) {
    var nbNeighbourhoods, nbNeighbours, neighbourhood, node, randNeighbour, randNeighbourhood, view;
    view = data.view;
    if (view === "macro") {
      if (Math.floor(Math.random() * 8) < 2) tinaviz.unselect();
      if (Math.floor(Math.random() * 5) > 1) {
        if (Math.floor(Math.random() * 5) > 1) {
          return tinaviz.getCategory(function(data) {
            var cat, nb_nodes, randomIndex, randomNode;
            cat = data.category;
            nb_nodes = tinaviz.infodiv.node_list_cache[cat].length;
            randomIndex = Math.floor(Math.random() * nb_nodes);
            randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex];
            if (randomNode !== void 0 || !(typeof node !== "undefined" && node !== null)) {
              tinaviz.unselect();
              tinaviz.infodiv.reset();
              return tinaviz.select(randomNode.id);
            }
          });
        } else {
          return tinaviz.getCategory(function(cat) {
            var nb_nodes, randomIndex, randomNode;
            nb_nodes = tinaviz.infodiv.node_list_cache[cat].length;
            randomIndex = Math.floor(Math.random() * nb_nodes);
            randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex];
            if (randomNode !== void 0 || !(typeof node !== "undefined" && node !== null)) {
              return tinaviz.viewMeso(randomNode.id, cat);
            }
          });
        }
      } else {
        return $("#toggle-switch").click();
      }
    } else {
      if (Math.floor(Math.random() * 5) > 1) {
        nbNeighbourhoods = tinaviz.infodiv.neighbours.length;
        if (nbNeighbourhoods > 0 && Math.floor(Math.random() * 16) < 14) {
          randNeighbourhood = Math.floor(Math.random() * nbNeighbourhoods);
          neighbourhood = tinaviz.infodiv.neighbours[randNeighbourhood];
          nbNeighbours = 0;
          if (neighbourhood !== void 0 & (neighbourhood != null)) {
            nbNeighbours = neighbourhood.length;
          }
          if (nbNeighbours === 0) {
            return tinaviz.getView(function(data) {
              if (data.view === "meso") return $("#level").click();
            });
          } else {
            randNeighbour = Math.floor(Math.random() * nbNeighbours);
            node = neighbourhood[randNeighbour];
            if (node !== void 0 || !(node != null)) {
              return tinaviz.getView(function(view) {
                if (data.view === "meso") {
                  return tinaviz.unselect(function() {
                    tinaviz.infodiv.reset();
                    return tinaviz.select(node);
                  });
                } else {
                  tinaviz.infodiv.reset();
                  return tinaviz.select(node);
                }
              });
            }
          }
        } else {
          return $("#toggle-switch").click();
        }
      } else {
        return $("#level").click();
      }
    }
  });
};

tinaviz = {};

status = "none";

$(document).ready(function() {
  var size;
  size = resize();
  tinaviz = new Tinaviz({
    tag: $("#vizdiv"),
    width: size.w,
    height: size.h,
    path: $("meta[name=tinaviz]").attr("content"),
    logo: "css/logo.png",
    init: function() {
      var checkLoadingStatus, delayBetweenChanges, firstTimeOpen, layout_name, urlVars, waitTimeBeforeStartingDemo, x;
      console.log("tinaviz main: init()");
      urlVars = getUrlVars();
      for (x in urlVars) {
        prefs[x] = urlVars[x];
      }
      layout_name = prefs.layout;
      if (layout_name === "phyloforce") {
        tinaviz.infodiv = PhyloInfoDiv;
      } else {
        tinaviz.infodiv = InfoDiv;
      }
      tinaviz.infodiv.id = "infodiv";
      tinaviz.infodiv.label = $("#node_label");
      tinaviz.infodiv.contents = $("#node_contents");
      tinaviz.infodiv.cloud = $("#node_neighbourhood");
      tinaviz.infodiv.cloudSearch = $("#node_neighbourhoodForSearch");
      tinaviz.infodiv.cloudSearchCopy = $("#node_neighbourhoodCopy");
      tinaviz.infodiv.unselect_button = $("#toggle-unselect");
      tinaviz.infodiv.node_table = $("#node_table > tbody");
      tinaviz.infodiv.categories = {
        NGram: "Keywords",
        Document: "Projects"
      };
      $("#infodiv").accordion({
        fillSpace: true
      });
      tinaviz.infodiv.reset();
      toolbar.init();
      tinaviz.set("filter.a.edge.weight", [parseFloat(prefs.a_edge_filter_min), parseFloat(prefs.a_edge_filter_max)], "Tuple2[Double]");
      tinaviz.set("filter.a.node.weight", [parseFloat(prefs.a_node_filter_min), parseFloat(prefs.a_node_filter_max)], "Tuple2[Double]");
      tinaviz.set("filter.b.edge.weight", [parseFloat(prefs.b_edge_filter_min), parseFloat(prefs.b_edge_filter_max)], "Tuple2[Double]");
      tinaviz.set("filter.b.node.weight", [parseFloat(prefs.b_node_filter_min), parseFloat(prefs.b_node_filter_max)], "Tuple2[Double]");
      tinaviz.set("filter.a.node.size", parseFloat(prefs.a_node_size), "Double");
      tinaviz.set("filter.b.node.size", parseFloat(prefs.b_node_size), "Double");
      tinaviz.set("filter.node.category", prefs.category, "String");
      tinaviz.set("selectionRadius", parseFloat(prefs.cursor_size), "Double");
      tinaviz.set("layout", prefs.layout, "String");
      tinaviz.set("layoutSpeed", prefs.layout_speed, "Int");
      tinaviz.set("pause", prefs.pause, "Boolean");
      if (prefs.demo === "true") unlockDemo = true;
      waitTimeBeforeStartingDemo = 6;
      delayBetweenChanges = 10;
      $.fn.nap.standbyTime = waitTimeBeforeStartingDemo;
      $(document).nap((function() {
        return $.doTimeout("demo_loop", delayBetweenChanges * 1000, function() {
          if (!demo) {
            return false;
          } else {
            runDemo();
            return true;
          }
        });
      }), function() {
        return $.doTimeout("demo_loop");
      });
      checkLoadingStatus = function() {
        if (status !== "loaded") {
          $("#appletInfo").text($("#appletInfo").text() + ".");
          return delay(400, checkLoadingStatus);
        }
      };
      firstTimeOpen = function(data) {
        status = data.status;
        if (status === "downloading") {
          $("#appletInfo").effect("pulsate", "fast");
          $("#appletInfo").text("Downloading data..");
          $("#appletInfo").fadeIn();
          return checkLoadingStatus();
        } else if (status === "downloaded") {
          $("#appletInfo").effect("pulsate", "fast");
          return $("#appletInfo").text("Generating graph..");
        } else if (status === "updated") {
          return delay(100, function() {
            var h, w, _ref;
            _ref = resize(), w = _ref.w, h = _ref.h;
            return tinaviz.size(w, h);
          });
        } else if (status === "loaded") {
          console.log("graph loaded");
          console.log("update the node list (may fail)");
          tinaviz.infodiv.updateNodeList("macro", prefs.category);
          console.log("displaying current category");
          tinaviz.infodiv.display_current_category();
          console.log("displaying current view");
          tinaviz.infodiv.display_current_view();
          $("#appletInfo").text("Graph generated, please wait..");
          delay(100, function() {
            $("#toggle-paused").fadeIn("slow");
            return delay(200, function() {
              $("#toggle-switch").fadeIn("slow");
              return delay(200, function() {
                $("#level").fadeIn("slow");
                return delay(200, function() {
                  $("#cursor-size-block").fadeIn("slow");
                  return delay(400, function() {
                    $("#category-A").fadeIn("slow");
                    $("#category-legend").fadeIn("slow");
                    return delay(300, function() {
                      $("#search").fadeIn("slow");
                      $("#search_button").fadeIn("slow");
                      return delay(200, function() {
                        $("#toggle-recenter").fadeIn("slow");
                        return delay(100, function() {
                          $("#export-gexf").fadeIn("slow");
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
              return tinaviz.select(prefs.node_id);
            });
          }
          if (prefs.search !== "") {
            $("#search_input").val(prefs.search);
            return tinaviz.selectByPattern(prefs.search, "containsIgnoreCase");
          }
        } else if (status === "error") {
          return $("#notification").notify("create", {
            title: "Tinasoft Notification",
            text: "Error loading the network, please consult logs"
          });
        } else {
          return console.log("unknow status " + status);
        }
      };
      if (prefs.gexf !== void 0) {
        return tinaviz.open("" + prefs.gexf, firstTimeOpen);
      }
    },
    selectionChanged: function(data) {
      var active, selectionIsEmpty;
      console.log("-- selectionChanged: " + data.selection);
      active = $("#infodiv").accordion("option", "active");
      selectionIsEmpty = Object.size(data.selection) === 0;
      console.log("selectionIsEmpty: " + selectionIsEmpty);
      if (!selectionIsEmpty && active !== 0) {
        console.log("selection is not empty, and active tab is not 0");
        $("#infodiv").accordion("activate", 0);
      } else if (selectionIsEmpty && active !== "false") {
        console.log("selection is empty and active is not false");
        $("infodiv").accordion("activate", 0);
      }
      if (data.mouse === "left") {} else if (data.mouse === "right") {} else if (data.mouse === "doubleLeft") {
        console.log("double click on left mouse:");
        tinaviz.setView("meso", function() {
          return tinaviz.getCategory(function(data2) {
            console.log("switching to " + data2.category);
            return tinaviz.setCategory(data2.category, function() {
              return tinaviz.centerOnSelection(function() {
                tinaviz.infodiv.updateNodeList("meso", data2.category);
                return tinaviz.infodiv.display_current_category();
              });
            });
          });
        });
      }
      return tinaviz.infodiv.update(data.view, data.selection);
    },
    neighbourhood: function(data) {
      console.log("getNeighbourhood");
      return tinaviz.infodiv.updateTagCloud(data.selection, data.neighbours);
    },
    categoryChanged: function(data) {
      return console.log("categoryChanged: " + data.category);
    },
    viewChanged: function(data) {
      var view;
      console.log("main: view changed! " + data.view);
      view = data.view;
      return tinaviz.getCategory(function(data) {
        var category, level, title;
        category = data.category;
        console.log("viewChanged:");
        console.log(view);
        console.log("category:");
        console.log(category);
        tinaviz.infodiv.updateNodeList(view, category);
        tinaviz.infodiv.display_current_category();
        tinaviz.infodiv.display_current_view();
        level = $("#level");
        level.button("option", "label", view + " level");
        title = $("#infodiv > h3:first");
        if (view === "macro") {
          if (cat === "Document") {
            $("#category-A").fadeIn();
            $("#category-B").fadeOut();
          } else if (cat === "NGram") {
            $("#category-A").fadeOut();
            $("#category-B").fadeIn();
          }
          level.removeClass("ui-state-highlight");
          return title.removeClass("ui-state-highlight");
        } else {
          $("#category-A").fadeIn();
          $("#category-B").fadeIn();
          level.addClass("ui-state-highlight");
          title.addClass("ui-state-highlight");
          return tinaviz.recenter();
        }
      });
    }
  });
  return $(window).bind("resize", function() {
    var h, w, _ref;
    _ref = resize(), w = _ref.w, h = _ref.h;
    return tinaviz.size(w, h);
  });
});

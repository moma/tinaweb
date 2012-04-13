var InfoDiv, callSlider, checkDemoMode, completion, delay, demo, displayNodeRow, getGraph, graphUrl, ids, repeat, sliderData, status, tinaviz, toolbar, unlockDemo;

displayNodeRow = function(label, id, category) {
  return $("#node_table > tbody").append($("<tr></tr>").append($("<td id='node_list_" + id + "'></td>").text(label).click(function(eventObject) {
    return tinaviz.viewMeso(id, category);
  })));
};

InfoDiv = {
  id: null,
  selection: [],
  neighbours: [],
  node_list_cache: {},
  last_category: "",
  node_table: null,
  label: null,
  contents: null,
  cloud: null,
  cloudSearch: null,
  cloudSearchCopy: null,
  unselect_button: null,
  categories: {
    NGram: "Keyphrases",
    Document: "Documents"
  },
  display_current_category: function() {
    var categories;
    categories = this.categories;
    return tinaviz.getView(function(data) {
      var view;
      view = data.view;
      return tinaviz.getCategory(function(data) {
        var cat;
        cat = data.category;
        if (view === "macro") {
          return $("#toggle-switch").button("option", "label", categories[cat]);
        } else {
          return $("#toggle-switch").button("option", "label", categories[cat] + " neighbours");
        }
      });
    });
  },
  display_current_view: function() {
    return tinaviz.getView(function(data) {
      var level, title, view;
      view = data.view;
      if (view !== void 0) {
        level = $("#level");
        level.button("option", "label", view + " level");
        title = $("#infodiv > h3:first");
        if (view === "meso") {
          level.addClass("ui-state-highlight");
          return title.addClass("ui-state-highlight");
        } else {
          level.removeClass("ui-state-highlight");
          return title.removeClass("ui-state-highlight");
        }
      }
    });
  },
  mergeNeighbours: function(category, neighbours) {
    var merged, neighb, node;
    merged = [];
    for (node in neighbours) {
      for (neighb in neighbours[node]) {
        if (neighb in merged) {
          merged[neighb]["degree"]++;
        } else if (neighbours[node][neighb]["category"] !== category) {
          merged[neighb] = {
            spanid: neighb,
            id: neighbours[node][neighb]["id"],
            label: neighbours[node][neighb]["label"],
            degree: 1,
            weight: neighbours[node][neighb]["weight"],
            category: neighbours[node][neighb]["category"]
          };
        }
      }
    }
    this.neighbours = Object.keys(merged);
    merged = numericListSort(Object.values(merged), "degree");
    return merged;
  },
  updateTagCloud: function(node_list, neighbours) {
    if (Object.size(node_list) === 0) return;
    return tinaviz.getCategory(function(data) {
      var Googlerequests, PubMedrequests, cat, const_doc_tag, i, nb_displayed_tag, oppositeRealName, requests, sizecoef, tag, tagLabel, tagcloud, tagspan, tmp, tooltip;
      cat = data.category;
      neighbours = this.mergeNeighbours(cat, neighbours);
      this.cloudSearch.empty();
      Googlerequests = "http://www.google.com/#q=";
      PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term=";
      requests = "";
      i = 0;
      while (i < neighbours.length) {
        tag = neighbours[i];
        tagLabel = tag.label;
        tagLabel = jQuery.trim(tagLabel);
        requests = requests + "%22" + tagLabel.replace(" ", "+") + "%22";
        if (i < neighbours.length - 1) requests = requests + "+AND+";
        i++;
      }
      if (cat !== void 0) {
        oppositeRealName = this.categories[tinaviz.getOppositeCategory(cat)];
        if (oppositeRealName !== void 0) {
          tmp = "";
          tmp = "Search on: <a href=\"";
          tmp += Googlerequests;
          tmp += requests;
          tmp += "\" alt=\"search on google\" target=\"_BLANK\"><img src=\"";
          tmp += tinaviz.getPath();
          tmp += "css/branding/google.png\" />Google</a> &nbsp;";
          tmp += " <a href=\"" + PubMedrequests + requests;
          tmp += "\" alt=\"search on PubMed\" target=\"_BLANK\"><img src=\"";
          tmp += tinaviz.getPath();
          tmp += "css/branding/pubmed.png\" />Pubmed</a>";
          this.cloudSearch.append(tmp);
        }
      }
      sizecoef = 15;
      const_doc_tag = 12;
      tooltip = "";
      tagcloud = $("<p></p>");
      nb_displayed_tag = 0;
      i = 0;
      while (i < neighbours.length) {
        if (nb_displayed_tag < 20) {
          nb_displayed_tag++;
          tag = neighbours[i];
          tagspan = $("<span id='" + tag.spanid + "'></span>");
          tagspan.addClass("ui-widget-content");
          tagspan.addClass("viz_node");
          tagspan.html(tag.label);
          (function() {
            var attached_cat, attached_id;
            attached_id = tag.id;
            attached_cat = tag.category;
            return tagspan.click(function() {
              return tinaviz.viewMeso(attached_id, attached_cat, function() {});
            });
          })();
          if (neighbours.length === 1) {
            if (tag["category"] === "Document") {
              tagspan.css("font-size", const_doc_tag);
            } else {
              tagspan.css("font-size", Math.floor(sizecoef * (Math.min(20, Math.log(1.5 + tag.weight)))));
            }
            tooltip = "click on a label to switch to its meso view - size is proportional to edge weight";
          } else {
            tagspan.css("font-size", Math.max(Math.floor(sizecoef * Math.min(2, Math.log(1.5 + tag.degree))), 15));
            tooltip = "click on a label to switch to its meso view - size is proportional to the degree";
          }
          tagcloud.append(tagspan);
          if (i !== neighbours.length - 1 && neighbours.length > 1) {
            tagcloud.append(", &nbsp;");
          }
        } else if (nb_displayed_tag === 20) {
          tagcloud.append("[...]");
          nb_displayed_tag++;
        } else {
          break;
        }
        i++;
      }
      this.cloud.empty();
      this.cloud.append("<h3>selection related to " + oppositeRealName + ": <span class=\"ui-icon ui-icon-help icon-right\" title=\"" + tooltip + "\"></span></h3>");
      this.cloud.append(tagcloud);
      this.cloudSearchCopy.empty();
      this.cloudSearchCopy.append("<h3>global search on " + oppositeRealName + ": <span class=\"ui-icon ui-icon-help icon-right\" title=\"" + tooltip + "\"></span></h3>");
      return this.cloudSearchCopy.append(tagcloud.clone());
    });
  },
  updateInfo: function(lastselection) {
    return tinaviz.getCategory(function(data) {
      var cat, contentinnerdiv, htmlContent, id, label, labelinnerdiv, node, number_of_label;
      cat = data.category;
      labelinnerdiv = $("<div></div>");
      contentinnerdiv = $("<div></div>");
      number_of_label = 0;
      for (id in lastselection) {
        node = lastselection[id];
        if (node.category === cat) {
          label = this.getNodeLabel(node);
          number_of_label++;
          if (number_of_label < 5) {
            labelinnerdiv.append($("<b></b>").text(label));
          } else {
            if (number_of_label === 5) {
              labelinnerdiv.append($("<b></b>").text("[...]"));
            }
          }
          this.selection.push(node.id);
          console.log("label: " + label);
          contentinnerdiv.append($("<b></b>").text(label));
          htmlContent = htmlDecode(decodeJSON(node.content));
          console.log("  htmlContent: " + htmlContent);
          contentinnerdiv.append($("<p></p>").html(htmlContent));
          contentinnerdiv.append($("<p></p>").html(this.getSearchQueries(label, cat)));
        }
      }
      if (this.selection.length !== 0) {
        this.label.empty();
        this.unselect_button.show();
        this.contents.empty();
        this.label.append(alphabeticJquerySort(labelinnerdiv, "b", ", &nbsp;"));
        return this.contents.append(contentinnerdiv);
      } else {
        return this.reset();
      }
    });
  },
  update: function(view, lastselection) {
    if (this.id == null) {
      alert("error : infodiv not initialized with its HTML DIV id");
      return;
    }
    if (Object.size(lastselection) === 0) {
      this.reset();
      return;
    }
    this.selection = [];
    this.updateInfo(lastselection);
    return tinaviz.getNeighbourhood("macro", this.selection, function(data) {
      return console.log("received neighbourhood");
    });
  },
  reset: function() {
    if (this.id == null) {
      alert("error : infodiv not initialized with its HTML DIV id");
      return;
    }
    this.unselect_button.hide();
    this.contents.empty().append($("<h4></h4>").html("click on a node to begin exploration"));
    this.contents.empty().append($("<h4></h4>").html("<h2>Navigation tips</h2>" + "<p align='left'>" + "<br/>" + "<i>Basic interactions</i><br/><br/>" + "Click on a node to select/unselect and get its information.  In case of multiple selection, the button <img src='" + tinaviz.getPath() + "css/branding/unselect.png' alt='unselect' align='top' height=20/>  clears all selections.<br/><br/>The switch button <img src='" + tinaviz.getPath() + "css/branding/switch.png' alt='switch' align='top' height=20 /> allows to change the view type." + "<br/><br/>" + "<i>Graph manipulation</i><br/><br/>" + "Link and node sizes indicate their strength.<br/><br/> To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.<br/><br/> To select a more of less specific area of the graph, use the 'nodes filter' slider.</b><br/><br/>" + "<i>Micro/Macro view</i><br/><br/>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.<br/><br/>  " + "Click on the 'all nodes' tab below to view the full clickable list of nodes.<br/><br/>Find additional tips with mouse over the question marks." + "</p>"));
    this.cloudSearchCopy.empty();
    this.cloudSearch.empty();
    this.cloud.empty();
    this.selection = [];
    this.neighbours = [];
    this.last_category = "";
  },
  updateNodeList: function(view, category) {
    var whenReceivingNodeList, _this;
    this.display_current_category();
    if (category === this.last_category) return;
    if (tinaviz.node_list_cache === void 0) tinaviz.node_list_cache = {};
    _this = this;
    whenReceivingNodeList = function(data) {
      var i, node_list, _results;
      console.log("receiving and updating node.list: " + data.nodes.length + " nodes");
      if (category === _this.last_category) return;
      if (_this.node_list_cache === void 0) _this.node_list_cache = {};
      _this.node_list_cache[category] = alphabeticListSort(data.nodes, "label");
      _this.node_table.empty();
      _this.last_category = category;
      node_list = _this.node_list_cache[category];
      if (node_list != null) {
        i = 0;
        _results = [];
        while (i < node_list.length) {
          (function() {
            var rowCat, rowId, rowLabel;
            rowLabel = htmlDecode(decodeJSON(node_list[i]["label"]));
            rowId = decodeJSON(node_list[i]["id"]);
            rowCat = category;
            return setTimeout("displayNodeRow(\"" + rowLabel + "\",\"" + rowId + "\",\"" + rowCat + "\")", 0);
          })();
          _results.push(i++);
        }
        return _results;
      }
    };
    return tinaviz.getNodes(view, category, whenReceivingNodeList);
  },
  getSearchQueries: function(label, cat) {
    var SearchQuery;
    SearchQuery = label.replace(RegExp(" ", "g"), "+");
    if (cat === "Document") {
      return $("<p></p>").html("<a href=\"http://www.google.com/#hl=en&source=hp&q=%20" + SearchQuery.replace(",", "OR") + "%20\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/google.png\" height=15 width=15> </a><a href=\"http://en.wikipedia.org/wiki/" + label.replace(RegExp(" ", "g"), "_") + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/wikipedia.png\" height=15 width=15> </a><a href=\"http://www.flickr.com/search/?w=all&q=" + SearchQuery + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/flickr.png\" height=15 width=15> </a>");
    } else if (cat === "NGram") {
      return $("<p></p>").html("<a href=\"http://www.google.com/#hl=en&source=hp&q=%20" + SearchQuery.replace(",", "OR") + "%20\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/google.png\" height=15 width=15> </a><a href=\"http://en.wikipedia.org/wiki/" + label.replace(RegExp(" ", "g"), "_") + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/wikipedia.png\" height=15 width=15> </a><a href=\"http://www.flickr.com/search/?w=all&q=" + SearchQuery + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/flickr.png\" height=15 width=15> </a>");
    } else {
      return $("<p></p>");
    }
  }
};

delay = exports.delay = function(t, f) {
  return setTimeout(f, t);
};

repeat = exports.repeat = function(t, f) {
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
          return delay(400, function() {
            return checkLoadingStatus();
          });
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

tinaviz = {};

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
            $("#category-A").fadeIn("slow");
            $("#category-B").fadeOut("slow");
          } else if (next_cat === "NGram") {
            $("#category-A").fadeOut("slow");
            $("#category-B").fadeIn("slow");
          }
        } else {
          $("#category-A").fadeIn("slow");
          $("#category-B").fadeIn("slow");
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
  $("#export-view").hide();
  $("#search").hide();
  $("#export-gexf").hide();
  $("#level").hide();
  $("#search_button").hide();
  $("#toggle-recenter").hide();
  $("#toggle-switch").hide();
  $("#toggle-unselect").hide();
  $("#toggle-paused").hide();
  $("#cursor-size-block").hide();
  $("#category-A").hide();
  $("#category-B").hide();
  return $("#category-legend").hide();
};

toolbar.updateButton = function(button, state) {
  toolbar.values.buttons[button] = state;
  return $("#toggle-" + button).toggleClass("ui-state-active", state);
};

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

ids = 0;

completion = {};

graphUrl = "";

getGraph = function() {
  return graphUrl;
};

$(document).ready(function() {
  var cache, popfilter, xhrs;
  popfilter = function(label, type, options) {
    var footer, header, id, id1, id2, input, labelization;
    id = ids++;
    id1 = "filter" + id;
    id2 = "combo" + id;
    header = "<li id=\"" + id1 + "\" class=\"filter\" style=\"padding-top: 5px;\">";
    labelization = "<span style=\"color: #fff;\">&nbsp; " + label + " </span>";
    input = "<input type=\"text\" id=\"" + id2 + "\" class=\"medium filter" + type + "\" placeholder=\"" + type + "\" />";
    footer = "</li>;";
    $(header + labelization + input + footer).insertBefore("#refine");
    $("#" + id2).catcomplete({
      minLength: 2,
      source: function(request, response) {
        var term;
        term = request.term;
        return $.getJSON("autocomplete.php", {
          category: type,
          term: request.term
        }, function(data, status, xhr) {
          return response(data.results);
        });
      }
    });
    $("#" + id1 + "").hide();
    $("#" + id1 + "").fadeIn(500);
    return false;
  };
  jQuery(".unselectable").disableTextSelect();
  $(".unselectable").hover((function() {
    return $(this).css("cursor", "default");
  }), function() {
    return $(this).css("cursor", "auto");
  });
  $("#search-form").hide();
  $(".topbar").hover((function() {
    return $(this).stop().animate({
      opacity: 0.98
    }, "fast");
  }), function() {
    return $(this).stop().animate({
      opacity: 0.93
    }, "fast");
  });
  $.widget("custom.catcomplete", $.ui.autocomplete, {
    _renderMenu: function(ul, items) {
      var categories, self;
      self = this;
      categories = _.groupBy(items, function(o) {
        return o.category;
      });
      return _.each(categories, function(data, category) {
        var size, term, total;
        size = 0;
        total = 0;
        term = "";
        _.each(data, function(item) {
          size = item.size;
          total = item.total;
          term = item.term;
          return self._renderItem(ul, item);
        });
        ul.append("<li class='ui-autocomplete-category'>" + size + "/" + total + " results</li>");
        console.log(term);
        return ul.highlight(term);
      });
    }
  });
  cache = {};
  xhrs = {};
  $("#addfiltercountry").click(function() {
    return popfilter("in", "countries", []);
  });
  $("#addfilterorganization").click(function() {
    return popfilter("from", "organizations", []);
  });
  $("#addfilterlaboratory").click(function() {
    var prefix;
    prefix = "working";
    return popfilter(prefix + " at", "laboratories", []);
  });
  $("#addfilterkeyword").click(function() {
    var prefix;
    prefix = "working";
    return popfilter(prefix + " on", "keywords", []);
  });
  $("#addfiltertag").click(function() {
    return popfilter("tagged", "tags", []);
  });
  $("#loading").fadeOut();
  $("#example").click(function() {
    $(".hero-unit").fadeOut("slow");
    return $("#welcome").fadeOut("slow", function() {
      return $("#loading").fadeIn("fast");
    });
  });
  return $("#generate").click(function() {
    $(".hero-unit").fadeOut("slow");
    $("#welcome").fadeOut("slow", function() {
      var collect, query, url;
      $("#loading").fadeIn("fast");
      console.log("loading");
      collect = function(k) {
        var t;
        t = [];
        console.log("collecting " + ".filter" + k + "");
        $(".filter" + k + "").each(function(i, e) {
          var value;
          value = $(e).val();
          if (value === void 0) return;
          value = value.replace(/^\s+/g, "").replace(/\s+$/g, "");
          if (value === "" || value === " ") return t.push(value);
        });
        return t;
      };
      console.log("collecting..");
      query = {
        categorya: $("#categorya :selected").text(),
        categoryb: $("#categoryb :selected").text(),
        keywords: collect("keywords"),
        countries: collect("countries"),
        laboratories: collect("laboratories"),
        coloredby: [],
        tags: collect("tags"),
        organizations: collect("organizations")
      };
      console.log(query);
      url = "getgraph.php?query=" + encodeURIComponent(JSON.stringify(query));
      console.log(url);
      graphUrl = url;
      return $("#visualization").html("<iframe src=\"tinaframe.html\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>");
    });
    return false;
  });
});

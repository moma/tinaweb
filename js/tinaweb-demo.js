var checkDemoMode;

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

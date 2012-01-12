checkDemoMode = ->
  tinaviz.centerOnSelection()
  tinaviz.getView (data) ->
    view = data.view
    if view == "macro"
      tinaviz.unselect()  if Math.floor(Math.random() * 8) < 2
      if Math.floor(Math.random() * 5) > 1
        if Math.floor(Math.random() * 5) > 1
          tinaviz.getCategory (data) ->
            cat = data.category
            nb_nodes = tinaviz.infodiv.node_list_cache[cat].length
            randomIndex = Math.floor(Math.random() * (nb_nodes))
            randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex]
            if randomNode != undefined or not node?
              tinaviz.unselect()
              tinaviz.infodiv.reset()
              tinaviz.select randomNode.id
        else
          tinaviz.getCategory (cat) ->
            nb_nodes = tinaviz.infodiv.node_list_cache[cat].length
            randomIndex = Math.floor(Math.random() * (nb_nodes))
            randomNode = tinaviz.infodiv.node_list_cache[cat][randomIndex]
            tinaviz.viewMeso randomNode.id, cat  if randomNode != undefined or not node?
      else
        $("#toggle-switch").click()
    else
      if Math.floor(Math.random() * 5) > 1
        nbNeighbourhoods = tinaviz.infodiv.neighbours.length
        if nbNeighbourhoods > 0 and Math.floor(Math.random() * 16) < 14
          randNeighbourhood = Math.floor(Math.random() * nbNeighbourhoods)
          neighbourhood = tinaviz.infodiv.neighbours[randNeighbourhood]
          nbNeighbours = 0
          nbNeighbours = neighbourhood.length  if neighbourhood != undefined & neighbourhood?
          if nbNeighbours == 0
            tinaviz.getView (data) ->
              $("#level").click()  if data.view == "meso"
          else
            randNeighbour = Math.floor(Math.random() * nbNeighbours)
            node = neighbourhood[randNeighbour]
            if node != undefined or not node?
              tinaviz.getView (view) ->
                if data.view == "meso"
                  tinaviz.unselect ->
                    tinaviz.infodiv.reset()
                    tinaviz.select node
                else
                  tinaviz.infodiv.reset()
                  tinaviz.select node
        else
          $("#toggle-switch").click()
      else
        $("#level").click()
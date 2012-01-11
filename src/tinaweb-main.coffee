delay = exports.delay = (t,f) -> setTimeout f, t

repeat = exports.repeat = (t,f) -> setInterval f, t


demo = false
unlockDemo = false
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

tinaviz = {}
status = "none"
$(document).ready ->
  size = resize()
  tinaviz = new Tinaviz
    tag: $ "#vizdiv"
    width: size.w
    height: size.h
    path: $("meta[name=tinaviz]").attr("content")
    logo: "css/logo.png"
    init: ->
      console.log "tinaviz main: init()"
      urlVars = getUrlVars()
      for x of urlVars
        prefs[x] = urlVars[x]
      layout_name = prefs.layout
      if layout_name == "phyloforce"
        tinaviz.infodiv = PhyloInfoDiv
      else
        tinaviz.infodiv = InfoDiv
      tinaviz.infodiv.id = "infodiv"
      tinaviz.infodiv.label = $("#node_label")
      tinaviz.infodiv.contents = $("#node_contents")
      tinaviz.infodiv.cloud = $("#node_neighbourhood")
      tinaviz.infodiv.cloudSearch = $("#node_neighbourhoodForSearch")
      tinaviz.infodiv.cloudSearchCopy = $("#node_neighbourhoodCopy")
      tinaviz.infodiv.unselect_button = $("#toggle-unselect")
      tinaviz.infodiv.node_table = $("#node_table > tbody")
      tinaviz.infodiv.categories = 
        NGram: "Keywords"
        Document: "Projects"
      
      $("#infodiv").accordion fillSpace: true
      tinaviz.infodiv.reset()
      toolbar.init()
      tinaviz.set "filter.a.edge.weight", [ parseFloat(prefs.a_edge_filter_min), parseFloat(prefs.a_edge_filter_max) ], "Tuple2[Double]"
      tinaviz.set "filter.a.node.weight", [ parseFloat(prefs.a_node_filter_min), parseFloat(prefs.a_node_filter_max) ], "Tuple2[Double]"
      tinaviz.set "filter.b.edge.weight", [ parseFloat(prefs.b_edge_filter_min), parseFloat(prefs.b_edge_filter_max) ], "Tuple2[Double]"
      tinaviz.set "filter.b.node.weight", [ parseFloat(prefs.b_node_filter_min), parseFloat(prefs.b_node_filter_max) ], "Tuple2[Double]"
      tinaviz.set "filter.a.node.size", parseFloat(prefs.a_node_size), "Double"
      tinaviz.set "filter.b.node.size", parseFloat(prefs.b_node_size), "Double"
      tinaviz.set "filter.node.category", prefs.category, "String"
      tinaviz.set "selectionRadius", parseFloat(prefs.cursor_size), "Double"
      tinaviz.set "layout", prefs.layout, "String"
      tinaviz.set "layoutSpeed", prefs.layout_speed, "Int"
      tinaviz.set "pause", prefs.pause, "Boolean"
      unlockDemo = true  if prefs.demo == "true"
      waitTimeBeforeStartingDemo = 6
      delayBetweenChanges = 10
      $.fn.nap.standbyTime = waitTimeBeforeStartingDemo
      $(document).nap (->
        $.doTimeout "demo_loop", delayBetweenChanges * 1000, ->
          unless demo
            false
          else
            runDemo()
            true
      ), ->
        $.doTimeout "demo_loop"
      
      checkLoadingStatus = ->
        unless status == "loaded"
          $("#appletInfo").text $("#appletInfo").text() + "."
          delay 400, ->
            checkLoadingStatus()

      firstTimeOpen = (data) ->
        status = data.status
        if status == "downloading"
          $("#appletInfo").effect "pulsate", "fast"
          $("#appletInfo").text "Downloading data.."
          $("#appletInfo").fadeIn()
          checkLoadingStatus()
        else if status == "downloaded"
          $("#appletInfo").effect "pulsate", "fast"
          $("#appletInfo").text "Generating graph.."
        else if status == "updated"
          delay 100, ->
            {w,h} = resize()
            tinaviz.size w, h

        else if status == "loaded"
          console.log "graph loaded"
          console.log "update the node list (may fail)"
          tinaviz.infodiv.updateNodeList "macro", prefs.category
          console.log "displaying current category"
          tinaviz.infodiv.display_current_category()
          console.log "displaying current view"
          tinaviz.infodiv.display_current_view()
          $("#appletInfo").text "Graph generated, please wait.."
          delay 100, ->
            $("#toggle-paused").fadeIn "slow"
            delay 200, ->
              $("#toggle-switch").fadeIn "slow"
              delay 200, ->
                $("#level").fadeIn "slow"
                delay 200, ->
                  $("#cursor-size-block").fadeIn "slow"
                  delay 400, ->
                    $("#category-A").fadeIn "slow"
                    $("#category-legend").fadeIn "slow"
                    delay 300, ->
                      $("#search").fadeIn "slow"
                      $("#search_button").fadeIn "slow"
                      delay 200, ->
                        $("#toggle-recenter").fadeIn "slow"
                        delay 100, ->
                          $("#export-gexf").fadeIn "slow"
                          delay 1000, ->
                            $("#appletInfo").animate 
                              opacity: "toggle"
                              height: "toggle"
                            , "slow", ->

          unless prefs.node_id == ""
            delay 200, ->
              tinaviz.select prefs.node_id
          unless prefs.search == ""
            $("#search_input").val prefs.search
            tinaviz.selectByPattern prefs.search, "containsIgnoreCase"
        else if status == "error"
          $("#notification").notify "create", 
            title: "Tinasoft Notification"
            text: "Error loading the network, please consult logs"
        else
          console.log "unknow status " + status
      
      tinaviz.open "" + prefs.gexf, firstTimeOpen  if prefs.gexf != undefined
    
    selectionChanged: (data) ->
      console.log "-- selectionChanged: " + data.selection
      active = $("#infodiv").accordion "option", "active"
      selectionIsEmpty = (Object.size(data.selection) == 0)
      console.log "selectionIsEmpty: " + selectionIsEmpty
      if not selectionIsEmpty and active != 0
        console.log "selection is not empty, and active tab is not 0"
        $("#infodiv").accordion "activate", 0
      else if selectionIsEmpty and active != "false"
        console.log "selection is empty and active is not false"
        $("infodiv").accordion "activate", 0
      if data.mouse == "left"
        
      else if data.mouse == "right"
        
      else if data.mouse == "doubleLeft"
        console.log "double click on left mouse:"
        tinaviz.setView "meso", ->
          tinaviz.getCategory (data2) ->
            console.log "switching to " + data2.category
            tinaviz.setCategory data2.category, ->
              tinaviz.centerOnSelection ->
                tinaviz.infodiv.updateNodeList "meso", data2.category
                tinaviz.infodiv.display_current_category()
      tinaviz.infodiv.update data.view, data.selection
    
    neighbourhood: (data) ->
      console.log "getNeighbourhood"
      tinaviz.infodiv.updateTagCloud data.selection, data.neighbours
    
    categoryChanged: (data) ->
      console.log "categoryChanged: " + data.category
    
    viewChanged: (data) ->
      console.log "main: view changed! " + data.view
      view = data.view
      tinaviz.getCategory (data) ->
        category = data.category
        console.log "viewChanged:"
        console.log view
        console.log "category:"
        console.log category
        tinaviz.infodiv.updateNodeList view, category
        tinaviz.infodiv.display_current_category()
        tinaviz.infodiv.display_current_view()
        level = $ "#level"
        level.button "option", "label", view + " level"
        title = $ "#infodiv > h3:first"
        if view == "macro"
          if cat == "Document"
            $("#category-A").fadeIn()
            $("#category-B").fadeOut()
          else if cat == "NGram"
            $("#category-A").fadeOut()
            $("#category-B").fadeIn()
          level.removeClass "ui-state-highlight"
          title.removeClass "ui-state-highlight"
        else
          $("#category-A").fadeIn()
          $("#category-B").fadeIn()
          level.addClass "ui-state-highlight"
          title.addClass "ui-state-highlight"
          tinaviz.recenter()

  $(window).bind "resize", ->
    {w,h} = resize()
    tinaviz.size w, h

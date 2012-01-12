callSlider = (sliderobj, slider) ->
  unless sliderData[slider].scheduled == true
    sliderData[slider].scheduled = true
    $.doTimeout sliderData[slider].delay, ->
      if sliderData[slider].type == "Tuple2[Double]"
        vals = $(sliderobj).slider("values")
        tinaviz.set slider, [ vals[0] / sliderData[slider].size, vals[1] / sliderData[slider].size ], sliderData[slider].type
      else tinaviz.set slider, $(sliderobj).slider("value") / sliderData[slider].size, sliderData[slider].type  if sliderData[slider].type == "Double"
      sliderData[slider].scheduled = false

$(document).ready ->
  $.extend $.ui.slider.defaults, 
    min: 0
    max: 100
    value: 100.0
    animate: true
    orientation: "horizontal"
  
  jQuery.fn.disableTextSelect = ->
    @each ->
      unless typeof @onselectstart == "undefined"
        @onselectstart = ->
          false
      else unless typeof @style.MozUserSelect == "undefined"
        @style.MozUserSelect = "none"
      else
        @onmousedown = ->
          false
        
        @style.cursor = "default"
  
  jQuery(".unselectable").disableTextSelect()
  $(".unselectable").hover (->
    $(this).css "cursor", "default"
  ), ->
    $(this).css "cursor", "auto"
  
  $("#nodeRadiusSelector").change ->
    tinaviz.set "filter.map.node.radius", $("#nodeRadiusSelector").val(), "String"
  
  $("#nodeShapeSelector").change ->
    tinaviz.set "filter.map.node.shape", $("#nodeShapeSelector").val(), "String"
  
  $("#nodeColorSelector").change ->
    tinaviz.set "filter.map.node.color", $("#nodeColorSelector").val(), "String"

toolbar = values: 
  search: ""
  sliders: 
    magnify: 0.5
    cursor_size: 0.5
    nodeFilter: 
      min: 0.0
      max: 1.0
    
    edgeFilter: 
      min: 0.0
      max: 1.0
  
  buttons: 
    pause: false
    showNodes: true
    showEdges: true
    hd: false

toolbar.lastSearch = ""
toolbar.checkSearchForm = ->
  txt = $("#search_input").val()
  unless txt == toolbar.lastSearch
    toolbar.lastSearch = txt
    tinaviz.highlightByPattern txt, "containsIgnoreCase"
  setTimeout "toolbar.checkSearchForm()", 200

toolbar.checkSearchFormNoRepeat = ->
  txt = $("#search_input").val()
  unless txt == toolbar.lastSearch
    toolbar.lastSearch = txt
    tinaviz.highlightByPattern txt, "containsIgnoreCase"

toolbar.runSearchFormNoRepeat = ->
  txt = $("#search_input").val()
  console.log "runSearchFormNoRepeat:" + txt
  tinaviz.unselect ->
    tinaviz.infodiv.reset()
    cat = tinaviz.getCategory()
    whenDone = ->
      if txt != ""
        tinaviz.centerOnSelection()
      else
        tinaviz.recenter()
    
    if cat == "Document"
      tinaviz.selectByPattern txt, "containsIgnoreCase", whenDone
    else
      tinaviz.selectByPattern txt, "containsIgnoreCase", whenDone
  
  false

sliderData = 
  "filter.a.node.weight": 
    scheduled: false
    delay: 250
    size: 100
    type: "Tuple2[Double]"
  
  "filter.a.edge.weight": 
    scheduled: false
    delay: 250
    size: 100
    type: "Tuple2[Double]"
  
  "filter.b.node.weight": 
    scheduled: false
    delay: 250
    size: 100
    type: "Tuple2[Double]"
  
  "filter.b.edge.weight": 
    scheduled: false
    delay: 250
    size: 100
    type: "Tuple2[Double]"
  
  "filter.a.node.size": 
    scheduled: false
    delay: 100
    size: 100
    type: "Double"
  
  "filter.b.node.size": 
    scheduled: false
    delay: 100
    size: 100
    type: "Double"
  
  selectionRadius: 
    scheduled: false
    delay: 50
    size: 1
    type: "Double"

toolbar.init = ->
  $("#search").submit ->
    toolbar.runSearchFormNoRepeat()
    false
  
  $("#search").keypress ->
    toolbar.checkSearchFormNoRepeat()
  
  $("#export-gexf").button(text: true).click (eventObject) ->
    tinaviz.set "export", "GEXF", "String"
  
  $("#export-png").button(text: true).click (eventObject) ->
    tinaviz.set "export", "PNG", "String"
  
  $("#export-pdf").button(text: true).click (eventObject) ->
    tinaviz.set "export", "PDF", "String"
  
  $("#level").button(
    text: true
    icons: primary: "ui-icon-help"
  ).click (eventObject) ->
    tinaviz.getView (data) ->
      if data.view == "macro"
        if tinaviz == undefined or tinaviz.infodiv.selection.length == 0
          alert "You need to select a node before switching to meso view"
        else
          tinaviz.setView "meso"
      else tinaviz.setView "macro"  if data.view == "meso"
  
  $("#level").attr "title", "click to switch the level"
  $("#search_button").button(
    text: false
    icons: primary: "ui-icon-search"
  ).click (eventObject) ->
  
  $("#sliderAEdgeWeight").slider 
    range: true
    values: [ parseFloat(prefs.a_edge_filter_min) * 100.0, parseFloat(prefs.a_edge_filter_max) * 100.0 ]
    animate: true
    slide: (event, ui) -> callSlider "#sliderAEdgeWeight", "filter.a.edge.weight"
  
  $("#sliderANodeWeight").slider 
    range: true
    values: [ parseFloat(prefs.a_node_filter_min) * 100.0, parseFloat(prefs.a_node_filter_max) * 100.0 ]
    animate: true
    slide: (event, ui) -> callSlider "#sliderANodeWeight", "filter.a.node.weight"
  
  $("#sliderBEdgeWeight").slider 
    range: true
    values: [ parseFloat(prefs.b_edge_filter_min) * 100.0, parseFloat(prefs.b_edge_filter_max) * 100.0 ]
    animate: true
    slide: (event, ui) -> callSlider "#sliderBEdgeWeight", "filter.b.edge.weight"
  
  $("#sliderBNodeWeight").slider 
    range: true
    values: [ parseFloat(prefs.b_node_filter_min) * 100.0, parseFloat(prefs.b_node_filter_max) * 100.0 ]
    animate: true
    slide: (event, ui) -> callSlider "#sliderBNodeWeight", "filter.b.node.weight"
  
  $("#sliderANodeSize").slider 
    value: parseFloat(prefs.a_node_size) * 100.0
    max: 100.0
    animate: true
    slide: (event, ui) -> callSlider "#sliderANodeSize", "filter.a.node.size"
  
  $("#sliderBNodeSize").slider 
    value: parseFloat(prefs.b_node_size) * 100.0
    max: 100.0
    animate: true
    slide: (event, ui) -> callSlider "#sliderBNodeSize", "filter.b.node.size"
  
  $("#sliderSelectionZone").slider 
    value: parseFloat(prefs.cursor_size) * 300.0
    max: 300.0
    animate: true
    change: (event, ui) -> callSlider "#sliderSelectionZone", "selectionRadius"
  
  $("#toggle-paused").button(
    icons: primary: "ui-icon-pause"
    text: true
    label: "pause"
  ).click (event) ->
    tinaviz.togglePause (data) ->
      p = $("#toggle-paused")
      if p.button("option", "icons")["primary"] == "ui-icon-pause"
        p.button "option", "icons", primary: "ui-icon-play"
        p.button "option", "label", "play"
      else
        p.button "option", "icons", primary: "ui-icon-pause"
        p.button "option", "label", "pause"
  
  $("#toggle-unselect").button(icons: primary: "ui-icon-close").click (event) ->
    toolbar.lastsearch = ""
    tinaviz.unselect (data) -> tinaviz.infodiv.reset()
  
  $("#toggle-recenter").button(
    text: true
    icons: primary: "ui-icon-home"
  ).click (event) ->
    tinaviz.recenter ->
  
  $("#toggle-switch").button(
    text: true
    icons: primary: "ui-icon-arrows"
  ).click (event) ->
    tinaviz.getCategory (data) ->
      cat = data.category
      console.log "clicked on category switch. cat: " + cat
      console.log data
      next_cat = tinaviz.getOppositeCategory cat
      console.log "opposite cat: " + next_cat
      tinaviz.getView (data) ->
        viewName = data.view
        console.log "view name: " + viewName
        if viewName == "macro"
          if next_cat == "Document"
            show "#category-A"
            hide "#category-B"
          else if next_cat == "NGram"
            hide "#category-A"
            show "#category-B"
        else
          show "#category-A"
          show "#category-B"
        neighbours = tinaviz.infodiv.neighbours
        tinaviz.setCategory next_cat, (data) ->
          console.log " category should be set now"
          tinaviz.centerOnSelection (data) ->
            if viewName == "macro"
              myArray = new Array()
              for pos of neighbours
                myArray.push neighbours[pos]
              tinaviz.select myArray, ->
                console.log "selected my array"
                tinaviz.infodiv.updateNodeList viewName, next_cat
                tinaviz.infodiv.display_current_category()
            else
              tinaviz.infodiv.updateNodeList viewName, next_cat
              tinaviz.infodiv.display_current_category()
  
  # TODO replace by a smarter JQuery/CSS selector (using children?)
  hide "#export-view"
  hide "#search
  hide "#export-gexf"
  hide "#level"
  hide "#search_button"
  hide "#toggle-recenter"
  hide "#toggle-switch"
  hide "#toggle-unselect"
  hide "#toggle-paused"
  hide "#cursor-size-block"
  hide "#category-A"
  hide "#category-B"
  hide "#category-legend"

toolbar.updateButton = (button, state) ->
  toolbar.values.buttons[button] = state
  $("#toggle-" + button).toggleClass "ui-state-active", state

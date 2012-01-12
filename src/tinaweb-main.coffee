#
# MyTinaweb: an example application
# 
# This class contains all the business logic of a generic bipartite
# visualizer
#
# WARNING NOTE: The app is still in development.
# for the moment, categories must be either Document or NGram 
# (the "Document" and "NGram" variables keywords are hard-coded in the code! 
# this will be fixed in a future release)
# 
class MyTinaweb extends Tinaweb

  # This fonction is called just before inserting the visualization in the page
  preInstall: ->
    log "MyTinaweb: preInstall"
    
    # you can overload default settings
    @configure_using default_config
    
    # note, however, that URL params will overload them too
    @configure_using @load_url_params()
    
  postInstall: ->
    log "MyTinaweb: postInstall"

    if @config.layout == "phyloforce"
      @infodiv = PhyloInfoDiv
    else
      @infodiv = InfoDiv
          
    log "MyTinaweb: configuring page layout, and info panel's DIV"
    @infodiv.id = "infodiv"
    @infodiv.label = $ "#node_label"
    @infodiv.contents = $ "#node_contents"
    @infodiv.cloud = $ "#node_neighbourhood"
    @infodiv.cloudSearch = $ "#node_neighbourhoodForSearch"
    @infodiv.cloudSearchCopy = $ "#node_neighbourhoodCopy"
    @infodiv.unselect_button = $ "#toggle-unselect"
    @infodiv.node_table = $ "#node_table > tbody"
    @infodiv.categories = 
      NGram: "Keywords"
      Document: "Projects"

    $("#infodiv").accordion fillSpace: true
    @infodiv.reset()
    toolbar.init()
    
    log "MyTinaweb: trying to automatically open GEXF file from config"
    if @config.gexf?
      if @config.gexf isnt ""
        @open "#{@config.gexf}", @graphLoadingProgress 

  animateAppletInfo: ->
    unless @status == "loaded"
      $("#appletInfo").text $("#appletInfo").text() + "."
      delay 400, @animateAppletInfo

  @graphLoadingProgress: (data) ->
    status = data.status
    if status == "downloading"
      $("#appletInfo").effect "pulsate", "fast"
      $("#appletInfo").text "Downloading data.."
      show "#appletInfo"
      @animateAppletInfo()
    else if status == "downloaded"
      $("#appletInfo").effect "pulsate", "fast"
      $("#appletInfo").text "Generating graph.."
    else if status == "updated"

    else if status == "loaded"
      log "graph loaded"
      log "update the node list (may fail)"
      @infodiv.updateNodeList "macro", prefs.category
      log "displaying current category"
      @infodiv.display_current_category()
      log "displaying current view"
      @infodiv.display_current_view()
      $("#appletInfo").text "Graph generated, please wait.."
      delay 100, ->
        show "#toggle-paused"
        delay 200, ->
          show "#toggle-switch"
          delay 200, ->
            show "#level"
            delay 200, ->
              show "#cursor-size-block"
              delay 400, ->
                show "#category-A"
                show "#category-legend"
                delay 300, ->
                  show "#search"
                  show "#search_button"
                  delay 200, ->
                    show "#toggle-recenter"
                    delay 100, ->
                      show "#export-gexf"
                      delay 1000, ->
                        $("#appletInfo").animate 
                          opacity: "toggle"
                          height: "toggle"
                        , "slow", ->

      unless prefs.node_id == ""
        delay 200, ->
          @select prefs.node_id
      unless prefs.search == ""
        $("#search_input").val prefs.search
        @selectByPattern prefs.search, "containsIgnoreCase"
    else if status == "error"
      $("#notification").notify "create", 
        title: "Tinasoft Notification"
        text: "Error loading the network, please consult logs"
    else
        log "unknow status #{status}"
 
  resize: ->
    log "MyTinaweb: custom computeSize()"
    infoDivWidth = 390
    width = getScreenWidth() - infoDivWidth - 55
    height = getScreenHeight() - $("#hd").height() - $("#ft").height() - 60

    $("#appletdiv").css "width", width
    $("#infodiv").css "width", infoDivWidth
    $("#infodivparent").css "height", height
    
    @_resize {width, height}
   
  viewMeso: (id, category) ->
    @getCategory (data) =>
      cat = data.category
      @setView "macro", =>
        @unselect ->
          @setCategory category, =>
            @select id, =>
              @setView "meso", =>
                @infodiv.updateNodeList "meso", category  unless category is cat
                show "#category-A"
                show "#category-B"
                @recenter()

  selectionChanged: (data) ->
    log "-- selection automatically changed: #{data.selection}"
    active = $("#infodiv").accordion "option", "active"
    selectionIsEmpty = (Object.size(data.selection) is 0)
    log "selectionIsEmpty: #{selectionIsEmpty}"
    if not selectionIsEmpty and active isnt 0
      log "MyTinaweb: selection is not empty, and active tab is not 0"
      $("#infodiv").accordion "activate", 0
    else if selectionIsEmpty and active isnt "false"
      log "MyTinaweb: selection is empty and active is not false"
      $("infodiv").accordion "activate", 0
    if data.mouse is "left"
       
    else if data.mouse is "right"
      
    else if data.mouse is "doubleLeft"
      log "MyTinaweb: double click on left mouse:"
      @setView "meso", =>
        @getCategory (data2) =>
            log "switching to #{data2.category}"
          @setCategory data2.category, =>
            @centerOnSelection =>
              @infodiv.updateNodeList "meso", data2.category
              @infodiv.display_current_category()
    @infodiv.update data.view, data.selection
    
  #neighbourhood: (data) ->
  #    log "getNeighbourhood"
  #tinaviz.infodiv.updateTagCloud data.selection, data.neighbours
    
    
  viewChanged: (data) ->
    log "MyTinaweb: default view automatically changed to #{data.view}"
    view = data.view
    @getCategory (data) =>
      category = data.category
      @infodiv.updateNodeList view, category
      @infodiv.display_current_category()
      @infodiv.display_current_view()
      level = $ "#level"
      level.button "option", "label", "#{view} level"
      title = $ "#infodiv > h3:first"
      if view == "macro"
        if cat == "Document"
          show "#category-A", "fast"
          hide "#category-B", "fast"
        else if cat == "NGram"
          hide "#category-A", "fast"
          show "#category-B", "fast"
        level.removeClass "ui-state-highlight"
        title.removeClass "ui-state-highlight"
       else
        show "#category-A", "fast"
        show "#category-B", "fast"
        level.addClass "ui-state-highlight"
        title.addClass "ui-state-highlight"
        @recenter()
        
# create a new customized Tinaweb, using default_config from preferences.js (preferences.coffee)     
tinaweb = new MyTinaweb

$(document).ready ->
  log "document ready.. installing tinaviz"
  tinaviz.install()
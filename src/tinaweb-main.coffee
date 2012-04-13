#
# Application: an example application
# 
# This class contains all the business logic of a generic bipartite
# visualizer
#
# WARNING NOTE: The app is still in development.
# for the moment, categories must be either Document or NGram 
# (the "Document" and "NGram" variables keywords are hard-coded in the code! 
# this will be fixed in a future release)
# 
      
class Application extends Tinaweb

  # This fonction is called just before inserting the visualization in the page
  preInstall: =>
    log "Application: preInstall"
    
    # you can overload default settings
    @configure_using default_config
    
    # note, however, that URL params will overload them too
    log "loading config from urls"
    @configure_using @load_url_params()
    
  postInstall: =>
    log "Application: postInstall"

    log "Application: configuring page layout, and info panel's DIV"
    if @config.layout is "phyloforce"
      @infodiv = PhyloInfoDiv
    else
      @infodiv = InfoDiv
          
    @infodiv.id = "infodiv"
    @infodiv.label = $ "#node_label"
    @infodiv.contents = $ "#node_contents"
    @infodiv.cloud = $ "#node_neighbourhood"
    @infodiv.cloudSearch = $ "#node_neighbourhoodForSearch"
    @infodiv.cloudSearchCopy = $ "#node_neighbourhoodCopy"
    @infodiv.unselect_button = $ "#toggle-unselect"
    @infodiv.node_table = $ "#node_table > tbody"
    @infodiv.categories = 
      NGram: @config.category_a_label
      Document: @config.category_b_label

    log "Application: resizing here"
    @resize()
    
    $("#infodiv").accordion 
      collapsible: true
      fillSpace: true
    @infodiv.reset()
    toolbar.init()
    
    @previous = ""
    @reloadGraph()

  reloadGraph: =>
    repeat 1500, =>
      #log "Application: pinging \"#{@config.gexf}\""
      @config.gexf = window.parent.gexf
      if @config.gexf?
        if @config.gexf isnt ""
          if @config.gexf isnt @previous
            @previous = @config.gexf
            log "new graph detected! loading #{@config.gexf}"
            @open "#{@config.gexf}", @graphLoadingProgress


  animateAppletInfo: =>
    unless status is "loaded"
      txt = $("#appletInfo").text()
      $("#appletInfo").text "#{txt}."
      delay 400, => @animateAppletInfo()
    
  graphLoadingProgress: (data) =>
    @status = data.status
    if @status is "downloading"
      $("#appletInfo").effect "pulsate", "fast"
      $("#appletInfo").text "Downloading data.."
      show "#appletInfo"
      @animateAppletInfo()
    else if @status is "downloaded"
      $("#appletInfo").effect "pulsate", "fast"
      $("#appletInfo").text "Generating graph.."
    else if @status is "updated"

    else if @status is "loaded"
      log "graph loaded"
      log "update the node list (may fail)"
      @infodiv.updateNodeList "macro", @config.category
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

      if @config.node_id isnt ""
        delay 200, =>
          @select @config.node_id
      if @config.search isnt ""
        $("#search_input").val @config.search
        @selectByPattern @config.search, "containsIgnoreCase"
    else if @status is "error"
      $("#notification").notify "create", 
        title: "Tinasoft Notification"
        text: "Error loading the network, please consult logs"
    else
        log "unknow status #{@status}"
 
  resize: =>
    log "Application: custom computeSize()"
    infoDivWidth = 390

    # coudln't figure out where the decay come from
    width = getScreenWidth() - 8
    height = getScreenHeight() - $("#hd").height() - $("#ft").height()

    # back compatibility with legacy operating systems (windows, linux)
    unless @config.experimental
      width -= (infoDivWidth)
      height -= 60

    $("#appletdiv").css "width", width
    $("#infodiv").css "width", infoDivWidth
    $("#infodivparent").css "height", height
    @config.width = width
    @config.height = height
    
    @_resize {width, height}
  
  setView: (value, cb) =>
    alias = "view"
    real = "filter.view"
    $("#level").button "option", "label", "#{value} level"
    @set real, value, "String", @makeWrap(alias, real, cb)  

  viewMeso: (id, category) ->
    log "Application: viewMeso(#{id}, #{category})"
    @getCategory (data) =>
      cat = data.category
      @setView "macro", =>
        @unselect =>
          @setCategory category, =>
            @select id, =>
              @setView "meso", =>
                @infodiv.updateNodeList "meso", category  unless category is cat
                show "#category-A"
                show "#category-B"
                @recenter()

  selectionChanged: (data) =>
    log "-- selection automatically changed:"
    mouse = data.mouse
    selection = data.selection
    @getView (data) =>
      view = data.view
        
      active = $("#infodiv").accordion "option", "active"
      selectionIsEmpty = (Object.size(selection) is 0)
      log "selectionIsEmpty: #{selectionIsEmpty}"
      if not selectionIsEmpty and active isnt 0
        log "Application: selection is not empty, and active tab is not 0"
        $("#infodiv").accordion "activate", 0
      else if selectionIsEmpty and active isnt "false"
        log "Application: selection is empty and active is not false"
        $("#infodiv").accordion "activate", 0
        
      if mouse is "left"
         
      else if mouse is "right"
        
      else if mouse is "doubleLeft"
        log "Application: double click on left mouse:"
        
        unless selectionIsEmpty
          @getCategory (data) =>
            category = data.category
            @setView "meso", =>
              log "switching to #{category}"
              @setCategory category, =>
                @infodiv.updateNodeList "meso", category
                @infodiv.display_current_category()
                @infodiv.update view, selection
                @centerOnSelection =>
        
      @infodiv.display_current_category()
      @infodiv.update view, selection
    
    
    
    
  viewChanged: (data) =>
    log "Application: default view automatically changed to #{data.view}"
    view = data.view
    @getCategory (data) =>
      category = data.category
      @infodiv.updateNodeList view, category
      @infodiv.display_current_category()
      @infodiv.display_current_view()
      level = $ "#level"
      level.button "option", "label", "#{view} level"
      title = $ "#infodiv > h3:first"
      if view is "macro"
        if cat is "Document"
          show "#category-A", "fast"
          hide "#category-B", "fast"
        else if cat is "NGram"
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
        
# create a new customized Tinaweb
app = new Application

$(document).ready ->
  log "document ready.. installing app"
  log app
  app.install()
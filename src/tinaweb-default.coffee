
class Tinaweb extends Tinaviz
  
  _config:
    element: "#tinaviz"      
    gexf: "sample.gexf.gz"    # gexf file to load by default
    view: "macro"             # default view to show the graph
    category: "Document"      # default category used to show the graph
    node_id: ""               # default node to select ("" means no node will be selected)
    search: ""                # default search query ("" means no search will be run)
    a_node_size: 0.50         # node size for category A
    b_node_size: 0.50         # node size for category B
    cursor_size: 0.01         # default selection cursor size
    a_edge_filter_min: 0.0    # initial position of the edge filter for category A (lower-bound)
    a_edge_filter_max: 1.0    # initial position of the edge filter for category A (higher-bound)
    a_node_filter_min: 0.0    # initial position of the edge filter for category A (lower-bound)
    a_node_filter_max: 1.0    # initial position of the edge filter for category A (higher-bound)
    b_edge_filter_min: 0.0    # initial position of the edge filter for category B (lower-bound)
    b_edge_filter_max: 1.0    # initial position of the edge filter for category B (higher-bound)
    b_node_filter_min: 0.0    # initial position of the edge filter for category B (lower-bound)
    b_node_filter_max: 1.0    # initial position of the edge filter for category B (higher-bound)
    layout: "tinaforce"       # default layout (note: for the moment, only "tinaforce" is recommended)
    layout_speed: 30          # layout speed (in iterations by seconds)
    pause: false              # should we be paused by default?
    demo: false               # should we enable the demo mode?
    
  _status: "done"
  _demo_running: false
  _demo_possible: false

  configure: (params) ->
    log "Tinaweb: configure() -> updating  self config.."
    for key, value of params
      @_config[key] = value
  
  computeSize: -> 
    log "Tinaweb: default computeSize() function"
    {width: 10, height: 10}
  
  resize: ->
    log "Tinaweb: default resize() -> self-resizing"
    @_resize @computeSize()
    
  open: (url, cb) ->
    log "Tinaweb: open #{url}"
    url = document.location.href.substring(0, document.location.href.lastIndexOf("/") + 1) + url  if url.search("://") == -1
    @_open url, cb

  recenter: (cb) -> @set "camera.target", "all", "String", cb
  
  centerOnSelection: (cb) -> @set "camera.target", "selection", "String", cb
  
  setLayout: (name, cb) -> @set "layout.algorithm", name, "String", cb
  
  setPause: (value=true, cb) ->  @set "pause", value, "Boolean", cb
  
  getPause: (cb) -> @get "pause", cb
  
  pause: (cb) -> @setPause cb
  
  togglePause: (cb) -> @getPause (data) -> @setPause((not data.pause), cb)

  unselect: (cb) -> @set "select", "", "String", cb  
  
  select: (toBeSelected, cb) ->
    t = if $.isArray(toBeSelected) then "Json" else "String"
    @set "select", toBeSelected, t, cb

  getOppositeCategory: (cat) ->
    if cat == "Document" then "NGram" else "Document"
  
  makeWrap: (alias, real, cb) ->
    _cb = (data) ->
    
    if cb?
      _cb = (input) ->
        output = {}
        output[alias] = input[real]
        cb output
    _cb
  
  getCategory: (cb) ->
    alias = "category"
    real = "filter.node.category"
    @get real, @makeWrap alias, real, cb
  
  setCategory: (value, cb) ->
    alias = "category"
    real = "filter.node.category"
    @set real, value, "String", @makeWrap(alias, real, cb)
  
  
  getView: (cb) ->
    alias = "view"
    real = "filter.view"
    @get real, @makeWrap(alias, real, cb)
  
  setView: (view, cb) ->
    alias = "view"
    real = "filter.view"
    @set real, value, "String", @makeWrap(alias, real, cb)    
  preInstall: ->
    log "Tinaweb: default preInstall()"
  postInstall: ->
    log "Tinaweb: default postInstall()"
  install: ->
    log "Tinaweb: install()"
    @preInstall()
    @_inject =>
              
      log "Tinaweb: _inject() -> creating callbacks"
      makeCallback @graphImported
      makeCallback @selectionChanged
      makeCallback @viewChanged
      
      log "Tinaweb: _inject() -> binding automatic resize"
      $(window).bind "resize", => @resize
      
      log "Tinaweb: _inject() -> binding blur and focus"
      $(window).bind "blur", => @freeze
      $(window).bind "focus", => @unfreeze
  
      log "Tinaweb: _postInject() -> checking for demo mode"
      @_demo_possible = true if @_config.demo?
        
      waitTimeBeforeStartingDemo = 6
      delayBetweenChanges = 10
      #$.fn.nap.standbyTime = waitTimeBeforeStartingDemo
      #$(document).nap (->
      #  $.doTimeout "demo_loop", delayBetweenChanges * 1000, ->
      #    unless @_demo_running
      #      false
      #   else
      #      @demo()
      #      true
      #), ->
      #  $.doTimeout "demo_loop"
            
      log "Tinaweb: _postInject() -> sending parameters to the applet"  
      @set "filter.a.edge.weight", [ @_config.a_edge_filter_min, @_config.a_edge_filter_max ], "Tuple2[Double]"
      @set "filter.a.node.weight", [ @_config.a_node_filter_min, @_config.a_node_filter_max ], "Tuple2[Double]"
      @set "filter.b.edge.weight", [ @_config.b_edge_filter_min, @_config.b_edge_filter_max ], "Tuple2[Double]"
      @set "filter.b.node.weight", [ @_config.b_node_filter_min, @_config.b_node_filter_max ], "Tuple2[Double]"
      @set "filter.a.node.size", @_config.a_node_size, "Double"
      @set "filter.b.node.size", @_config.b_node_size, "Double"
      @set "filter.node.category", @_config.category, "String"
      @set "selectionRadius", @_config.cursor_size, "Double"
      @set "layout", @_config.layout, "String"
      @set "layoutSpeed", @_config.layout_speed, "Int"
      @set "pause", @_config.pause, "Boolean"
    
      log "Tinaweb: _postInject() terminated, calling postInstall()"
      @postInstall()

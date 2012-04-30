
class Tinaweb extends Tinaviz
  
  constructor: ->
    log "Tinaweb: constructor called.. calling super()"
    super()
     
    log "Tinaweb: configuring with default config"
    @_tinaweb_defaults =
      elementId: "vizdiv"          #   
      gexf: "sample.gexf.gz"       # gexf file to load by default
      path: "js/tinaviz/"          # default path to tinaviz
      view: "macro"                # default view to show the graph
      category_a_label: "NGram"    # label used to print nodes of type A
      category_b_label: "Document" #              //              type B
      category: "Document"         # default category used to show the graph
      node_id: ""                  # default node to select ("" means no node will be selected)
      search: ""                   # default search query ("" means no search will be run)
      a_node_size: 0.50            # node size for category A
      b_node_size: 0.50            # node size for category B
      cursor_size: 0.01            # default selection cursor size
      a_edge_filter_min: 0.0       # initial position of the edge filter for category A (lower-bound)
      a_edge_filter_max: 1.0       # initial position of the edge filter for category A (higher-bound)
      a_node_filter_min: 0.0       # initial position of the edge filter for category A (lower-bound)
      a_node_filter_max: 1.0       # initial position of the edge filter for category A (higher-bound)
      b_edge_filter_min: 0.0       # initial position of the edge filter for category B (lower-bound)
      b_edge_filter_max: 1.0       # initial position of the edge filter for category B (higher-bound)
      b_node_filter_min: 0.0       # initial position of the edge filter for category B (lower-bound)
      b_node_filter_max: 1.0       # initial position of the edge filter for category B (higher-bound)
      layout: "tinaforce"          # default layout (note: for the moment, only "tinaforce" is recommended)
      layout_speed: 30             # layout speed (in iterations by seconds)
      antialiasing_threshold: 1500 # max number of edges, before aliasing the scene (pixel aliasing)
      pause: false                 # should we be paused by default?
      demo: false                  # should we enable the demo mode?
      experimental: no             # test experimental features?
      
    @_status = "done"
    log "Tinaweb: end of constructor"

  # an utility function that loads URL params as a config
  # since an URL is a String, we need to know the type of each 
  # parameter. For this, we are simply using another model config file
  # to know the types
  load_url_params: => loadURLParamsUsing @config
  
  # compute some default size values
  computeSize: => 
    log "Tinaweb: default computeSize() function"
    {width: 10, height: 10}
  
  # resize tinaweb
  resize: =>
    log "Tinaweb: default resize() -> self-resizing"
    @_resize @computeSize()
   
  # open a graph for download and visualization 
  open: (url, cb) =>
    log "Tinaweb: open #{url}"
    url = document.location.href.substring(0, document.location.href.lastIndexOf("/") + 1) + url  if url.search("://") == -1
    @_open url, cb

  # recenter the view
  recenter: (cb) => @set "camera.target", "all", "String", cb
  
  centerOnSelection: (cb) => @set "camera.target", "selection", "String", cb
  
  setLayout: (name, cb) => @set "layout.algorithm", name, "String", cb
  
  setPause: (value=true, cb) =>  @set "pause", value, "Boolean", cb
  
  getPause: (cb) => @get "pause", cb

  pause: (cb) => @setPause cb
  
  togglePause: (cb) => 
    @getPause (data) => 
      @setPause (not data.pause), cb

  unselect: (cb) => @set "select", "", "String", cb  
  
  select: (toBeSelected, cb) =>
    t = if $.isArray(toBeSelected) then "Json" else "String"
    @set "select", toBeSelected, t, cb

  getOppositeCategory: (cat) ->
    if cat is "Document" then "NGram" else "Document"

  makeWrap: (alias, real, cb) ->
    _cb = (data) ->
    
    if cb?
      _cb = (input) ->
        output = {}
        output[alias] = input[real]
        cb output
    _cb
  
  getCategory: (cb) =>
    alias = "category"
    real = "filter.node.category"
    @get real, @makeWrap alias, real, cb
  
  setCategory: (value, cb) =>
    alias = "category"
    real = "filter.node.category"
    @set real, value, "String", @makeWrap(alias, real, cb)
  
  
  getView: (cb) =>
    alias = "view"
    real = "filter.view"
    @get real, @makeWrap(alias, real, cb)
  
  setView: (value, cb) =>
    alias = "view"
    real = "filter.view"
    @set real, value, "String", @makeWrap(alias, real, cb)    

  install: =>
    #log "Tinaweb: install() -> loading url parameters"
        
    log "Tinaweb: install() -> loading some additionnal default settings"
    @configure_using @_tinaweb_defaults
    
    
    log "Tinaweb: install() -> calling preInstall if available"
    @preInstall?()
    
    log "Tinaweb: install() -> calling @_inject => { ... }"
    @_inject =>
              
      log "Tinaweb: _inject() -> creating callbacks"
      makeCallback @graphImported
      makeCallback @selectionChanged
      makeCallback @viewChanged
      
      log "Tinaweb: _inject() -> binding automatic resize"
      #$(window).bind "resize", => @resize
      $(window).resize => @resize

      if @config.experimental
        log "Tinaweb: _inject() -> binding of mouse enter/leave events"
        $(window).mouseleave => @freeze()
        $(window).mouseenter => @unfreeze()
            
      log "Tinaweb: _postInject() -> sending (some) default parameters to the applet"  
      @set "filter.a.edge.weight", [ @config.a_edge_filter_min, @config.a_edge_filter_max ], "Tuple2[Double]"
      @set "filter.a.node.weight", [ @config.a_node_filter_min, @config.a_node_filter_max ], "Tuple2[Double]"
      @set "filter.b.edge.weight", [ @config.b_edge_filter_min, @config.b_edge_filter_max ], "Tuple2[Double]"
      @set "filter.b.node.weight", [ @config.b_node_filter_min, @config.b_node_filter_max ], "Tuple2[Double]"
      @set "filter.a.node.size", @config.a_node_size, "Double"
      @set "filter.b.node.size", @config.b_node_size, "Double"
      @set "filter.node.category", @config.category, "String"
      @set "selectionRadius", @config.cursor_size, "Double"
      @set "layout", @config.layout, "String"
      @set "layoutSpeed", @config.layout_speed, "Double"
      @set "pause", @config.pause, "Boolean"
      @set "antiAliasingThreshold", "#{@config.antialiasing_threshold}", "Int"

      log "Tinaweb: _postInject() terminated, calling postInstall() if available"
      @postInstall?()

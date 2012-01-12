cblatency = 100
cbCounter = 0
callbacks = {}

# manage the window focus / out of focus mode
$(window).focus -> tinaviz?.unfreeze()
$(window).blur -> tinaviz?.freeze()

# custom callback engine (necessary to communicate with the Scala actor-based applet)
callCallback = (cb_id, cb_args) ->
  delay cblatency, -> callbacks[cb_id] $.parseJSON(cb_args)
  
makeCallback = (cb = ->) ->
  id = cbCounter++
  callbacks[id] = cb
  "" + id

Tinaviz = (args) ->
  opts = 
    context: ""
    path: ""
    engine: "software"
    brandingIcon: ""
    pause: false
    width: 800
    height: 600
  
  for x of args
    opts[x] = args[x]
    
  wrapper = null
  applet = null
  @toBeSelected = new Array()
  @isReady = 0
  @infodiv = {}
  @opts = opts
  @height = opts.height
  @width = opts.width
  @tag = opts.tag
  @path = opts.path
  @libPath = @path + "js/tinaviz/"
  @engine = opts.engine
  @context = opts.context
  @brandingIcon = @libPath + "tina_icon.png"
  @getPath = -> @path
  
  @open = (url, cb) ->
    console.log "url : " + url
    url = document.location.href.substring(0, document.location.href.lastIndexOf("/") + 1) + url  if url.search("://") == -1
    tinaviz.logNormal "applet.openURI(" + url + ");"
    try
      applet.openURI makeCallback(cb), url
    catch e
      tinaviz.logError "Couldn't import graph: " + e
      cb 
        success: false
        error: e
  
  @getNodesByLabel = (label, type, cb) ->
    alert "ERROR getNodesByLabel is broken"
  
  @selectByPattern = (pattern, patternMode, cb) ->
    return  if pattern.length > 0 and pattern.length < 3
    applet.selectByPattern makeCallback(cb), pattern, patternMode
  
  @selectByNeighbourPattern = (pattern, patternMode, category, cb) ->
    return  if pattern.length > 0 and pattern.length < 3
    applet.selectByNeighbourPattern makeCallback(cb), pattern, patternMode, category
  
  @highlightByPattern = (pattern, patternMode, cb) ->
    applet.highlightByPattern makeCallback(cb), pattern, patternMode
  
  @highlightByNeighbourPattern = (pattern, patternMode, cb) ->
    applet.highlightByNeighbourPattern makeCallback(cb), pattern, patternMode
  
  @getNodeAttributes = (view, id, cb) ->
    applet.getNodeAttributes makeCallback(cb), view, id
  
  @getNeighbourhood = (view, node_list, cb) ->
    applet.getNeighbourhood makeCallback(cb), view, $.toJSON(node_list)
  
  @getNeighboursFromDatabase = (id) ->
    elem = id.split "::"
    TinaService.getNGrams 0, elem[1], success: (data) ->
    
  @recenter = (cb) -> @set "camera.target", "all", "String", cb
  
  @centerOnSelection = (cb) -> @set "camera.target", "selection", "String", cb
  
  @setLayout = (name, cb) -> @set "layout.algorithm", name, "String", cb
  
  @setPause = (value, cb) ->  @set "pause", value, "Boolean", cb
  
  @getPause = (cb) -> @get "pause", cb
  
  @pause = (cb) -> @setPause true, cb
  
  @togglePause = (cb) -> @getPause (data) -> tinaviz.setPause not data.pause, cb

  @unselect = (cb) -> @set "select", "", "String", cb  
  
  @select = (toBeSelected, cb) ->
    t = if $.isArray(toBeSelected) then "Json" else "String"
    @set "select", toBeSelected, t, cb

  @getOppositeCategory = (cat) ->
    if cat == "Document"
      return "NGram"
    else return "Document"  if cat == "NGram"
    "Document"
  
  @makeWrap = (alias, real, cb) ->
    _cb = (data) ->
    
    if cb?
      _cb = (input) ->
        output = {}
        output[alias] = input[real]
        cb output
    _cb
  
  @getCategory = (cb) ->
    alias = "category"
    real = "filter.node.category"
    @get real, @makeWrap alias, real, cb
  
  @setCategory = (value, cb) ->
    alias = "category"
    real = "filter.node.category"
    @set real, value, "String", @makeWrap(alias, real, cb)
  
  @freeze = ->
    applet?.freeze()
  
  @unfreeze = ->
    applet?.unfreeze()
  
  @getView = (cb) ->
    alias = "view"
    real = "filter.view"
    @get real, @makeWrap(alias, real, cb)
  
  @setView = (view, cb) ->
    alias = "view"
    real = "filter.view"
    @set real, value, "String", @makeWrap(alias, real, cb)
  
  @viewMeso = (id, category) ->
    tinaviz.getCategory (data) ->
      cat = data.category
      tinaviz.setView "macro", ->
        tinaviz.unselect ->
          tinaviz.setCategory category, ->
            tinaviz.select id, ->
              tinaviz.setView "meso", ->
                tinaviz.infodiv.updateNodeList "meso", category  unless category == cat
                $("#category-A").fadeIn()
                $("#category-B").fadeIn()
                tinaviz.recenter()
  
  @getNodes = (view, category, cb) ->
    applet.getNodes makeCallback(cb), view, category
  
  @size = (width, height) ->
    return  if not wrapper? or not applet?
    $("#tinaviz").css "height", "" + (height) + "px"
    $("#tinaviz").css "width", "" + (width) + "px"
    wrapper.height = height
    wrapper.width = width
    applet.resize width, height
  
  @getAs = (key, type, cb) ->
    applet.sendGet makeCallback(cb), key, type
    undefined
  
  @get = (key, cb) ->
    applet.sendGet makeCallback(cb), key, "Any"
    undefined
  
  @set = (key, obj, t, cb) ->
    console.log "applet.send key: " + key + " , obj: " + obj + ", t:" + t
    cbId = makeCallback(cb)
    if t == undefined
      @logNormal "Warning, setting unknow (" + key + "," + obj + ")"
      applet.sendSet cbId, key, obj, ""
    else
      unless t.indexOf("Tuple2") == -1
        unless t.indexOf("[Double]") == -1
          applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Double"
        else unless t.indexOf("[Int]") == -1
          applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Int"
        else unless t.indexOf("[Float]") == -1
          applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Float"
        else
          applet.sendSetTuple2 cbId, key, obj[0], obj[1], ""
      else if t == "Json"
        applet.sendSet cbId, key, $.toJSON(obj), t
      else
        applet.sendSet cbId, key, obj, t
    undefined
  
  @logNormal = (msg) ->
    try
      console.log msg
    catch e
      return
  
  @logDebug = (msg) ->
    try
      console.log msg
    catch e
      return
  
  @logError = (msg) ->
    try
      console.error msg
    catch e
      alert msg
      return
  
  @getHTML = ->
    path = @libPath
    context = @context
    engine = @engine
    w = @width
    h = @height
    buff = ""
    func = document.write
    document.write = (arg) ->
      buff += arg
    
    res = deployJava.writeAppletTag(
      id: "tinapplet"
      code: "eu.tinasoft.tinaviz.Main.class"
      archive: path + "tinaviz-2.0-SNAPSHOT.jar"
      width: w
      height: h
      image: "css/branding/appletLoading.gif"
      standby: "Loading Tinaviz..."
    , 
      engine: engine
      js_context: context
      root_prefix: path
      brandingIcon: @brandingIcon
      progressbar: false
      boxbgcolor: "#FFFFFF"
      boxmessage: "Loading Tinaviz..."
      image: "css/branding/appletLoading.gif"
      mayscript: true
      scriptable: true
    )
    document.write = func
    buff
  
  makeCallback (data) ->
    if @xulrunner == true
      wrapper = $("#vizframe").contents().find("#tinapplet")[0]
    else
      wrapper = $("#tinapplet")[0]
    unless wrapper?
      alert "Error: couldn't get the applet!"
      return
    applet = wrapper
    unless applet?
      alert "Error: couldn't get the applet!"
      return
    @applet = applet
    makeCallback (data) ->
      console.log "graph imported"
    
    makeCallback (data) ->
      console.log "graph clicked. mouse: " + data.mouse
    
    makeCallback (data) ->
      console.log "view changed: " + data.view
    
    console.log "calling user-provided init callback"
    opts.init()
  
  @tag.html @getHTML()
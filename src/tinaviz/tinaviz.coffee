cblatency = 100
cbCounter = 0
callbacks = {}

# custom callback engine (necessary to communicate with the Scala actor-based applet)
callCallback = (cb_id, cb_args) ->
  delay cblatency, -> callbacks[cb_id] $.parseJSON(cb_args)
  
makeCallback = (cb = ->) ->
  id = cbCounter++
  callbacks[id] = cb
  "" + id

class Tinaviz

  constructor: (@option) ->
     
    log "Tinaviz: called constructor()"
    @applet = undefined 
    @appletTag = "#tinapplet"
    
    @path = ""
    @libPath = @path + "js/tinaviz/"
    @brandingIcon = @libPath + "tina_icon.png"
    
    @context = ""
    @engine = "software"
    @brandingIcon = ""
    
  _open: (url, cb) ->
    log "Tinaviz: _open() -> opening #{url}"
    try
      applet.openURI makeCallback(cb), url
    catch e
      logError "Tinaviz: _open() -> Couldn't import graph: " + e
      cb 
        success: false
        error: e
  
  getNodesByLabel: (label, type, cb) ->
    alert "ERROR getNodesByLabel is broken"
  
  selectByPattern: (pattern, patternMode, cb) ->
    return  if pattern.length > 0 and pattern.length < 3
    @applet.selectByPattern makeCallback(cb), pattern, patternMode
  
  selectByNeighbourPattern: (pattern, patternMode, category, cb) ->
    return  if pattern.length > 0 and pattern.length < 3
    @applet.selectByNeighbourPattern makeCallback(cb), pattern, patternMode, category
  
  highlightByPattern: (pattern, patternMode, cb) ->
    @applet.highlightByPattern makeCallback(cb), pattern, patternMode
  
  highlightByNeighbourPattern: (pattern, patternMode, cb) ->
    @applet.highlightByNeighbourPattern makeCallback(cb), pattern, patternMode
  
  getNodeAttributes: (view, id, cb) ->
    @applet.getNodeAttributes makeCallback(cb), view, id
  
  getNeighbourhood: (view, node_list, cb) ->
    @applet.getNeighbourhood makeCallback(cb), view, $.toJSON(node_list)
  
  
  #@getNeighboursFromDatabase = (id) ->
  #  elem = id.split "::"
  #  TinaService.getNGrams 0, elem[1], success: (data) ->
    

  freeze: ->
    log "Tinaviz: freeze()"
    @applet.freeze()
  
  unfreeze: -> 
    log "Tinaviz: unfreeze()"
    @applet.unfreeze()
    
  getNodes: (view, category, cb) ->
    @applet.getNodes makeCallback(cb), view, category
  
  _resize: ({width,height}) ->
    log "Tinaviz: resize() -> self-resizing"
    $("#{@_config.element}").css "height", "#{height}px"
    $("#{@_config.element}").css "width", "#{width}px"
    @applet.height = height
    @applet.width = width
    @applet.resize width, height
  
  getAs: (key, type, cb) ->
    @applet.sendGet makeCallback(cb), key, type
    return
  
  get: (key, cb) ->
    @applet.sendGet makeCallback(cb), key, "Any"
    return
  
  set: (key, obj, t, cb) ->
    debug "Tinaviz: set(key: #{key}, obj: #{obj}, t: #{t})"
    cbId = makeCallback(cb)
    unless t?
      log "Warning, setting unknow (#{key}, #{obj})"
      @applet.sendSet cbId, key, obj, ""
      return

    unless t.indexOf("Tuple2") == -1
      unless t.indexOf("[Double]") == -1
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Double"
      else unless t.indexOf("[Int]") == -1
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Int"
      else unless t.indexOf("[Float]") == -1
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Float"
      else
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], ""
    else if t == "Json"
      @applet.sendSet cbId, key, $.toJSON(obj), t
    else
      @applet.sendSet cbId, key, obj, t
    return
  
      
  selectionChanged: (data) ->
    log "default selection changed #{data.selection}"
    
  viewChanged: (data) ->
    log "default view automatically changed to #{data.view}"
    
  _generateAppletHTML: ->

    buff = ""
    func = document.write
    document.write = (arg) -> buff += arg
    
    res = deployJava.writeAppletTag(
      id: "tinapplet"
      code: "eu.tinasoft.tinaviz.Main.class"
      archive: @libPath + "tinaviz-2.0-SNAPSHOT.jar"
      width: @width
      height: @height
      image: "css/branding/appletLoading.gif"
      standby: "Loading Tinaviz..."
    , 
      engine: @engine
      js_context: @context
      root_prefix: @path
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
    
  _inject: (cb) ->
    log "Tinaviz: preparing first hook.."
    makeCallback (data) =>
      log "Tinaviz: Injected.."
      @applet = $(@appletTag)[0]
      unless @applet?
        alert "Error: couldn't get the applet!"
        return
      @cb()
    log "Tinaviz: Injecting..."
    tag.html @_generateAppletHTML()
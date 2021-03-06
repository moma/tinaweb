cblatency = 2 # ms
cbCounter = 0
callbacks = {}

# custom callback engine (necessary to communicate with the Scala actor-based applet)
# TODO: empty the callbacks list after some time (collect garbage)
callCallback = (cb_id, cb_args) ->
  delay cblatency, -> callbacks[cb_id] $.parseJSON(cb_args)
makeCallback = (cb = ->) ->
  id = cbCounter++
  callbacks[id] = cb
  "#{id}"

class Tinaviz

  constructor: ->
     
    #log "Tinaviz: called constructor()"
    
    @applet = undefined 

    @config =
      jarFile: "tinaviz-2.0-SNAPSHOT.jar"
      loadingImage: "css/branding/appletLoading.gif"
      appletId: "tinapplet"
      elementId: "vizdiv"
      path: ""    
      assets: ""
      context: ""
      engine: "software"
      brandingIcon: ""
      width: 10
      height: 10

    
  # configure Tinaweb using some params
  configure_using: (params) =>
    #log "Tinaviz: configure_using(params) -> loading.."
    for key, value of params
      #log "storing "+key+" as "+value
      @config[key] = value
 
  _open: (url, cb) =>
    log "Tinaviz: _open() -> opening #{url}"
    try
      @applet.openURI makeCallback(cb), url
    catch e
      logError "Tinaviz: _open() -> Couldn't import graph: " + e
      cb 
        success: false
        error: e
  
  getNodesByLabel: (label, type, cb) =>
    alert "ERROR getNodesByLabel is broken"
  
  selectByPattern: (pattern, patternMode, cb) =>
    if pattern.length > 2
      @applet.selectByPattern makeCallback(cb), pattern, patternMode
  
  selectByNeighbourPattern: (pattern, patternMode, category, cb) =>
    if pattern.length > 2
      @applet.selectByNeighbourPattern makeCallback(cb), pattern, patternMode, category
  
  highlightByPattern: (pattern, patternMode, cb) =>
    if pattern.length > 2
      @applet.highlightByPattern makeCallback(cb), pattern, patternMode
  
  highlightByNeighbourPattern: (pattern, patternMode, cb) =>
    if pattern.length > 2
      @applet.highlightByNeighbourPattern makeCallback(cb), pattern, patternMode
  
  getNodeAttributes: (view, id, cb) =>
    @applet.getNodeAttributes makeCallback(cb), view, id
  
  getNeighbourhood: (view, node_list, cb) =>
    @applet.getNeighbourhood makeCallback(cb), view, $.toJSON(node_list)
  
  
  #@getNeighboursFromDatabase = (id) ->
  #  elem = id.split "::"
  #  TinaService.getNGrams 0, elem[1], success: (data) ->

  freeze: => 
    #log "freezing"
    @applet.freeze()
  
  unfreeze: =>
    #log "unfreezing"
    @applet.unfreeze()
    
  getNodes: (view, category, cb) => @applet.getNodes makeCallback(cb), view, category
  
  _resize: ({width,height}) =>
    log "Tinaviz: resize() -> self-resizing"
    $("#{@config.element}").css "height", "#{height}px"
    $("#{@config.element}").css "width", "#{width}px"
    @applet?.height = height
    @applet?.width = width
    @applet?.resize? width, height
  
  getAs: (key, type, cb) =>
    @applet.sendGet makeCallback(cb), key, type
    return
  
  get: (key, cb) =>
    @applet.sendGet makeCallback(cb), key, "Any"
    return
  
  set: (key, obj, t, cb) =>
    cbId = makeCallback(cb)
    #debug "Tinaviz: set(key: #{key}, obj: #{obj}, t: #{t}, cb: #{cbId})"
    unless t?
      o = _ obj
      if o.isNumber
        t = "Double" # however, sometimes we might need an "int"
      else if o.isBoolean
        t = "Boolean"
      else if current.isString
        t = "String"
      else
        log "Warning, setting unknow (#{key}, #{obj})"
        @applet.sendSet cbId, key, obj, ""
        return
    #log "type ----> #{t}"
    unless t.indexOf("Tuple2") is -1
      unless t.indexOf("[Double]") is -1
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Double"
      else unless t.indexOf("[Int]") is -1
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Int"
      else unless t.indexOf("[Float]") is -1
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], "Float"
      else
        @applet.sendSetTuple2 cbId, key, obj[0], obj[1], ""
    else if t is "Json"
      @applet.sendSet cbId, key, $.toJSON(obj), t
    else
      @applet.sendSet cbId, key, obj, t
    return
  
  _generateAppletHTML: ->

    buff = ""
    func = document.write
    document.write = (arg) -> buff += arg
    res = deployJava.writeAppletTag(
      id: @config.appletId
      code: "eu.tinasoft.tinaviz.Main.class"
      archive: "#{@config.path}#{@config.jarFile}"
      width: @config.width
      height: @config.height
      image: @config.loadingImage
      standby: "Loading Tinaviz..."
    , 
      engine: @config.engine
      js_context: @config.context
      root_prefix: @config.path
      brandingIcon:  @config.path + "tina_icon.png"
      progressbar: false
      boxbgcolor: "#FFFFFF"
      boxmessage: "Loading Tinaviz..."
      image: @config.loadingImage
      mayscript: true
      scriptable: true
    )
    document.write = func
    #log "html: "
    #log buff
    buff
    
  _inject: (cb) =>
    #log "Tinaviz: preparing first hook.."
    makeCallback (data) =>
      #log "Tinaviz: Injected.."
      @applet = $("##{@config.appletId}")[0]
      if @applet
        cb()
      else
        alert "applet couldn't be initialized, should put this in results"
    log @config
    #log "Tinaviz: Injecting..."
    $("##{@config.elementId}").html @_generateAppletHTML()
tinaviz = {}

delay = (t,f) -> setTimeout f, t

repeat = (t,f) -> setInterval f, t

log = (msg) ->
  try
    console.log msg 
  catch e
    return
  
debug = (msg) ->
  try
    console.log msg
  catch e
    return
  
logError = (msg) ->
  try
    console.error msg
  catch e
    alert msg
    return
  
getScreenWidth = ->
  x = 0
  if self.innerHeight
    x = self.innerWidth
  else if document.documentElement and document.documentElement.clientHeight
    x = document.documentElement.clientWidth
  else x = document.body.clientWidth  if document.body
  x
getScreenHeight = ->
  y = 0
  if self.innerHeight
    y = self.innerHeight
  else if document.documentElement and document.documentElement.clientHeight
    y = document.documentElement.clientHeight
  else y = document.body.clientHeight  if document.body
  y


show = (k, speed="slow") ->
  o = if ((typeof k) is "string") then $(k) else k
  o.fadeIn speed

hide = (k, speed="slow") ->
  o = if ((typeof k) is "string") then $(k) else k
  o.fadeOut speed


strToBoolean = (s) ->
  switch s.toLowerCase()
    when "true", "yes", "on", "1" then true
    when "false", "no", "off", "0", null then false
    else Boolean s

loadURLParamsUsing = (config) ->
  for param in window.location.href.slice(window.location.href.indexOf('?') + 1).split('&')
    [key,value] = param.split '='
    if key in config
      current = _ config[key]
      if current.isNumber
        config[key] = parseFloat value
      else if current.isBoolean
        strToBoolean value
        config[key] = parseBool value
      else if current.isString
        config[key] = "#{value}"
      else
        alert "UTIL cannot overwrite param #{key} (#{config[key]}) with #{value}"
  config
  
  
  
htmlEncode = (value) ->
  $("<div/>").text(value).html()
htmlDecode = (t) ->
  # try to detect if its really necessary to decode 
  # (right I should use a regex to look for HTML tags but I'm very pressé)
  if t.indexOf('<br>') >0 or t.indexOf('<br/>') >0 or t.indexOf('</a>') >0
    $("<div/>").html(t).text()
  else
    value # avoid too much decoding
decodeJSON = (encvalue) ->
  if encvalue?
    jQuery.trim encvalue.replace(/\+/g, " ").replace(/%21/g, "!").replace(/%27/g, "'").replace(/%28/g, "(").replace(/%29/g, ")").replace(/%2A/g, "*").replace(/\"/g, "'")
  else
    ""

#      
#      jQuery nap 1.0.0
#      www.frebsite.nl
#      Copyright (c) 2010 Fred Heusschen
#      Licensed under the MIT license.
#      http://www.opensource.org/licenses/mit-license.php
#

(($) ->
  $.fn.nap = (data) ->
    defaults =
      fallAsleep: ->
      wakeUp: ->
      standByTime: 10
    for k, v of data
      defaults[k] = v
    fallAsleep = defaults.fallAsleep
    wakeUp = defaults.wakeUp
    standByTime = defaults.standByTime

    if typeof (standByTime) is "number" and standByTime > 0
      $.fn.nap.standByTime = standByTime
      $.fn.nap.pressSnooze() if $.fn.nap.readySetGo
    unless $.fn.nap.readySetGo
      $.fn.nap.readySetGo = yes
      $(window).mousemove -> $.fn.nap.interaction()
      $(window).keyup     -> $.fn.nap.interaction()
      $(window).mousedown -> $.fn.nap.interaction()
      $(window).scroll    -> $.fn.nap.interaction()
      $.fn.nap.pressSnooze()
    @each ->
      $.fn.nap.fallAsleepFunctions.push
        func: fallAsleep
        napr: $ @
      $.fn.nap.wakeUpFunctions.push
        func: wakeUp
        napr: $ @
  $.fn.nap.standByTime = 60
  $.fn.nap.isAwake = yes
  $.fn.nap.readySetGo = no
  $.fn.nap.fallAsleepFunctions = new Array()
  $.fn.nap.wakeUpFunctions = new Array()

  $.fn.nap.fallAsleep = ->
    $.fn.nap.isAwake = no
    clearInterval $.fn.nap.alarmClock
    $.fn.nap.callFunctions $.fn.nap.fallAsleepFunctions

  $.fn.nap.wakeUp = ->
    $.fn.nap.isAwake = yes
    $.fn.nap.callFunctions $.fn.nap.wakeUpFunctions

  $.fn.nap.pressSnooze = ->
    clearInterval $.fn.nap.alarmClock
    $.fn.nap.alarmClock = delay $.fn.nap.standByTime * 1000, ->
      $.fn.nap.fallAsleep()

  $.fn.nap.interaction = ->
    $.fn.nap.wakeUp() unless $.fn.nap.isAwake
    $.fn.nap.pressSnooze()

  $.fn.nap.callFunctions = (f) ->
    for i of f
      switch typeof f[i].func
        when "function"
          f[i].func()
        when "string"
          f[i].napr.trigger f[i].func if f[i].func.length > 0
        when "object"
          for z of f[i].func
            f[i].napr.trigger f[i].func[z]
) jQuery
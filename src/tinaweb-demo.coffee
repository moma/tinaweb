class Demo

  constructor: (@startAfter=6, @repeatEvery=10) ->
    @looping = no
    $(document).nap
      fallAsleep: => @start()
      wakeUp: => @pause()
      standByTime: @startAfter

  start: ->
    console.log "demo: start() called. looping: #{@looping}"
    return if @looping
    @looping = yes
    @_loop()

  pause: -> @looping = no

  _loop: =>
    return unless @looping
    @looping = yes
    @doSomething()
    delay @repeatEvery * 1000, @_loop

  pickRandomNode: (category) ->
    arr = app.infodiv.node_list_cache[category]
    arr[Math.floor Math.random() * arr.length]

  selectRandomNeighbor: ->
    len = app.infodiv.neighbours.length
    if len > 0 and P 0.80
      nei = app.infodiv.neighbours[Math.floor Math.random() * len]
      nei_size = if nei? then nei.length else 0
      app.getView (data) ->
        if data.view is "meso" and nei_size is 0
          $("#level").click()
        else
          app.unselect ->
            app.infodiv.reset()
            node = nei[Math.floor Math.random() * nei_size]
            app.select node.id
    else 
      $("#toggle-switch").click()

  viewMesoRandomNode: ->
    app.getCategory (data) =>
      node = @pickRandomNode data.category
      app.viewMeso node.id, data.category

  selectRandomNode: ->
    app.getCategory (data) =>
      app.unselect =>
        app.infodiv.reset()
        node = @pickRandomNode data.category
        app.select node.id
  
  doSomething: ->
    #tinaviz.centerOnSelection()
    app.getView (data) =>
      console.log? "demo: doing random action: #{data.view}"
      switch data.view

        when "macro"
          console.log "demo: in macro actions"
          #if P 0.25
          #  $("#toggle-switch").click()

          #else if P 0.20
          if P 0.20 then @selectRandomNode() else @viewMesoRandomNode()

        when "meso"
          console.log "in meso actions"
          if P 0.20 then @selectRandomNeighbor() else $("#level").click()
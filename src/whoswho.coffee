jQuery.fn.disableTextSelect = ->
  @each ->
    unless typeof @onselectstart is "undefined"
      @onselectstart = ->
        false
    else unless typeof @style.MozUserSelect is "undefined"
      @style.MozUserSelect = "none"
    else
      @onmousedown = ->
        false
      
      @style.cursor = "default"

ids = 0
completion = {}
gexf = ""

$(document).ready ->
    
  log "document ready.. installing whoswho"
  
  loadGraph = (g) ->
    gexf = g
    log  "url query: "+ g
    log "injecting applet"
    if $('#frame').length is 0
      $("#visualization").html "<iframe src=\"tinaframe.html\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>"
    else
      log "applet already exists"
        
  popfilter = (label, type, options) ->
    id = ids++
    id1 = "filter" + id
    id2 = "combo" + id
    header = "<li id=\"#{id1}\" class=\"filter\" style=\"padding-top: 5px;\">"
    labelization = "<span style=\"color: #fff;\">&nbsp; #{label} </span>"
    input = "<input type=\"text\" id=\"#{id2}\" class=\"medium filter#{type}\" placeholder=\"#{type}\" />"
    footer = "</li>;"
    $(header + labelization + input + footer).insertBefore "#refine"
    $("##{id2}").filtercomplete 
      minLength: 2
      source: (request, response) ->
        $.getJSON "search_filter.php", 
          category: type
          term: request.term
        , (data, status, xhr) ->
          response data.results
    
    $("#{id1}").hide()
    show "##{id1}"
    $("##{id2}").focus()
    false
  jQuery(".unselectable").disableTextSelect()
  $(".unselectable").hover (->
    $(this).css "cursor", "default"
  ), ->
    $(this).css "cursor", "auto"
  
  hide "#search-form"
  $(".topbar").hover (->
    $(this).stop().animate opacity: 0.98, "fast"
  ), ->
    $(this).stop().animate opacity: 0.93, "fast"
  
  $.widget "custom.filtercomplete", $.ui.autocomplete, _renderMenu: (ul, items) ->
    self = this
    categories = _.groupBy(items, (o) ->
      o.category
    )
    _.each categories, (data, category) ->
      size = 0
      total = 0
      term = ""
      _.each data, (item) ->
        size = item.size
        total = item.total
        term = item.term

        myRender = (a,b) -> 
          $("<li></li>").data("item.autocomplete",b).append($("<a></a>").text(b.label)).appendTo(a)
        
        myRender ul, item
      
      ul.append "<li class='ui-autocomplete-category'>#{size}/#{total} results</li>"
      log term
      ul.highlight term
      
  $.widget "custom.scholarcomplete", $.ui.autocomplete, _renderMenu: (ul, items) ->
    self = this
    categories = _.groupBy(items, (o) ->
      o.category
    )
    _.each categories, (data, category) ->
      size = 0
      total = 0
      term = ""
      fullname = ""
      _.each data, (item) ->
        size = item.size
        total = item.total
        term = item.term
        firstname = $.trim item.firstname
        lastname = $.trim item.lastname
        fullname = $.trim "#{firstname} #{lastname}"

        myRender = (a,b) -> 
          $("<li></li>").data("item.autocomplete",b).append($("<a></a>").text(fullname)).appendTo(a)
        
        myRender ul, item
      
      ul.append "<li class='ui-autocomplete-category'>#{size}/#{total} people</li>"
      ul.highlight term
        

  $("#addfiltercountry").click ->
    popfilter "in", "countries", []
  
  $("#addfilterorganization").click ->
    popfilter "from", "organizations", []
  
  $("#addfilterlaboratory").click ->
    prefix = "working"
    popfilter "#{prefix} at", "laboratories", []
  
  $("#addfilterkeyword").click ->
    prefix = "working"
    popfilter "#{prefix} on", "keywords", []
  
  $("#addfiltertag").click ->
    popfilter "tagged", "tags", []

  $("#register").click ->
    console.log "clicked on print"
    window.open "http://main.csregistry.org/Whoswhodata"

  $("#searchname").scholarcomplete 
    minLength: 2
    source: (request, response) ->
      log "searchname: #{request.term}"
      $.getJSON "search_scholar.php", 
        category: "login"
        login: request.term
      , (data, status, xhr) ->
        log "results: #{data.results}"
        response data.results
    select: (event, ui) ->
      console.log ui.item
      if ui.item?
        console.log "Selected: " + ui.item.firstname + " aka " + ui.item.id

        delay 100, ->
          $("#searchname").attr "value", ui.item.firstname + " " + ui.item.lastname
                
        $("#searchname").attr "placeholder", ""
        
        $("#print2").click ->
          console.log "clicked on print"
          window.open "print_scholar_directory.php?query=#{ui.item.id}", "Scholar's list"
          
        $("#generate2").click ->
          hide ".hero-unit"
          $("#welcome").fadeOut "slow", ->
            show "#loading", "fast"
            loadGraph "get_scholar_graph.php?login=#{ui.item.id}"
      ""+ui.item.firstname + " " + ui.item.lastname
  
  collectFilters = (cb) ->
    #log "loading"
    collect = (k) ->
      t = []
      log "collecting .filter#{k}"
      $(".filter#{k}").each (i, e) ->
        value = $(e).val()
        if value?
          log "got: "+value
          value = $.trim value
          log "sanitized: "+value
          if value isnt " " or value isnt ""
            log "keeping "+value
            t.push(value)
      t
      
    log "reading filters forms.."
    query = 
      categorya: $.trim $("#categorya :selected").text()
      categoryb: $.trim $("#categoryb :selected").text()
      keywords: collect "keywords"
      countries: collect "countries"
      laboratories: collect "laboratories"
      coloredby: []
      tags: collect "tags"
      organizations: collect "organizations"
      
    log "raw query: "
    log query
    query = encodeURIComponent JSON.stringify(query)
    cb query
      
  $("#generate").click ->
    hide ".hero-unit"
    $("#welcome").fadeOut "slow", ->
      show "#loading", "fast"
      collectFilters (query) ->
        loadGraph "getgraph.php?query=#{query}" 

  $("#print").click ->
    console.log "clicked on print"
    collectFilters (query) ->
      console.log "collected filters: #{query}"
      window.open "print_directory.php?query=#{query}", "Scholar's list"

  
  # ACTIONS
  hide "#loading"
  cache = {}
  xhrs = {}

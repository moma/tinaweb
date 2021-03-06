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
graphUrl = ""
getGraph = -> 
  log "getting graph from parent frame (via local var)"
  graphUrl

$(document).ready ->
    
  log "document ready.. installing whoswho"
  
  popfilter = (label, type, options) ->
    id = ids++
    id1 = "filter" + id
    id2 = "combo" + id
    header = "<li id=\"#{id1}\" class=\"filter\" style=\"padding-top: 5px;\">"
    labelization = "<span style=\"color: #fff;\">&nbsp; #{label} </span>"
    input = "<input type=\"text\" id=\"#{id2}\" class=\"medium filter#{type}\" placeholder=\"#{type}\" />"
    footer = "</li>;"
    $(header + labelization + input + footer).insertBefore "#refine"
    $("##{id2}").catcomplete 
      minLength: 2
      source: (request, response) ->
        term = request.term
        $.getJSON "autocomplete.php", 
          category: type
          term: request.term
        , (data, status, xhr) ->
          response data.results
    
    $("#{id1}").hide()
    show "##{id1}"
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
  
  $.widget "custom.catcomplete", $.ui.autocomplete, _renderMenu: (ul, items) ->
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
        self._renderItem ul, item
      
      ul.append "<li class='ui-autocomplete-category'>#{size}/#{total} results</li>"
      log term
      ul.highlight term
  
  cache = {}
  xhrs = {}
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
  
  hide "#loading"
  $("#example").click ->
    hide ".hero-unit"
    $("#welcome").fadeOut "slow", ->
      show "#loading", "fast"
  
  $("#generate").click ->
    hide ".hero-unit"
    $("#welcome").fadeOut "slow", ->
      show "#loading", "fast"
      log "loading"
      collect = (k) ->
        t = []
        log "collecting .filter#{k}"
        $(".filter#{k}").each (i, e) ->
          value = $(e).val()
          return  if value == undefined
          value = value.replace(/^\s+/g, "").replace(/\s+$/g, "")
          t.push value  if value is "" or value is " "
        t
      
      log "collecting.."
      query = 
        categorya: $("#categorya :selected").text()
        categoryb: $("#categoryb :selected").text()
        keywords: collect "keywords"
        countries: collect "countries"
        laboratories: collect "laboratories"
        coloredby: []
        tags: collect "tags"
        organizations: collect "organizations"
      
      log query
      query =  encodeURIComponent JSON.stringify(query)
      url = "getgraph.php?query=#{query}"
      log url
      graphUrl = url
      $("#visualization").html "<iframe src=\"tinaframe.html\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>"
    
    false

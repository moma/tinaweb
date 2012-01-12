jQuery.fn.disableTextSelect = ->
  @each ->
    unless typeof @onselectstart == "undefined"
      @onselectstart = ->
        false
    else unless typeof @style.MozUserSelect == "undefined"
      @style.MozUserSelect = "none"
    else
      @onmousedown = ->
        false
      
      @style.cursor = "default"

ids = 0
completion = {}
graphUrl = ""
getGraph = -> 
  console.log("getting graph from parent frame (via local var)")
  graphUrl

$(document).ready ->
    
  log "document ready.. installing tinaviz"
  tinaviz.install()
  
  popfilter = (label, type, options) ->
    id = ids++
    id1 = "filter" + id
    id2 = "combo" + id
    header = "<li id=\"" + id1 + "\" class=\"filter\" style=\"padding-top: 5px;\">"
    labelization = "<span style=\"color: #fff;\">&nbsp; " + label + " </span>"
    input = "<input type=\"text\" id=\"" + id2 + "\" class=\"medium filter" + type + "\" placeholder=\"" + type + "\" />"
    footer = "</li>;"
    $(header + labelization + input + footer).insertBefore "#refine"
    $("#" + id2).catcomplete 
      minLength: 2
      source: (request, response) ->
        term = request.term
        $.getJSON "autocomplete.php", 
          category: type
          term: request.term
        , (data, status, xhr) ->
          response data.results
    
    $("#" + id1 + "").hide()
    $("#" + id1 + "").fadeIn 500
    false
  jQuery(".unselectable").disableTextSelect()
  $(".unselectable").hover (->
    $(this).css "cursor", "default"
  ), ->
    $(this).css "cursor", "auto"
  
  $("#search-form").hide()
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
      
      ul.append "<li class='ui-autocomplete-category'>" + size + "/" + total + " results</li>"
      console.log term
      ul.highlight term
  
  cache = {}
  xhrs = {}
  $("#addfiltercountry").click ->
    popfilter "in", "countries", []
  
  $("#addfilterorganization").click ->
    popfilter "from", "organizations", []
  
  $("#addfilterlaboratory").click ->
    prefix = "working"
    popfilter prefix + " at", "laboratories", []
  
  $("#addfilterkeyword").click ->
    prefix = "working"
    popfilter prefix + " on", "keywords", []
  
  $("#addfiltertag").click ->
    popfilter "tagged", "tags", []
  
  $("#loading").fadeOut()
  $("#example").click ->
    $(".hero-unit").fadeOut "slow"
    $("#welcome").fadeOut "slow", ->
      $("#loading").fadeIn "fast"
  
  $("#generate").click ->
    $(".hero-unit").fadeOut "slow"
    $("#welcome").fadeOut "slow", ->
      $("#loading").fadeIn "fast"
      console.log "loading"
      collect = (k) ->
        t = []
        console.log "collecting " + ".filter" + k + ""
        $(".filter" + k + "").each (i, e) ->
          value = $(e).val()
          return  if value == undefined
          value = value.replace(/^\s+/g, "").replace(/\s+$/g, "")
          t.push value  if value == "" or value == " "
        t
      
      console.log "collecting.."
      query = 
        categorya: $("#categorya :selected").text()
        categoryb: $("#categoryb :selected").text()
        keywords: collect("keywords")
        countries: collect("countries")
        laboratories: collect("laboratories")
        coloredby: []
        tags: collect("tags")
        organizations: collect("organizations")
      
      console.log query
      url = "getgraph.php?query=" + encodeURIComponent(JSON.stringify(query))
      console.log url
      graphUrl = url
      $("#visualization").html "<iframe src=\"tinaframe.html\" class=\"frame\" border=\"0\" frameborder=\"0\" scrolling=\"no\" id=\"frame\" name=\"frame\"></iframe>"
    
    false

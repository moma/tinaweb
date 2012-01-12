delay = (t,f) -> setTimeout f, t

repeat = (t,f) -> setInterval f, t

displayNodeRow = (label, id, category) ->
  $("#node_table > tbody").append $("<tr></tr>").append($("<td id='node_list_" + id + "'></td>").text(label).click((eventObject) ->
    tinaviz.viewMeso id, category
  ))
InfoDiv = 
  id: null
  selection: []
  neighbours: []
  node_list_cache: {}
  last_category: ""
  node_table: null
  label: null
  contents: null
  cloud: null
  cloudSearch: null
  cloudSearchCopy: null
  unselect_button: null
  categories: 
    NGram: "Keyphrases"
    Document: "Documents"
  
  display_current_category: ->
    categories = @categories
    tinaviz.getView (data) ->
      view = data.view
      tinaviz.getCategory (data) ->
        cat = data.category
        if view == "macro"
          $("#toggle-switch").button "option", "label", categories[cat]
        else
          $("#toggle-switch").button "option", "label", categories[cat] + " neighbours"
  
  display_current_view: ->
    tinaviz.getView (data) ->
      view = data.view
      if view != undefined
        level = $ "#level"
        level.button "option", "label", view + " level"
        title = $ "#infodiv > h3:first"
        if view == "meso"
          level.addClass "ui-state-highlight"
          title.addClass "ui-state-highlight"
        else
          level.removeClass "ui-state-highlight"
          title.removeClass "ui-state-highlight"
  
  mergeNeighbours: (category, neighbours) ->
    merged = []
    for node of neighbours
      for neighb of neighbours[node]
        if neighb of merged
          merged[neighb]["degree"]++
        else unless neighbours[node][neighb]["category"] == category
          merged[neighb] = 
            spanid: neighb
            id: neighbours[node][neighb]["id"]
            label: neighbours[node][neighb]["label"]
            degree: 1
            weight: neighbours[node][neighb]["weight"]
            category: neighbours[node][neighb]["category"]
    @neighbours = Object.keys merged
    merged = numericListSort Object.values(merged), "degree"
    merged
  
  updateTagCloud: (node_list, neighbours) ->
    return  if Object.size(node_list) == 0
    tinaviz.getCategory (data) ->
      cat = data.category
      neighbours = @mergeNeighbours cat, neighbours
      @cloudSearch.empty()
      Googlerequests = "http://www.google.com/#q="
      PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term="
      requests = ""
      i = 0
      
      while i < neighbours.length
        tag = neighbours[i]
        tagLabel = tag.label
        tagLabel = jQuery.trim tagLabel
        requests = requests + "%22" + tagLabel.replace(" ", "+") + "%22"
        requests = requests + "+AND+"  if i < neighbours.length - 1
        i++
      if cat != undefined
        oppositeRealName = @categories[tinaviz.getOppositeCategory(cat)]
        if oppositeRealName != undefined
          tmp = ""
          tmp = "Search on: <a href=\""
          tmp += Googlerequests
          tmp += requests
          tmp += "\" alt=\"search on google\" target=\"_BLANK\"><img src=\""
          tmp += tinaviz.getPath()
          tmp += "css/branding/google.png\" />Google</a> &nbsp;"
          tmp += " <a href=\"" + PubMedrequests + requests
          tmp += "\" alt=\"search on PubMed\" target=\"_BLANK\"><img src=\""
          tmp += tinaviz.getPath()
          tmp += "css/branding/pubmed.png\" />Pubmed</a>"
          @cloudSearch.append tmp
      sizecoef = 15
      const_doc_tag = 12
      tooltip = ""
      tagcloud = $ "<p></p>"
      nb_displayed_tag = 0
      i = 0
      
      while i < neighbours.length
        if nb_displayed_tag < 20
          nb_displayed_tag++
          tag = neighbours[i]
          tagspan = $("<span id='" + tag.spanid + "'></span>")
          tagspan.addClass "ui-widget-content"
          tagspan.addClass "viz_node"
          tagspan.html tag.label
          do ->
            attached_id = tag.id
            attached_cat = tag.category
            tagspan.click ->
              tinaviz.viewMeso attached_id, attached_cat, ->
          if neighbours.length == 1
            if tag["category"] == "Document"
              tagspan.css "font-size", const_doc_tag
            else
              tagspan.css "font-size", Math.floor(sizecoef * (Math.min(20, Math.log(1.5 + tag.weight))))
            tooltip = "click on a label to switch to its meso view - size is proportional to edge weight"
          else
            tagspan.css "font-size", Math.max(Math.floor(sizecoef * Math.min(2, Math.log(1.5 + tag.degree))), 15)
            tooltip = "click on a label to switch to its meso view - size is proportional to the degree"
          tagcloud.append tagspan
          tagcloud.append ", &nbsp;"  if i != neighbours.length - 1 and neighbours.length > 1
        else if nb_displayed_tag == 20
          tagcloud.append "[...]"
          nb_displayed_tag++
        else
          break
        i++
      @cloud.empty()
      @cloud.append "<h3>selection related to " + oppositeRealName + ": <span class=\"ui-icon ui-icon-help icon-right\" title=\"" + tooltip + "\"></span></h3>"
      @cloud.append tagcloud
      @cloudSearchCopy.empty()
      @cloudSearchCopy.append "<h3>global search on " + oppositeRealName + ": <span class=\"ui-icon ui-icon-help icon-right\" title=\"" + tooltip + "\"></span></h3>"
      @cloudSearchCopy.append tagcloud.clone()
  
  updateInfo: (lastselection) ->
    tinaviz.getCategory (data) ->
      cat = data.category
      labelinnerdiv = $ "<div></div>"
      contentinnerdiv = $ "<div></div>"
      number_of_label = 0
      for id of lastselection
        node = lastselection[id]
        if node.category == cat
          label = @getNodeLabel(node)
          number_of_label++
          if number_of_label < 5
            labelinnerdiv.append $("<b></b>").text(label)
          else
            labelinnerdiv.append $("<b></b>").text("[...]")  if number_of_label == 5
          @selection.push node.id
          console.log "label: " + label
          contentinnerdiv.append $("<b></b>").text(label)
          htmlContent = htmlDecode(decodeJSON(node.content))
          console.log "  htmlContent: " + htmlContent
          contentinnerdiv.append $("<p></p>").html(htmlContent)
          contentinnerdiv.append $("<p></p>").html(@getSearchQueries(label, cat))
      unless @selection.length == 0
        @label.empty()
        @unselect_button.show()
        @contents.empty()
        @label.append alphabeticJquerySort(labelinnerdiv, "b", ", &nbsp;")
        @contents.append contentinnerdiv
      else
        @reset()
  
  update: (view, lastselection) ->
    unless @id?
      alert "error : infodiv not initialized with its HTML DIV id"
      return
    if Object.size(lastselection) == 0
      @reset()
      return
    @selection = []
    @updateInfo lastselection
    tinaviz.getNeighbourhood "macro", @selection, (data) ->
      console.log "received neighbourhood"
  
  reset: ->
    unless @id?
      alert "error : infodiv not initialized with its HTML DIV id"
      return
    @unselect_button.hide()
    @contents.empty().append $("<h4></h4>").html("click on a node to begin exploration")
    @contents.empty().append $("<h4></h4>").html("<h2>Navigation tips</h2>" + "<p align='left'>" + "<br/>" + "<i>Basic interactions</i><br/><br/>" + "Click on a node to select/unselect and get its information.  In case of multiple selection, the button <img src='" + tinaviz.getPath() + "css/branding/unselect.png' alt='unselect' align='top' height=20/>  clears all selections.<br/><br/>The switch button <img src='" + tinaviz.getPath() + "css/branding/switch.png' alt='switch' align='top' height=20 /> allows to change the view type." + "<br/><br/>" + "<i>Graph manipulation</i><br/><br/>" + "Link and node sizes indicate their strength.<br/><br/> To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.<br/><br/> To select a more of less specific area of the graph, use the 'nodes filter' slider.</b><br/><br/>" + "<i>Micro/Macro view</i><br/><br/>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.<br/><br/>  " + "Click on the 'all nodes' tab below to view the full clickable list of nodes.<br/><br/>Find additional tips with mouse over the question marks." + "</p>")
    @cloudSearchCopy.empty()
    @cloudSearch.empty()
    @cloud.empty()
    @selection = []
    @neighbours = []
    @last_category = ""
    return
  
  updateNodeList: (view, category) ->
    @display_current_category()
    return  if category == @last_category
    tinaviz.node_list_cache = {}  if tinaviz.node_list_cache == undefined

    whenReceivingNodeList = (data) =>
      console.log "receiving and updating node.list: " + (data.nodes.length) + " nodes"
      return  if category == _this.last_category
      @node_list_cache = {}  if _this.node_list_cache == undefined
      @node_list_cache[category] = alphabeticListSort(data.nodes, "label")
      @.node_table.empty()
      @last_category = category
      node_list = _this.node_list_cache[category]
      if node_list?
        i = 0
        
        while i < node_list.length
          do ->
            rowLabel = htmlDecode decodeJSON( node_list[i]["label"] )
            rowId = decodeJSON node_list[i]["id"]
            rowCat = category
            delay 0, -> displayNodeRow rowLabel, rowId, rowCat
          i++
    
    tinaviz.getNodes view, category, whenReceivingNodeList
  
  getSearchQueries: (label, cat) ->
    SearchQuery = label.replace(RegExp(" ", "g"), "+")
    if cat == "Document"
      $("<p></p>").html "<a href=\"http://www.google.com/#hl=en&source=hp&q=%20" + SearchQuery.replace(",", "OR") + "%20\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/google.png\" height=15 width=15> </a><a href=\"http://en.wikipedia.org/wiki/" + label.replace(RegExp(" ", "g"), "_") + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/wikipedia.png\" height=15 width=15> </a><a href=\"http://www.flickr.com/search/?w=all&q=" + SearchQuery + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/flickr.png\" height=15 width=15> </a>"
    else if cat == "NGram"
      $("<p></p>").html "<a href=\"http://www.google.com/#hl=en&source=hp&q=%20" + SearchQuery.replace(",", "OR") + "%20\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/google.png\" height=15 width=15> </a><a href=\"http://en.wikipedia.org/wiki/" + label.replace(RegExp(" ", "g"), "_") + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/wikipedia.png\" height=15 width=15> </a><a href=\"http://www.flickr.com/search/?w=all&q=" + SearchQuery + "\" align=middle target=blank height=15 width=15> <img src=\"" + tinaviz.getPath() + "css/branding/flickr.png\" height=15 width=15> </a>"
    else
      $ "<p></p>"

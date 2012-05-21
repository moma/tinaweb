
displayNodeRow = (label, id, category) ->
  a = $("<td id='node_list_#{id}'></td>").text(label).click (e) ->
    app.viewMeso id, category
  b = $("<tr></tr>").append(a)
  $("#node_table > tbody").append(b)

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
    app.getView (data) =>
      view = data.view
      app.getCategory (data) =>
        cat = data.category
        if view is "macro"
          $("#toggle-switch").button "option", "label", categories[cat]
        else
          $("#toggle-switch").button "option", "label", categories[cat] + (if view is macro then '' else " neighbours")
  
  display_current_view: ->
    app.getView (data) =>
      view = data.view
      if view isnt undefined
        level = $ "#level"
        level.button "option", "label", "#{view} level"
        title = $ "#infodiv > h3:first"
        if view is "meso"
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
        else unless neighbours[node][neighb]["category"] is category
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
    return  if Object.size(node_list) is 0
    
    app.getCategory (data) =>
      cat = data.category
      neighbours = @mergeNeighbours cat, neighbours
      @cloudSearch.empty()
      Googlerequests = "http://www.google.com/#q="
      PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term="
      requests = ""
      i = 0
      
      while i < neighbours.length
        tagLabel = jQuery.trim neighbours[i].label
        requests = "#{requests}%22#{tagLabel.replace(' ', '+')}%22"
        requests += "+AND+" if i < neighbours.length - 1
        i++
      if cat?
        oppositeRealName = @categories[app.getOppositeCategory(cat)]
        if oppositeRealName?
          tmp = "Search on: <a href=\""
          tmp += Googlerequests
          tmp += requests
          tmp += "\" alt=\"search on google\" target=\"_BLANK\"><img src=\""
          tmp += app.config.assets
          tmp += "css/branding/google.png\" />Google</a> &nbsp;"
          tmp += " <a href=\"" + PubMedrequests + requests
          tmp += "\" alt=\"search on PubMed\" target=\"_BLANK\"><img src=\""
          tmp += app.config.assets
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
          tagspan = $("<span id='#{tag.spanid}'></span>")
          tagspan.addClass "ui-widget-content"
          tagspan.addClass "viz_node"
          tagspan.html tag.label
          do ->
            attached_id = tag.id
            attached_cat = tag.category
            tagspan.click ->
              app.viewMeso attached_id, attached_cat, ->
          if neighbours.length is 1
            if tag["category"] is "Document"
              tagspan.css "font-size", const_doc_tag
            else
              tagspan.css "font-size", Math.floor(sizecoef * (Math.min(20, Math.log(1.5 + tag.weight))))
            tooltip = "click on a label to switch to its meso view - size is proportional to edge weight"
          else
            tagspan.css "font-size", Math.max(Math.floor(sizecoef * Math.min(2, Math.log(1.5 + tag.degree))), 15)
            tooltip = "click on a label to switch to its meso view - size is proportional to the degree"
          tagcloud.append tagspan
          tagcloud.append ", &nbsp;"  if i != neighbours.length - 1 and neighbours.length > 1
        else if nb_displayed_tag is 20
          tagcloud.append "[...]"
          nb_displayed_tag++
        else
          break
        i++
      @cloud.empty()
      
      tmp1 = $("<h3>selection related to #{oppositeRealName}: 
        <span class=\"ui-icon ui-icon-help icon-right\" title=\"#{tooltip}\"></span>
        </h3>").hide()
      @cloud.append tmp1
      show tmp1
      
      tagcloud.hide()
      @cloud.append tagcloud
      show tagcloud
      
      @cloudSearchCopy.empty()
      tmp2 = $("<h3>global search on #{oppositeRealName}: 
        <span class=\"ui-icon ui-icon-help icon-right\" title=\"#{tooltip}\"></span>
        </h3>").hide()
      @cloudSearchCopy.append tmp2
      show tmp2
      
      tagcloud2 = tagcloud.clone()
      tagcloud2.hide()
      @cloudSearchCopy.append tagcloud2
      show tagcloud2
  
  updateInfo: (lastselection) ->
    app.getCategory (data) =>
      cat = data.category
      labelinnerdiv = $ "<div></div>"
      contentinnerdiv = $ "<div></div>"
      number_of_label = 0
      for id of lastselection
        node = lastselection[id]
        if node.category is cat
          label = node.label
          number_of_label++
          if number_of_label < 5
            labelinnerdiv.append $("<b></b>").text(label)
          else
            labelinnerdiv.append $("<b></b>").text("[...]")  if number_of_label is 5
          @selection.push node.id
          #log "label: " + label
          contentinnerdiv.append $("<b></b>").text(label)
          htmlContent = htmlDecode(decodeJSON(node.content))
          #log "  htmlContent: " + htmlContent
          contentinnerdiv.append $("<p></p>").html(htmlContent)
          contentinnerdiv.append $("<p></p>").html(@getSearchQueries(label, cat))
      unless @selection.length is 0
        @label.empty()
        @unselect_button.show()
        @contents.empty()
        @label.append alphabeticJquerySort(labelinnerdiv, "b", ", &nbsp;")
        @contents.append contentinnerdiv
      else
        @reset()
  
  update: (view, lastselection) ->
    return @reset() if Object.size(lastselection) is 0
    @selection = []
    @updateInfo lastselection
    app.getNeighbourhood "macro", @selection, (data) =>
      @updateTagCloud data.nodes, data.neighbours
  
  reset: ->
    @unselect_button.hide()
    @contents.empty().append $("<h4></h4>").html("click on a node to begin exploration")
    imgPath = "#{app.config.assets}css/branding/"
    @label.empty()
    html = "
      <h2>Navigation tips</h2>
      <p align='left'>
        <br/>
        <i>Basic interactions</i>
        <br/><br/>
        Click on a node to select/unselect and get its information. 
        In case of multiple selection, the button 
         <img src='#{imgPath}unselect.png' alt='unselect' align='top' height=20/> 
        clears all selections.
        <br/><br/>
        The switch button
         <img src='#{imgPath}switch.png' alt='switch' align='top' height=20 /> 
        allows to change the view type.
        <br/><br/>
        <i>Graph manipulation</i>
        <br/><br/>
        Link and node sizes indicate their strength.
        <br/><br/>
        To fold/unfold the graph (keep only strong links or weak links), use the <b>edges filter</b> sliders.
        <br/><br/>
        To select a more of less specific area of the graph, use the <b>nodes filter</b> slider.
        <br/><br/>
        <i>Micro/Macro view</i>
        <br/><br/>
        To explore the neighborhood of a selection, either double click on the selected nodes, 
        either click on the macro/meso level button. Zoom out in meso view return to macro view.
        <br/><br/>
        Click on the <b>all nodes</b> tab below to view the full clickable list of nodes.
        <br/><br/>
        Find additional tips with mouse over the question marks.
        </p>"
    @contents.empty().append $("<h4></h4>").html(html)
    @cloudSearchCopy.empty()
    @cloudSearch.empty()
    @cloud.empty()
    @selection = []
    @neighbours = []
    @last_category = ""
    return
  
  updateNodeList: (view, category) ->
    @display_current_category()
    return                    if category is @last_category
    app.node_list_cache = {}  if app.node_list_cache is undefined

    app.getNodes view, category, (data) =>
      #log "receiving and updating node.list: #{data.nodes.length} nodes"
      return                  if category is _this.last_category
      @node_list_cache = {}   if _this.node_list_cache is undefined
      @node_list_cache[category] = alphabeticListSort data.nodes, "label"
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
            delay 0, => displayNodeRow rowLabel, rowId, rowCat
          i++
    
  getSearchQueries: (label, cat) ->
    SearchQuery = label.replace(RegExp(' ', 'g'), '+')
    queries =
      google: "http://www.google.com/#hl=en&source=hp&q=%20#{SearchQuery.replace(',', 'OR')}%20"
      scholars: "http://scholar.google.com/scholar#q=#hl=en&source=hp&q=%20#{SearchQuery.replace(',','OR')}%20"
      wikipedia: "http://en.wikipedia.org/wiki/#{label.replace(RegExp(' ', 'g'), '_')}"
      flickr: "http://www.flickr.com/search/?w=all&q=#{SearchQuery}"

    apis = ['google', 'wikipedia', 'flickr']

    # FEATURE when category is a document, we don't search on Google but on Google Scholars
    #apis[0] = 'scholars' if cat is "Document"

    content = ''
    for api in apis
      content += "<a href=\"#{queries[api]}\" align=middle target=blank height=15 width=15> 
                <img src=\"#{app.config.assets}css/branding/#{api}.png\" height=15 width=15>
              </a>"
    $("<p></p>").html content

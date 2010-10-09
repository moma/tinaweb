//      This program is free software; you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation; either version 2 of the License, or
//      (at your option) any later version.
//
//      This program is distributed in the hope that it will be useful,
//      but WITHOUT ANY WARRANTY; without even the implied warranty of
//      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//      GNU General Public License for more details.
//
//      You should have received a copy of the GNU General Public License
//      along with this program; if not, write to the Free Software
//      Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
//      MA 02110-1301, USA.



function IsNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

/*
 * utility modifying the Object prototype
 * to get its lenght
 */
Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
/*
 * utility returning a list
 * from the values of a given object
 */
Object.values = function(obj) {
    var values = new Array();
    for (key in obj) {
        values.push(obj[key]);
    }
    return values;
};

function decHTMLifEnc(str){
                return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
            }

function content2html(content){
    var vars = [],  htmlstring, hash;
    var titles= [];
    titles[0]='<b>Lost: </b>';
    titles[1]='<b>New: </b>';
    var htmlstring="";
    // %2b = ,
    // %2c = +
    //alert(content);
    //console.log("content:"+content);
    var hashes = content.split('_'); // obsolet and new terms

    for(var i = 0; i < hashes.length; i++){    
        
        //alert("hashes i:"+[i]);
        if (hashes[i]=='.') continue;
        htmlstring += titles[i];
        hash = hashes[i].split('-'); // list of terms
        for(var j = 0; j < hash.length; j++){
            //alert("hash j:"+hash[j]);
            //var node=tinaviz.getNodeAttributes(hash[j]);    
            var node=tinaviz.getNodeAttributes("macro",'N::'+hash[j]);
            //alert("here");
            //console.log("received from node attributes = "+node);
            //console.dir(node);
            //alert('label=' + node.label);
            //console.log(node.label);
            htmlstring+= htmlDecode(node.label.replace(/\+/g," "))+", ";
            //htmlstring+= "<a href=# onClick='javascript:" + tinaviz.open({view:'macro',gexf:'toto.gexf'})" " node.label.replace("+", " ")+", ";
        //alert(decodeJSON(node['label']));
        }
        htmlstring += "<br/>";
    }
    return htmlstring;
}

/*
 * Tri alphabetique
 */
function  alphabeticListSort(listitems,textkey) {
    listitems.sort(function(a, b) {
        var compA = a[textkey].toUpperCase();
        var compB = b[textkey].toUpperCase();
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    })
    return listitems;

};
    /*
* Generic sorting DOM lists
*/
function alphabeticJquerySort(parentdiv, childrendiv, separator) {
    var listitems = parentdiv.children(childrendiv).get();
    listitems.sort(function(a, b) {
        var compA = $(a).html().toUpperCase();
        var compB = $(b).html().toUpperCase();
        return (compA < compB) ? -1 : (compA > compB) ? 1 : 0;
    })
    $.each(listitems, function(idx, itm) {
        if ( idx != 0 && idx != listitems.length )
            parentdiv.append(separator);
        parentdiv.append(itm);
    });
    return parentdiv;
}


/*
 * To html entities
 */
function htmlEncode(value){
    return $('<div/>').text(value).html();
}

/*
 * From html entities to normal text
 */
function htmlDecode(value){
    return $('<div/>').html(value).text();
}

/*
 * Cleaning and decode entities of a value from a Json
 */
function decodeJSON(encvalue) {
    if (encvalue !== undefined)
        return jQuery.trim(decodeURIComponent(encvalue)
            .replace(/\+/g, " ").replace(/%21/g, "!")
            .replace(/%27/g, "'").replace(/%28/g, "(")
            .replace(/%29/g, ")").replace(/%2A/g, "*")
            .replace(/\"/g,"'")
            );
    else
        return "";
}


/* useful for fullscreen mode */

function getScreenWidth() {
    var x = 0;
    if (self.innerHeight) {
        x = self.innerWidth;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        x = document.documentElement.clientWidth;
    }
    else if (document.body) {
        x = document.body.clientWidth;
    }
    return x;
}

/* useful for fullscreen mode */
function getScreenHeight() {
    var y = 0;
    if (self.innerHeight) {
        y = self.innerHeight;
    }
    else if (document.documentElement && document.documentElement.clientHeight) {
        y = document.documentElement.clientHeight;
    }
    else if (document.body) {
        y = document.body.clientHeight;
    }

    return y;
}

var resize = function() {
    var infoDivWidth = 390;

    var size = {
        w: getScreenWidth() - infoDivWidth - 55,
        h: getScreenHeight() - $("#hd").height() - $("#ft").height() - 60
    };

    $("#appletdiv").css('width', size.w);
    $("#infodiv").css('width', infoDivWidth);
    $("#infodivparent").css('height', size.h);
    return size;
};

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}


/* JSON PLUGIN FOR JQUERY - http://code.google.com/p/jquery-json */
(function($){
    $.toJSON=function(o)

    {
        if(typeof(JSON)=='object'&&JSON.stringify)
            return JSON.stringify(o);
        var type=typeof(o);
        if(o===null)
            return"null";
        if(type=="undefined")
            return undefined;
        if(type=="number"||type=="boolean")
            return o+"";
        if(type=="string")
            return $.quoteString(o);
        if(type=='object')

        {
            if(typeof o.toJSON=="function")
                return $.toJSON(o.toJSON());
            if(o.constructor===Date)

            {
                var month=o.getUTCMonth()+1;
                if(month<10)month='0'+month;
                var day=o.getUTCDate();
                if(day<10)day='0'+day;
                var year=o.getUTCFullYear();
                var hours=o.getUTCHours();
                if(hours<10)hours='0'+hours;
                var minutes=o.getUTCMinutes();
                if(minutes<10)minutes='0'+minutes;
                var seconds=o.getUTCSeconds();
                if(seconds<10)seconds='0'+seconds;
                var milli=o.getUTCMilliseconds();
                if(milli<100)milli='0'+milli;
                if(milli<10)milli='0'+milli;
                return'"'+year+'-'+month+'-'+day+'T'+
                hours+':'+minutes+':'+seconds+'.'+milli+'Z"';
            }
            if(o.constructor===Array)
            {
                var ret=[];
                for(var i=0;i<o.length;i++)
                    ret.push($.toJSON(o[i])||"null");
                return"["+ret.join(",")+"]";
            }
            var pairs=[];
            for(var k in o){
                var name;
                var type=typeof k;
                if(type=="number")
                    name='"'+k+'"';
                else if(type=="string")
                    name=$.quoteString(k);else
                    continue;
                if(typeof o[k]=="function")
                    continue;
                var val=$.toJSON(o[k]);
                pairs.push(name+":"+val);
            }
            return"{"+pairs.join(", ")+"}";
        }
    };
    
    $.evalJSON=function(src)

    {
        if(typeof(JSON)=='object'&&JSON.parse)
            return JSON.parse(src);
        return eval("("+src+")");
    };

    $.secureEvalJSON=function(src)

    {
        if(typeof(JSON)=='object'&&JSON.parse)
            return JSON.parse(src);
        var filtered=src;
        filtered=filtered.replace(/\\["\\\/bfnrtu]/g,'@');
        filtered=filtered.replace(/"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,']');
        filtered=filtered.replace(/(?:^|:|,)(?:\s*\[)+/g,'');
        if(/^[\],:{}\s]*$/.test(filtered))
            return eval("("+src+")");else
            throw new SyntaxError("Error parsing JSON, source is not valid.");
    };

    $.quoteString=function(string)

    {
        if(string.match(_escapeable))

        {
            return'"'+string.replace(_escapeable,function(a)

            {
                    var c=_meta[a];
                    if(typeof c==='string')return c;
                    c=a.charCodeAt();
                    return'\\u00'+Math.floor(c/16).toString(16)+(c%16).toString(16);
                })+'"';
        }
        return'"'+string+'"';
    };

    var _escapeable=/["\\\x00-\x1f\x7f-\x9f]/g;
    var _meta={
        '\b':'\\b',
        '\t':'\\t',
        '\n':'\\n',
        '\f':'\\f',
        '\r':'\\r',
        '"':'\\"',
        '\\':'\\\\'
    };

})(jQuery);

/* ---------------------------------- */
/* ----- fonctions infodiv ---------- */
/* ---------------------------------- */

function display_current_category () {
    /* dispatch current category displayed */
    var current_view = tinaviz.getViewName();
    var current_cat = tinaviz.get("category/category");
    if (current_cat !== undefined)
        var opposite = this.categories[tinaviz.getOppositeCategory(current_cat)];
    //$("#title_acc_1").text("current selection of "+ this.categories[current_cat]);
    if (opposite !== undefined)
        if (current_view == "macro")
            $("#toggle-switch").button("option", "label", this.categories[current_cat]);
        else
            $("#toggle-switch").button("option", "label", this.categories[current_cat] + " neighbours");
    else
        $("#toggle-switch").button("option", "label", "switch category");
}

function display_current_view(){
    /*  dispatch current view displayed */
    var current_view = tinaviz.getViewName();
    if (current_view !== undefined) {
        var level = $("#level");
        level.button('option','label',current_view + " level");
        var title = $("#infodiv > h3:first");
        if (current_view == "meso") {
            level.addClass("ui-state-highlight");
            $("#level > span").attr("title","zoom out to switch to the macro view");
            title.addClass("ui-state-highlight");
        }
        else {
            level.removeClass("ui-state-highlight");
            $("#level > span").attr("title","zoom in or double click on a node to switch to is meso view");
            title.removeClass("ui-state-highlight");
        }
    }
}


function updateTagCloud(viewLevel){
    /* updates the tag cloud of the opposite nodes of a given selection */
    /* builds aggregated tag object */
    if (Object.size( this.selection ) == 0) return;
    var tempcloud = {};
    var toBe = new Array();
    for (var nodeid in this.selection) {
        // gets the full neighbourhood for the tag cloud
        var nb = tinaviz.getNeighbourhood(viewLevel,nodeid);
        //alert("over-writing tinaviz 2be selected");
        for (var nbid in nb) {
            //alert(nbid);
            if ( tempcloud[nbid] !== undefined )
                tempcloud[nbid]['degree']++;
            // pushes a node if belongs to the opposite category
            else if (this.selection[nodeid]['category'] != nb[nbid]['category']) {
                toBe.push(nbid);
                tempcloud[nbid] = {
                    'id': nbid,
                    'label' : decodeJSON(nb[nbid]['label']),
                    'degree' : 1,
                    'occurrences': parseInt(nb[nbid]['occurrences']),
                    'category': decodeJSON(nb[nbid]['category'])
                };
            }
        }

    }
    this.oppositeSelection = toBe;
    var sorted_tags = alphabeticListSort( Object.values( tempcloud ), 'label' );
    /* some display sizes const */

    /// Modif david
    this.cloudSearch.empty();
    var Googlerequests = "http://www.google.com/#q=";
    var PubMedrequests = "http://www.ncbi.nlm.nih.gov/pubmed?term=";
    var requests="";
    for (var i = 0; i < sorted_tags.length; i++) {
        var tag = sorted_tags[i];
        tagLabel=tag.label;
        tagLabel=jQuery.trim(tagLabel);
        requests = requests + "%22" + tagLabel.replace(" ","+") + "%22";
        if (i < sorted_tags.length - 1) requests = requests + "+AND+";
    }

    var current_cat = tinaviz.get("category/category");  /// category courante
    ///alert(current_cat)
    if (current_cat !== undefined){
        var oppositeRealName = this.categories[tinaviz.getOppositeCategory(current_cat)];
        if (oppositeRealName !== undefined){
            var tmp="";
            tmp = "Search on: <a href=\"";
            tmp += Googlerequests;
            tmp +=requests;
            tmp +='" alt="search on google" target="_BLANK"><img src="'
            tmp +=tinaviz.getPath()
            tmp +='css/branding/google.png" />Google</a> &nbsp;'
            tmp +=' <a href="'+PubMedrequests+requests
            tmp +='" alt="search on PubMed" target="_BLANK"><img src="'
            tmp +=tinaviz.getPath()
            tmp +='css/branding/pubmed.png" />Pubmed</a>' ;
            this.cloudSearch.append(tmp);
        }
    }
    var sizecoef = 15;
    var const_doc_tag = 12;
    var tooltip = "";
    /* displays tag cloud */
    var tagcloud = $("<p></p>");
    for (var i = 0; i < sorted_tags.length; i++) {
        var tag = sorted_tags[i];
        var tagid = tag['id'];
        var tagspan = $("<span id='"+tagid+"'></span>");
        tagspan.addClass('ui-widget-content');
        tagspan.addClass('viz_node');
        tagspan.html(tag['label']);
        (function() {
            var attached_id = tagid;
            var attached_cat =  tag['category'];
            tagspan.click( function() {
                //switch to meso view
                tinaviz.viewMeso(attached_id, attached_cat);
            });
        })();
        // sets the tag's text size
        if (sorted_tags.length == 1) {
            if ( tag['category'] == 'Document' )
                tagspan.css('font-size', const_doc_tag);
            else
                tagspan.css('font-size',
                    Math.floor( sizecoef*Math.log( 1.5 + tag['occurrences'] ) )
                    );
            tooltip = "click on a label to switch to its meso view - size is proportional to edge weight";
        }
        else {
            tagspan.css('font-size',
                Math.floor( sizecoef*Math.log( 1.5 + tag['degree'] ) )
                );
            tooltip = "click on a label to switch to its meso view - size is proportional to the degree";
        }
        // appends the final tag to the cloud paragraph
        tagcloud.append(tagspan);
        if (i != sorted_tags.length-1 && sorted_tags.length > 1)
            tagcloud.append(", &nbsp;");
    }
    // updates the main cloud  div
    this.cloud.empty();
    this.cloud.append( '<h3>selection related to '+ oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' );
    this.cloud.append( tagcloud );
    this.cloudSearchCopy.empty();
    this.cloudSearchCopy.append( '<h3>Global search on '+ oppositeRealName + ': <span class="ui-icon ui-icon-help icon-right" title="'+tooltip+'"></span></h3>' );
    this.cloudSearchCopy.append( tagcloud.clone());
}


function updateInfo(lastselection){
    /* updates the label and content DOM divs */
    var layout_name=tinaviz.get("layout/algorithm");

    var current_cat = tinaviz.get("category/category");
    var labelinnerdiv = $("<div></div>");
    var contentinnerdiv = $("<div></div>");
    for(var id in lastselection) {
        var node = lastselection[id];
        // ERROR : MISSING CATEGORY in the node list returned from Tinaviz !!!!
        if (node.category == current_cat)  {
            // prepares label and content to be displayed
            if ( current_cat == 'Document' ){
                var temp=decodeJSON(node.content);
                //alert(temp)
                var content=this.getContent(node);
                var label=this.getLabel(node);
            }
            else{
                var content = decHTMLifEnc(jQuery.trim(decodeJSON(node.content)));
            }

            //console.dir(content);
            //}
            // add node to selection cache
            this.selection[id] = lastselection[id];
            labelinnerdiv.append( $("<b></b>").html(label) );
            // displays contents only if it's a document

            // MODIF DAVID
            var current_cat = tinaviz.get("category/category");  /// category courante
            if (current_cat !== undefined) {
                //var contentinnerdivTitle=jQuery.trim(decHTMLifEnc( ));

                // jQuery.text automaticcally html encode characters
                contentinnerdiv.append( $("<b></b>").html( label ) );

                if ( node.content != null ) {
                    contentinnerdiv.append( $("<p></p>").html( content ) );
                }
                // TODO : move this code to a special "web request function"
                var SearchQuery=label.replace(" ","+");
                //var WikiQuery=label.replace("+","_");

                // TODO : use this.category var to identify categories from object configuration
                var CurrentCategRealName = this.categories[current_cat];   /// nom affiché

                if (CurrentCategRealName == "projects"){
                    // TODO : avoid injecting to much html : write constant in index.html,
                    //      manage hide/shows with this.update() and this.reset(),
                    //      then use $("#anchor_id").attr("href",SearchQuery)
                    contentinnerdiv.append(
                        $("<p></p>").html(
                            '<a href="'
                            + tinaviz.getPath()
                            +'http://www.google.com/#hl=en&source=hp&q=%20'
                            + SearchQuery.replace(",","OR")
                            + '%20" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/'
                            + SearchQuery
                            + '" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q='
                            + SearchQuery
                            + '" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/flickr.png" height=15 width=15> </a>'
                            )
                        );
                }else{
                    contentinnerdiv.append("<p></p>");
                }
                if ((CurrentCategRealName == "NGram")|(CurrentCategRealName == "keywords")|(CurrentCategRealName == "Keywords")|(CurrentCategRealName == "Terms")|(CurrentCategRealName == "Communities")) {
                    contentinnerdiv.append(
                        $("<p></p>").html(
                            '<a href="http://www.google.com/#hl=en&source=hp&q=%20'
                            + SearchQuery.replace(",","OR")
                            + '%20" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/google.png" height=15 width=15> </a><a href="http://en.wikipedia.org/wiki/'
                            + SearchQuery
                            + '" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/wikipedia.png" height=15 width=15> </a><a href="http://www.flickr.com/search/?w=all&q='
                            + SearchQuery
                            + '" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/flickr.png" height=15 width=15> </a>'
                            )
                        );
                }
                if ((CurrentCategRealName == "Scholars")|(CurrentCategRealName == "People")|(CurrentCategRealName == "scholars")){
                    contentinnerdiv.append(
                        $("<p></p>").html(
                            '<a href="http://www.google.com/#hl=en&source=hp&q=%20'
                            + SearchQuery
                            + '%20" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()+'css/branding/google.png" height=15 width=15> </a>'
                            +'<a href="http://scholar.google.com/scholar?q=%20'
                            + SearchQuery
                            + '%20" align=middle target=blank height=15 width=15> <img src="'
                            + tinaviz.getPath()
                            +'css/branding/googleScholars.png" height=15 width=15> </a>'
                            )
                        );
                }
            // FIN MODIF DAVID

            }
        }
        contentinnerdiv.append("<br/");
    }
    if (Object.size( this.selection ) != 0) {
        this.label.empty();
        this.unselect_button.show();
        this.contents.empty();
        this.label.append( alphabeticJquerySort( labelinnerdiv, "b", ", &nbsp;" ));
        this.contents.append( contentinnerdiv );
    }
    else {
        this.reset();
    }
    return;
}

function getContent(node){
    /* Methodes*/
    return decHTMLifEnc(jQuery.trim(decodeJSON(node.content)));
}

function getLabel(node){
    /* Methodes*/
    return jQuery.trim(decodeJSON(node.label));
}

function update(view, lastselection){
    /* Main method recceiving a new node selection  and dispatching infodiv updates
     */
    if ( Object.size ( lastselection ) == 0 ) {
        this.reset();
        return;
    }
    this.updateInfo(lastselection);
    this.updateTagCloud("macro");
    return;
}

function reset(){
    /* Resets the entire infodiv */
    this.unselect_button.hide();
    this.label.empty().append($("<h2></h2>").html("Empty selection"));
    this.contents.empty().append($("<h4></h4>").html("click on a node to begin exploration"));

    this.contents.empty().append($("<h4></h4>").html(
        "<h2>Navigation tips</h2>"+"<p align='left'>"
        +"<br/>"
        +"<i>Basic interactions</i><br/><br/>"
        +"Click on a node to select/unselect and get its information.  In case of multiple selection, the button <img src='"
        +tinaviz.getPath()
        +"css/branding/unselect.png' alt='unselect' align='top' height=20/>  clears all selections.<br/><br/>The switch button <img src='"
        +tinaviz.getPath()+"css/branding/switch.png' alt='switch' align='top' height=20 /> allows to change the view type."
        +"<br/><br/>"
        +"<i>Graph manipulation</i><br/><br/>"
        +"Link and node sizes indicate their strength.<br/><br/> To fold/unfold the graph (keep only strong links or weak links), use the 'edges filter' sliders.<br/><br/> To select a more of less specific area of the graph, use the 'nodes filter' slider.</b><br/><br/>"
        +"<i>Micro/Macro view</i><br/><br/>To explore the neighborhood of a selection, either double click on the selected nodes, either click on the macro/meso level button. Zoom out in meso view return to macro view.<br/><br/>  "+"Click on the 'all nodes' tab below to view the full clickable list of nodes.<br/><br/>Find additional tips with mouse over the question marks."
        +"</p>"
        )
    );

    this.cloudSearchCopy.empty();
    this.cloudSearch.empty();

    this.cloud.empty();
    this.selection = {};
    this.oppositeSelection = new Array(),
    this.neighbours = {};
    this.data = {};
    this.last_category = "";

    return;
}

function updateNodeList(node_list, category){
    /* Init the node list */
    if (category != this.last_category) {
        this.table.empty();
        this.last_category = category;
        for (var i = 0; i < node_list.length; i++ ) {
            (function () {
                var rowLabel = decodeJSON(node_list[i]['label']);
                var rowId = decodeJSON(node_list[i]['id']);
                var rowCat = category;
                // asynchronously displays the node list
                setTimeout("displayNodeRow(\""+rowLabel+"\",\""+rowId+"\",\""+rowCat+"\")", 0);
            })();
        }
    }
    return;
}

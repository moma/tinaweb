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
    var hashes = content.split('_'); // obsolet and new terms
    for(var i = 0; i < hashes.length; i++){            
        if (hashes[i]=='.') continue;
        htmlstring += titles[i];
        hash = hashes[i].split('-'); // list of terms
        for(var j = 0; j < hash.length; j++){
            var node=tinaviz.getNodeAttributes("macro",'N::'+hash[j]);
            htmlstring+= htmlDecode(node.label.replace(/\+/g," "))+", ";            
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

/* --------------------------------- */
/* Fonctions pour la div content */
/* --------------------------------- */


function urlList(label,CurrentCategRealName){
    var SearchQuery=label.replace(" ","+");
    //var WikiQuery=label.replace("+","_");
    if (CurrentCategRealName == "projects"){
        // TODO : avoid injecting to much html : write constant in index.html,
        //      manage hide/shows with this.update() and this.reset(),
        //      then use $("#anchor_id").attr("href",SearchQuery)
        return $("<p></p>").html(
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
            
    }else if ((CurrentCategRealName == "NGrams")|(CurrentCategRealName == "NGram")|(CurrentCategRealName == "keywords")|(CurrentCategRealName == "Keywords")|(CurrentCategRealName == "Terms")|(CurrentCategRealName == "Communities")) {
    return $("<p></p>").html(
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
    }
    else if ((CurrentCategRealName == "Scholars")|(CurrentCategRealName == "People")|(CurrentCategRealName == "scholars")){
        return $("<p></p>").html(
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
    }else {
        return $("<p></p>");
    }
}


/* --------------------------------- */
/* Fonctions tinaforce et phyloforce */
/* --------------------------------- */

function fillContent(node){
    // donne le contenu de la div content
    var layout_name=tinaviz.get("layout/algorithm");
    if (layout_name=="phyloforce"){
        //on récupère l'année
        var nodeId = jQuery.trim(decodeJSON(node.id));
        var hashes = nodeId.split('::'); // obsolet and new terms
        var hash = hashes[1].split('_');
        var year=hash[0];
        var content = content2html(decodeJSON(node.content));
    }else{
        var content = decHTMLifEnc(jQuery.trim(decodeJSON(node.content)));
    }
    return content;
}

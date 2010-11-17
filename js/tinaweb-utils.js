//      This program is free software; you can redistribute it and/or modify
//      it under the terms of the GNU General Public License as published by
//      the Free Software Foundation; either version 3 of the License, or
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

function decHTMLifEnc(str) {
    return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
}

/*
 * Tri alphabetique
 */
function  alphabeticListSort(listitems,textkey) {
    listitems.sort(function(a, b) {
        var compA = a[textkey].toUpperCase();
        var compB = b[textkey].toUpperCase();
        return (compA < compB) ? -1 : (compA >= compB) ? 1 : 0;
    })
    return listitems;

};
function  numericListSort(listitems,textkey) {
    listitems.sort(function(a, b) {
    var compA = parseFloat(a[textkey]);
    var compB = parseFloat(b[textkey]);
        return (compA > compB) ? -1 : (compA <= compB) ? 1 : 0;
    })
    return listitems;
};


function sortNumber(a,b) {
    return a - b;
}

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

function resize() {
    var infoDivWidth = 390;

    var size = {
        w: getScreenWidth() - infoDivWidth - 55,
        h: getScreenHeight() - $("#hd").height() - $("#ft").height() - 60
    };

    $("#appletdiv").css('width', size.w);
    $("#infodiv").css('width', infoDivWidth);
    $("#infodivparent").css('height', size.h);
    return size;
}

function find(element,array){
    // Find the position of element in the array list,n return
    var pos = null;
    for (var i = 0; i < array.length; i++) {
        if (array[i] == element) {
            if (pos != null){
                pos.push(i);
            }else{
                pos=new Array();
                pos.push(i);
            }

        }
    }
    return pos;
}

function getUrlVars() {
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

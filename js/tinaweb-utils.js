/*
    Copyright (C) 2009-2011 CREA Lab, CNRS/Ecole Polytechnique UMR 7656 (Fr)

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

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

/*
 * utility returning a list
 * from the values of a given object
 */
Object.keys = function(obj) {
    var keys = new Array();
    for (key in obj) {
        keys.push(key);
    }
    return keys;
};

/*
 * Sorts list of objects containing a text values, given a textkey
 */
function  alphabeticListSort(listitems, textkey) {
    listitems.sort(function(a, b) {
        var compA = a[textkey].toUpperCase();
        var compB = b[textkey].toUpperCase();
        return (compA < compB) ? -1 : (compA >= compB) ? 1 : 0;
    })
    return listitems;

};

/*
 * Sorts list of objects containing a numeric values, given a valuekey
 */
function  numericListSort(listitems, valuekey) {
    listitems.sort(function(a, b) {
        var compA = parseFloat(a[valuekey]);
        var compB = parseFloat(b[valuekey]);
        return (compA > compB) ? -1 : (compA <= compB) ? 1 : 0;
    })
    return listitems;
};

/*
 * Sorts list of objects on the length of list, given a valuekey
 */
function  numericLengthSort(listitems, valuekey) {
    listitems.sort(function(a, b) {
        var compA = a[valuekey].length;
        var compB = b[valuekey].length;
        return (compA > compB) ? -1 : (compA <= compB) ? 1 : 0;
    })
    return listitems;
};


function sortNumber(a,b) {
    return a - b;
}

/*
* Generic sorting Jquery object lists
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


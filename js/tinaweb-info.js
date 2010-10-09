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


/**
 * Generic GUI Components used by both TinaSoft Desktop and TinaWeb

 *
 */

/*
 * Asynchronously displays of node list
 */
function displayNodeRow(label, id, category) {
    $("#node_table > tbody").append(
        $("<tr></tr>").append(
            $("<td id='"+id+"'></td>").text(label).click( function(eventObject) {
                //switch to meso view
                tinaviz.viewMeso(id, category);
            })
            )
        );
}


/*
 * Infodiv object need viz object to retrieve data
 */
function InfoDiv(divid) {
    this.id= divid;
    this.selection = {};
    this.neighbours = {};
    this.oppositeSelection = new Array();
    this.label = $( "#node_label" );
    this.contents = $( "#node_contents" );
    this.cloud = $( "#node_neighbourhood" );
    /// Modif David
    this.cloudSearch= $("#node_neighbourhoodForSearch");
    this.cloudSearchCopy = $( "#node_neighbourhoodCopy" );
    this.unselect_button= $( "#toggle-unselect" );
    this.table= $("#node_table > tbody");
    this.data= {};
    this.categories= {
        'NGram' : 'NGrams',
        'Document' : 'Documents'
    };
    this.last_category= "";

}
InfoDiv.prototype.display_current_category = display_current_category();
InfoDiv.prototype.display_current_view=display_current_view();
InfoDiv.prototype.updateTagCloud=updateTagCloud();
InfoDiv.prototype.updateInfo=updateInfo();
InfoDiv.prototype.getContent=ContentgetContent();
InfoDiv.prototype.getLabel=getLabel();
InfoDiv.prototype.update=update();
InfoDiv.prototype.reset=reset();
InfoDiv.prototype.updateNodeList=updateNodeList();

function InfoDivPhyloweb(divid) {
    this.id=divid;
}
InfoDivPhyloweb.prototype = new InfoDiv;

// Tout le prototype fille est remplacé par celui de la mère
InfoDivPhyloweb.prototype.display_current_category=display_current_category();
InfoDivPhyloweb.prototype.display_current_view=display_current_view();
InfoDivPhyloweb.prototype.updateTagCloud=updateTagCloud();
InfoDivPhyloweb.prototype.updateInfo=updateInfo();
InfoDivPhyloweb.prototype.update=update();
InfoDivPhyloweb.prototype.reset=reset();
InfoDivPhyloweb.prototype.updateNodeList=updateNodeList();

InfoDivPhyloweb.prototype.getContent=function(node){
    return content2html(decodeJSON(node.content));
}

InfoDivPhyloweb.prototype.getLabel=function(node){
    //on récupère l'année'
    var nodeId = jQuery.trim(decodeJSON(node.id));
    var hashes = nodeId.split('::'); // obsolet and new terms
    var hash = hashes[1].split('_');
    var year=hash[0];
    var label=jQuery.trim(decodeJSON(node.label));
    label=label + " - " + year;
    return label;
}
/*
 * WHAT IS IT ?????
 * DOCUMENTATION REQUIRED
 */
function stp(fld) {
    var res = "";
    var c = 0;
    for (i=0; i<fld.length; i++) {
        if (fld.charAt(i) != " " || c > 0) {
            res += fld.charAt(i);
            if (fld.charAt(i) != " ") {
                c = res.length;
            }
        }
    }
    return res.substr(0,c);
} 
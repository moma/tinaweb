/*
* Common console object
*/

var _console = Components.classes[ "@mozilla.org/consoleservice;1" ]
    .getService( Components.interfaces.nsIConsoleService );

var _prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
    .getService(Components.interfaces.nsIPromptService);

function TinasoftConsole( ns ) {
  var namespace = ns;
  this.prefix = [namespace, " : "].join("");
}

TinasoftConsole.prototype = {

    log: function( msg ) {
        _console.logStringMessage( this.prefix + msg );
    },
    error: function( msg ) {
        _prompt.alert( null, "Error!", "Error: " + msg );
    }
}
var console = new TinasoftConsole( "tinasoft.desktop" );



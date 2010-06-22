#**TinaWeb** - *Bi-Partite Visualization Applet*

- **authors**: 
 - [Julian Bilcke](http://github.com/jbilcke) (Java,JS) 
 - [David Chavalarias](http://github.com/davidchavalarias) (Algorithms)
 - [Elias Showk](hhttp://github.com/elishowk) (JS, Python)

##I. What is it?

This open source application is developped as part of the **TINA Project**. 
Tinaweb comprise an HTML/CSS/JavaScript component, and a pre-compiled Java Applet. You can download sourcecode for this applet in another project (I know, for the moment, it's not a very intuitive architecture, this will be refactored, repositories renamed, or whatever, once I will have more time)


##II. usage (TODO: put HTTP header dependencies here)

$(document).ready(function(){

    tinaviz = new Tinaviz({
        tag: $("#vizdiv"),
        path: "js/tinaviz/",
        context: "",
        engine: "software",
        width: 0,
        height: 0
    });

    tinaviz.ready(function(){
    
        var infodiv =  InfoDiv('infodiv');
        tinaviz.infodiv = infodiv;
        
        
        // auto-adjusting infodiv height
        $(infodiv.id).css('height', tinaviz.height - 40);

        $(infodiv.id).accordion({
            fillSpace: true,
        });

        infodiv.reset();

        var w = getScreenWidth() - 390;
        var h = getScreenHeight() - $("#hd").height() - $("#ft").height() - 60;
        tinaviz.size(w, h);

});


###1. Featured in:

- [FET Open Explorer](http://tina.iscpif.fr/htdocs/fet60)
- [Who's Who](http://tina.iscpif.fr/htdocs/whoswho)

###2. Better tools to do the job (tm):

If you prefer a Flash-based and production-ready GEXF visualization widget to embed in your web page, you should probably try:
- [GexfExplorer](http://github.com/jacomyal/GexfExplorer) 
- [GexfWalker](http://github.com/jacomyal/GexfWalker)

If you want to edit, arrange, produce printable maps:
- [Gephi](http://gephi.org)

for more information on the GEXF file format:
- [GEXF Format](http://gexf.net/format/)
- [Gephi](http://www.gephi.org/)




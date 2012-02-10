<?php
include ("parametres.php");

echo '<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Complex Systems Scholars</title>
        <meta name="description" content="">
        <meta name="author" content="">
        <!-- Le HTML5 shim, for IE6-8 support of HTML elements -->
        <!--[if lt IE 9]>
		<script src="http://html5shim.googlecode.com/svn/trunk/html5.js"></script>
		<![endif]-->
        <!-- Le styles -->
        <link href="css/bootstrap.css" rel="stylesheet">
        <link type="text/css" href="css/brownian-motion/jquery-ui-1.8.16.custom.css">
        <link href="http://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet" type="text/css">
        <script type="text/javascript" src="js/jquery/jquery-1.7.min.js"></script>
        <script type="text/javascript" src="js/jquery-ui/jquery-ui-1.8.16.custom.min.js"></script>
        <script type="text/javascript" src="js/bootstrap/bootstrap-dropdown-fade.js"></script>
        <script type="text/javascript" src="js/misc/underscore.min.js"></script>
        <script type="text/javascript" src="js/jquery/jquery.highlight-3.js"></script>
        <script type="text/javascript" src="js/misc/json2.js"></script>
        <script type="text/javascript" src="js/utils.js"></script>
        <link href="css/whoswho.css" rel="stylesheet" type="text/css">
        <link rel="shortcut icon" href="images/favicon.ico">
        <link rel="apple-touch-icon" href="images/apple-touch-icon.png">
        <link rel="apple-touch-icon" sizes="72x72" href="images/apple-touch-icon-72x72.png">
        <link rel="apple-touch-icon" sizes="114x114" href="images/apple-touch-icon-114x114.png">
    </head>
    <body>
        <script type="text/javascript" src="js/whoswho.js"/></script>
    <div class="container-fluid">
        <div id="visualization"></div>
        <!-- Main hero unit for a primary marketing message or call to action -->
        <div class="hero-unit">
            <div id="loading" style="padding-left:-175px; margin-left: 27%;">
                <img src="css/loading.gif" style="border: 0px; opacity: 0.05; " />
            </div>';


$base = new PDO("sqlite:" . $dbname);
$termsMatrix = array(); // liste des termes présents chez les scholars avec leurs cooc avec les autres termes
$scholarsMatrix = array(); // liste des scholars avec leurs cooc avec les autres termes
$scholarsIncluded=0;




// liste des chercheurs
$sql = "SELECT * FROM scholars ";

$scholars = array();
//$query = "SELECT * FROM scholars";
foreach ($base->query($sql) as $row) {
$info = array();
$info['unique_id'] = $row['unique_id'];
$info['first_name'] = $row['first_name'];
$info['initials'] = $row['initials'];
$info['last_name'] = $row['last_name'];
$info['nb_keywords'] = $row['nb_keywords'];
$info['css_voter'] = $row['css_voter'];
$info['css_member'] = $row['css_member'];
$info['keywords_ids'] = explode(',', $row['keywords_ids']);
$info['keywords'] = $row['keywords'];
$info['status'] = $row['status'];
$info['country'] = $row['country'];
$info['homepage'] = $row['homepage'];
$info['lab'] = $row['lab'];
$info['affiliation'] = $row['affiliation'];
$info['lab2'] = $row['lab2'];
$info['affiliation2'] = $row['affiliation2'];
$info['homepage'] = $row['homepage'];
$info['title'] = $row['title'];
$info['position'] = $row['position'];
$info['photo_url']=$row['Photo'];
$info['interests']=$row['interests'];
$info['address']=$row['address'];
$info['city']=$row['city'];
$info['postal_code']=$row['postal_code'];
$info['phone']=$row['phone'];
$info['mobile']=$row['mobile'];
$info['fax']=$row['fax'];
$info['affiliation_acronym']=$row['affiliation_acronym'];
$scholars[$row['unique_id']] = $info;
}

$imsize=150;

// ajout des scholars
foreach ($scholars as $scholar) {
echo '<div class="row">
                <div class="span12">                    
                    <div class="row">           
                        <div class="span9" align="justify">';

if ($scholar['photo_url']!=null){
echo '<img style="margin: 7px 10px 10px 0px" src="http://main.csregistry.org/'.$scholar['photo_url'].'" width="'.$imsize.'px" align="left">';
}

echo '<h2 >'.$scholar['title']. ' ' . $scholar['first_name'] . ' ' . $scholar['initials'] . ' ' . $scholar['last_name'].
' <small> - '.$scholar['country'].'</small></h2>';


if ($scholar['position']!=null){
echo '<dl>
<dt>'.$scholar['position'].'</dt>';
}
$affiliation='';
if ($scholar['lab']!=null){
$affiliation.=$scholar['lab'].',';
}
if ($scholar['affiliation']!=null){
$affiliation.=$scholar['affiliation'];
}
if(($scholar['affiliation']!=null)|($scholar['lab']!=null)){
echo '<dd>'.$affiliation.'</dd> ';
}


$affiliation2='';
if ($scholar['lab2']!=null){
$affiliation2.=$scholar['lab2'].',';
}
if ($scholar['affiliation2']!=null){
$affiliation2.=$scholar['affiliation2'];
}
if(($scholar['affiliation2']!=null)|($scholar['lab2']!=null)){
echo '<dd><i>Second affiliation :</i>'.$affiliation2.'</dd>';
}

if ((strcmp($affiliation2, '')!=0)|(strcmp($affiliation, '')!=0)){
echo '<br/>';
}

$www='';
if (substr($scholar['homepage'], 0, 3)==='www'){
$www.='[ <a href='.str_replace('&', ' and ', 'http://'.$scholar['homepage']).' target=blank > '.str_replace('&', ' and ', 'http://'.$scholar['homepage']).'  </a ><br/>]';
}elseif(substr($scholar['homepage'], 0, 4)==='http'){
$www.='[ <a href='.str_replace('&', ' and ', $scholar['homepage']).' target=blank > '.str_replace('&', ' and ', $scholar['homepage']).' </a >]<br/>';
}

if (strcmp($www, '')!=0){
echo '<dd><i class="icon-home"></i>'.$www.'</dd> ';
}

if ($scholar['css_member']==='Yes'){
if ($scholar['css_voter']==='Yes'){
echo '<dd><i class="icon-user"></i> CSS Member premium</dd> ';
}else{
echo '<dd><i class="icon-user"></i> CSS Member</dd> ';
}
$scholar_desc.='<b>CSS Member </b>';
}

if ($scholar['position']!=null){
    echo '</dl>';
}

echo '</div>';

if ($scholar['keywords']!=null){
echo '<div class="span3" align="justify">
                 <i class="icon-tags"></i>'.$scholar['keywords'];
echo '</div>';
}

echo '</div>';  

echo '<div class="row">';           
if ($scholar['interests']!=null){
    echo '<h4 class="span9" align="justify">Research</h4>';
    echo '<p class="span9" align="justify">'.$scholar['interests'].'</p>';
}         

if (($scholar['address']!=null)||($info['phone'])){
    echo '<div class="span3" align="justify">';
}
if ($scholar['address']!=null){
    echo '<address><i class="icon-envelope"></i>'.$scholar['address'].'<br/>'.
          $scholar['city'].'<br/>'.$scholar['postal_code'].'<br/></address>';
}

if ($scholar['phone']!=null){
    echo '<address><strong>Phone</strong><br/>'.
          $scholar['phone'].'<br/>'.$scholar['mobile'].'<br/>'.$scholar['fax'].'<br/></address>';
}

            

echo '</div>';
echo '</div>';
echo '</div>';
echo '</div>';
echo '<br/>';  
    // fin du profil

}

echo '</div>
            <footer>
                <a href="http://iscpif.fr"><img src="css/branding/logo-iscpif_medium.png" alt="iscpif.fr" style="border: none; margin-bottom : -6px;" title="isc-pif" /></a>- &copy; <a href="http://moma.csregistry.org" target="_BLANK">MOMA</a> - <a href="http://www.crea.polytechnique.fr/LeCREA/" target="_BLANK">CREA</a> - <a href="http://www.cnrs.fr/fr/recherche/index.htm" target="_BLANK">CNRS</a> - 2009-2012
            </footer>
        </div>
</body>
</html>'

?>
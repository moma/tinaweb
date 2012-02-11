<?php

include ("parametres.php");
include ("normalize.php");
//include("../common/library/fonctions_php.php");


define('_is_utf8_split', 5000);

function is_utf8($string) {
   
    // From http://w3.org/International/questions/qa-forms-utf-8.html
    return preg_match('%^(?:
          [\x09\x0A\x0D\x20-\x7E]            # ASCII
        | [\xC2-\xDF][\x80-\xBF]             # non-overlong 2-byte
        |  \xE0[\xA0-\xBF][\x80-\xBF]        # excluding overlongs
        | [\xE1-\xEC\xEE\xEF][\x80-\xBF]{2}  # straight 3-byte
        |  \xED[\x80-\x9F][\x80-\xBF]        # excluding surrogates
        |  \xF0[\x90-\xBF][\x80-\xBF]{2}     # planes 1-3
        | [\xF1-\xF3][\x80-\xBF]{3}          # planes 4-15
        |  \xF4[\x80-\x8F][\x80-\xBF]{2}     # plane 16
    )*$%xs', $string);
   
}

$data = json_decode($_GET['query']);

function objectToArray($d) {
		if (is_object($d)) {
			// Gets the properties of the given object
			// with get_object_vars function
			$d = get_object_vars($d);
		}
 
		if (is_array($d)) {
			/*
			* Return array converted to object
			* Using __FUNCTION__ (Magic constant)
			* for recursive call
			*/
			return array_map(__FUNCTION__, $d);
		}
		else {
			// Return array
			return $d;
		}
	}

$data = objectToArray($data);

$categorya = $data["categorya"];
$categoryb = $data["categoryb"];
$countries = $data["countries"];
$keywords = $data["keywords"];
$laboratories = $data["laboratories"];
$organizations = $data["organizations"];

$f = "";// requête
if ($keywords) {
	if (sizeof($keywords) > 0) {
		$f .= 'AND ';
	}

	foreach ($keywords as $kw) {
		$words = explode(',', $kw);
		$i = 0;
		foreach ($words as $word) {
			$word = sanitize_input(trim(strtolower($word)));
			if ($word == "") continue;
			if ($i > 0)
				$f .= " OR ";
			$f .= 'keywords LIKE "%' . $word . '%" ';
			$i++;
		}
	}
	$f .= "  ";
}
if ($countries) {

	if (sizeof($countries) > 0) {
		$f .= 'AND ';
	}

	$i = 0;
	foreach ($countries as $country) {
		//$country = sanitize_input(trim(strtolower($country)));
                $country = sanitize_input(trim($country ));
		if ($country == "") continue;
		if ($i > 0)
			$f .= " OR ";
		$f .= 'country = "' . $country . '" ';
		$i++;
	}
	$f .= "  ";
}
if ($laboratories) {

	if (sizeof($laboratories) > 0) {
		$f .= 'AND ';
	}

	$i = 0;
	foreach ($laboratories as $lab) {
		$lab = sanitize_input(trim(strtolower($lab)));
		if ($lab == "") continue;
		if ($i > 0)
			$f .= " OR ";
		$f .= 'lab LIKE "%' . $lab . '%" ';
		$i++;
	}
	$f .= "  ";
}

if ($organizations) {

	if (sizeof($organizations) > 0) {
		$f .= 'AND ';
	}

	$i = 0;
	foreach ($organizations as $org) {
		$org = sanitize_input(trim(strtolower($org)));
		
		if ($org == "") continue;

		$f .= 'affiliation LIKE "%' . $org . '%" OR affiliation2 LIKE "%' . $org . '%" ';
                //'affiliation LIKE "%' . $org . '% OR affiliation2 LIKE "%' . $org . '%"';
		$i++;
	}
	$f .= "  ";
}



$content = '<!DOCTYPE html>
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
        <link href="css/bootstrap_directory.css" rel="stylesheet">
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
        <script type="text/javascript" src="js/whoswho.js"></script>
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
$scholarsIncluded = 0;


$content .= '<div id="welcome">
<img src="img/RegistryBanner.png" align="center">						
<h2>Complex Systems Directory</h2>.
						<p>
                                                This is the list of scholars
						</p>
						
						
            </div>';

// liste des chercheurs
// liste des chercheurs
if (substr($f, 0,3)=='AND'){
    $f=substr($f,3,-1);
}
        
if (strlen($f)>0){
$sql = "SELECT * FROM scholars where " . " " . $f;
}else{
    $sql = "SELECT * FROM scholars";
}

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
    $info['photo_url'] = $row['photo_url'];
    $info['interests'] = $row['interests'];
    $info['address'] = $row['address'];
    $info['city'] = $row['city'];
    $info['postal_code'] = $row['postal_code'];
    $info['phone'] = $row['phone'];
    $info['mobile'] = $row['mobile'];
    $info['fax'] = $row['fax'];
    $info['affiliation_acronym'] = $row['affiliation_acronym'];
    $scholars[$row['unique_id']] = $info;
}
$imsize = 150;


// ajout des scholars
foreach ($scholars as $scholar) {

    $content .= '<div class="row">
                <div class="span12">                    
                    <div class="row">           
                        <div class="span9" align="justify">';
    $content .= '<div>';
    if ($scholar['photo_url'] != null) {
        $content .= '<img style="margin: 7px 10px 10px 0px" src="http://main.csregistry.org/' . $scholar['photo_url'] . '" width="' . $imsize . 'px" align="left">';
    }

    $content .= '<h2 >' . $scholar['title'] . ' ' . $scholar['first_name'] . ' ' . $scholar['initials'] . ' ' . $scholar['last_name'] .
            ' <small> - ' . $scholar['country'] . '</small></h2>';


    if ($scholar['position'] != null) {
        $content .= '<dl>
<dt>' . $scholar['position'] . '</dt>';
    }
    $affiliation = '';
    if ($scholar['lab'] != null) {
        $affiliation.=$scholar['lab'] . ',';
    }
    if ($scholar['affiliation'] != null) {
        $affiliation.=$scholar['affiliation'];
    }
    if (($scholar['affiliation'] != null) | ($scholar['lab'] != null)) {
        $content .= '<dd>' . $affiliation . '</dd> ';
    }


    $affiliation2 = '';
    if ($scholar['lab2'] != null) {
        $affiliation2.=$scholar['lab2'] . ',';
    }
    if ($scholar['affiliation2'] != null) {
        $affiliation2.=$scholar['affiliation2'];
    }
    if (($scholar['affiliation2'] != null) | ($scholar['lab2'] != null)) {
        $content .= '<dd><i>Second affiliation :</i>' . $affiliation2 . '</dd>';
    }

    if ((strcmp($affiliation2, '') != 0) | (strcmp($affiliation, '') != 0)) {
        $content .= '<br/>';
    }

    $www = '';
    if (substr($scholar['homepage'], 0, 3) === 'www') {
        $www.=' <a href=' . trim(str_replace('&', ' and ', 'http://' . $scholar['homepage'])) . ' target=blank > ' . trim(str_replace('&', ' and ', 'http://' . $scholar['homepage'])) . '  </a ><br/>';
    } elseif (substr($scholar['homepage'], 0, 4) === 'http') {
        $www.=' <a href=' . trim(str_replace('&', ' and ', $scholar['homepage'])) . ' target=blank > ' . trim(str_replace('&', ' and ', $scholar['homepage'])) . ' </a ><br/>';
    }

    if (strcmp($www, '') != 0) {
        $content .= '<dd><i class="icon-home"></i>' . $www . '</dd> ';
    }

    if ($scholar['css_member'] === 'Yes') {
        if ($scholar['css_voter'] === 'Yes') {
            $content .= '<dd><i class="icon-user"></i> CSS Member premium</dd> ';
        } else {
            $content .= '<dd><i class="icon-user"></i> CSS Member</dd> ';
        }
        $scholar_desc.='<b>CSS Member </b>';
    }

    if ($scholar['position'] != null) {
        $content .= '</dl>';
    }

    $content .= '</div>';


    if ($scholar['interests'] != null) {
        $content .= '<div>';
        $content .= '<h4>Research</h4>';
        $content .= '<p>' . $scholar['interests'] . '</p>';
        $content .= '</div>';
    }

    $content .= '</div>';

    if (($scholar['keywords'] != null) || ($scholar['address'] != null) || ($scholar['phone'] != null)) {
        $content .= '<div class="span3" align="justify">';
        
        if ($scholar['keywords'] != null){
                 $content .= '<i class="icon-tags"></i> ' . $scholar['keywords']. '<br/><br/>';
        }
            
        if ($scholar['address'] != null) {
            $content .= '<address><i class="icon-envelope"></i> ' . $scholar['address'] . '<br/>' . $scholar['city'] . '<br/>' . $scholar['postal_code'] . '<br/></address>';
        }


        if ($scholar['phone'] != null) {
            $content .= '<address><strong>Phone</strong>: '.$scholar['phone'] . '<br/>';
            if ($scholar['mobile'] != null) {
                $content .='<strong>Mobile</strong>: '.$scholar['mobile']. '<br/>';
            }
            if ($scholar['fax'] != null) {
                $content .='<strong>Fax</strong>: '.$scholar['fax'] . '<br/>';
            }            
        }

        $content .= '</div>';
    }

$content .= '</div>';

    $content .= '</div>';
    $content .= '</div>';
    $content .= '<br/>';
    $content .= '<br/>';
    $content .= '<br/>';
    // fin du profil
}
$content .= '</div>';
$content .= '</div>
            <footer>
                GENERATED BY <a href="http://iscpif.fr"><img src="css/branding/logo-iscpif_medium.png" alt="iscpif.fr" style="border: none; margin-bottom : -6px;" title="isc-pif" /></a>-  <a href="http://sciencemapping.com" target="_BLANK">MOMA</a> - <a href="http://www.crea.polytechnique.fr/LeCREA/" target="_BLANK">CREA</a> - <a href="http://www.cnrs.fr/fr/recherche/index.htm" target="_BLANK">CNRS</a> 
            </footer>
        </div>
</body>
</html>';

echo $content;
?>
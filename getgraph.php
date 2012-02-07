<?php
//header ("Content-Type:text/xml");  

/*
 * Génère le gexf des scholars à partir de la base sqlite
 */
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

//phpinfo();
$gexf = '<?xml version="1.0" encoding="UTF-8"?>';
//echo $_GET['query']."<br/>";
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

//echo 'data '.$data;

//echo json_decode('{ countries: [ "France" ]}');

//$json = '{"a":1,"b":2,"c":3,"d":4,"e":5}';
//pt($json);
//pt(json_decode($json));
//exit();
//$data = json_decode('', true);
//print_r($data);
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


$base = new PDO("sqlite:" . $dbname);

$termsMatrix = array();
// liste des termes présents chez les scholars avec leurs cooc avec les autres termes
$scholarsMatrix = array();
// liste des scholars avec leurs cooc avec les autres termes
$scholarsIncluded = 0;
// Ecriture de l'entête du gexf

$gexf .= '<gexf xmlns="http://www.gexf.net/1.1draft" xmlns:viz="http://www.gephi.org/gexf/viz" version="1.1"> ';
$gexf .= '<meta lastmodifieddate="20011-11-11">'."\n";
$gexf .= ' </meta>'."\n";
$gexf .= '<graph type="static">' . "\n";
$gexf .= '<attributes class="node" type="static">' . "\n";
$gexf .= ' <attribute id="0" title="category" type="string">  </attribute>' . "\n";
$gexf .= ' <attribute id="1" title="occurrences" type="float">    </attribute>' . "\n";
$gexf .= ' <attribute id="2" title="content" type="string">    </attribute>' . "\n";
$gexf .= ' <attribute id="3" title="keywords" type="string">   </attribute>' . "\n";
$gexf .= ' <attribute id="4" title="weight" type="float">   </attribute>' . "\n";
$gexf .= '</attributes>' . "\n";
$gexf .= '<attributes class="edge" type="float">' . "\n";
$gexf .= ' <attribute id="5" title="cooc" type="float"> </attribute>' . "\n";
$gexf .= ' <attribute id="6" title="type" type="string"> </attribute>' . "\n";
$gexf .= "</attributes>" . "\n";
$gexf .= "<nodes>" . "\n";


//echo(substr($f, 0,3));
// liste des chercheurs
if (substr($f, 0,3)=='AND'){
    $f=substr($f,3,-1);
}
        
if (strlen($f)>0){
$sql = "SELECT * FROM scholars where " . " " . $f;
}else{
    $sql = "SELECT * FROM scholars";
}
//pt('f:'.$f);
//pt($sql);
//exit();
$scholars = array();
//echo $sql . " <br/>";
//print_r($data);
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
	//$info['status'] =  $row['status'];
	$info['country'] = $row['country'];
	$info['homepage'] = $row['homepage'];
	$info['lab'] = $row['lab'];
	$info['affiliation'] = $row['affiliation'];
	$info['lab2'] = $row['lab2'];
	$info['affiliation2'] = $row['affiliation2'];
	$info['homepage'] = $row['homepage'];
	$info['title'] = $row['title'];
	$info['position'] = $row['position'];
	//print_r($row);
	$scholars[$row['unique_id']] = $info;
}

foreach ($scholars as $scholar) {
	// on en profite pour charger le profil sémantique du gars
	$scholar_keywords = $scholar['keywords_ids'];
	// on en profite pour construire le réseau des termes par cooccurrence chez les scholars
	for ($k = 0; $k < count($scholar_keywords); $k++) {
		if ($scholar_keywords[$k] != null) {
			if ($termsMatrix[$scholar_keywords[$k]] != null) {
				$termsMatrix[$scholar_keywords[$k]]['occ'] = $termsMatrix[$scholar_keywords[$k]][occ] + 1;
				for ($l = 0; $l < count($scholar_keywords); $l++) {
					if ($termsMatrix[$scholar_keywords[$k]]['cooc'][$scholar_keywords[$l]] != null) {
						$termsMatrix[$scholar_keywords[$k]]['cooc'][$scholar_keywords[$l]] += 1;
					} else {
						$termsMatrix[$scholar_keywords[$k]]['cooc'][$scholar_keywords[$l]] = 1;
					}
				}
			} else {
				$termsMatrix[$scholar_keywords[$k]]['occ'] = 1;
				for ($l = 0; $l < count($scholar_keywords); $l++) {
					if ($termsMatrix[$scholar_keywords[$k]]['cooc'][$scholar_keywords[$l]] != null) {
						$termsMatrix[$scholar_keywords[$k]]['cooc'][$scholar_keywords[$l]] += 1;
					} else {
						$termsMatrix[$scholar_keywords[$k]]['cooc'][$scholar_keywords[$l]] = 1;
					}
				}
			}
		}
	}

}

// liste des termes
$sql = "SELECT term,id,occurrences FROM terms";
//pt($query);
$terms_array = array();
//$query = "SELECT * FROM scholars";
foreach ($base->query($sql) as $row) {
	$id = $row['id'];
	if (!array_key_exists($id, $termsMatrix)) {
		continue;
	}
	if ($termsMatrix[$id] != null) {// on prend que les termes sont mentionnés par les chercheurs filtrés
		//echo "OK";
		$info = array();
		$info['id'] = $id;
		$info['occurrences'] = $row['occurrences'];
		$info['term'] = $row['term'];
		$terms_array[$id] = $info;
	}
}

$count = 1;

foreach ($terms_array as $term) {
	//echo "TERM";
	$count += 1;
	// on en profite pour charger le profil scholar du term
	$query = "SELECT scholar FROM scholars2terms where term_id='" . $term['id'] . "'";

	$term_scholars = array();
	foreach ($base->query($query) as $row) {
		$term_scholars[] = $row['scholar'];
		// ensemble des scholars partageant ce term
    }
    // on en profite pour construire le réseau des scholars partageant les mêmes termes
    for ($k = 0; $k < count($term_scholars); $k++) {
        if ($scholarsMatrix[$term_scholars[$k]] != null) {
            $scholarsMatrix[$term_scholars[$k]]['occ'] = $scholarsMatrix[$term_scholars[$k]]['occ'] + 1;
            for ($l = 0; $l < count($term_scholars); $l++) {
                if (array_key_exists($term_scholars[$l], $scholars)) {
                    if ($scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] != null) {
                        $scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] += scholarlink($term['occurrences'], $scholars[$term_scholars[$k]]['nb_keywords'], $scholars[$term_scholars[$l]]['nb_keywords']);
                    } else {
                        $scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] = scholarlink($term['occurrences'], $scholars[$term_scholars[$k]]['nb_keywords'], $scholars[$term_scholars[$l]]['nb_keywords']);
                    }
                }
            }
        } else {
            $scholarsMatrix[$term_scholars[$k]]['occ'] = 1;
            for ($l = 0; $l < count($term_scholars); $l++) {
                if (array_key_exists($term_scholars[$l], $scholars)) {
                    if ($scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] != null) {
						$scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] += scholarlink($term['occurrences'], $scholars[$term_scholars[$k]]['nb_keywords'], $scholars[$term_scholars[$l]]['nb_keywords']);
					} else {
						$scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] = scholarlink($term['occurrences'], $scholars[$term_scholars[$k]]['nb_keywords'], $scholars[$term_scholars[$l]]['nb_keywords']);
					}
				}
			}
		}
	}
	$nodeId = 'N::' . $term['id'];
	$nodeLabel = str_replace('&', ' and ', $terms_array[$term['id']]['term']);
	$nodePositionY = rand(0, 100) / 100;
	$gexf .= '<node id="' . $nodeId . '" label="' . $nodeLabel . '">' . "\n";
	$gexf .= '<viz:color b="0" g="0"  r="200"/>' . "\n";
	$gexf .= '<viz:position x="' . (rand(0, 100) / 100) . '"    y="' . $nodePositionY . '"  z="0" />' . "\n";
	$gexf .= '<attvalues> <attvalue for="0" value="NGram"/>' . "\n";
	$gexf .= '<attvalue for="1" value="' . $terms_array[$term['id']]['occurrences'] . '"/>' . "\n";
	$gexf .= '<attvalue for="4" value="' . $terms_array[$term['id']]['occurrences'] . '"/>' . "\n";
	$gexf .= '</attvalues></node>' . "\n";

}

foreach ($scholars as $scholar) {
	//pt($scholar['unique_id']. '-'.count($scholarsMatrix[$scholar['unique_id']]['cooc']));
	$uniqueId = $scholar['unique_id'];
        if (!array_key_exists($uniqueId, $scholarsMatrix)) {
		continue;
	}
	if (count($scholarsMatrix[$uniqueId]['cooc']) >= $min_num_friends) {
		$scholarsIncluded += 1;
		$nodeId = 'D::' . $uniqueId;
		$nodeLabel = $scholar['title'] . ' ' . $scholar['first_name'] . ' ' . $scholar['initials'] . ' ' . $scholar['last_name'];
		$nodePositionY = rand(0, 100) / 100;
		$content = '';

		$content .= '<b>Country: </b>' . $scholar['country'] . '</br>';

		if ($scholar['position'] != null) {
			$content .= '<b>Position: </b>' . str_replace('&', ' and ', $scholar['position']) . '</br>';
		}
		$affiliation = '';
		if ($scholar['lab'] != null) {
			$affiliation .= $scholar['lab'] . ',';
		}
		if ($scholar['affiliation'] != null) {
			$affiliation .= $scholar['affiliation'];
		}
		if (($scholar['affiliation'] != null) | ($scholar['lab'] != null)) {
			$content .= '<b>Affiliation: </b>' . str_replace('&', ' and ', $affiliation) . '</br>';
		}

		if (strlen($scholar['keywords']) > 3) {
			$content .= '<b>Keywords: </b>' . str_replace(',', ', ', substr($scholar['keywords'], 0, -1)) . '.</br>';
		}

		if (substr($scholar['homepage'], 0, 3) === 'www') {
			$content .= '[ <a href=' . str_replace('&', ' and ', 'http://' . $scholar['homepage']) . ' target=blank > View homepage </a ><br/>]';
		} elseif (substr($scholar['homepage'], 0, 4) === 'http') {
			$content .= '[ <a href=' . str_replace('&', ' and ', $scholar['homepage']) . ' target=blank > View homepage </a >]<br/>';
		}

		if ($scholar['css_voter'] === 'Yes') {
			$color = 'b="19" g="204"  r="244"';
		} elseif ($scholar['css_member'] === 'Yes') {
			$color = 'b="243" g="183"  r="19"';
		} else {
			$color = 'b="255" g="0"  r="0"';
		}
		//pt($scholar['last_name'].','.$scholar['css_voter'].','.$scholar['css_member']);
		//pt($color);
		//pt($content);
                if (is_utf8($nodeLabel)) {
			$gexf .= '<node id="' . $nodeId . '" label="' . $nodeLabel . '">' . "\n";
			$gexf .= '<viz:color ' . $color . '/>' . "\n";
			$gexf .= '<viz:position x="' . (rand(0, 100) / 100) . '"    y="' . $nodePositionY . '"  z="0" />' . "\n";
			$gexf .= '<attvalues> <attvalue for="0" value="Document"/>' . "\n";
			if (true) {
				$gexf .= '<attvalue for="1" value="12"/>' . "\n";
				$gexf .= '<attvalue for="4" value="12"/>' . "\n";

			} else {
				$gexf .= '<attvalue for="1" value="10"/>' . "\n";
				$gexf .= '<attvalue for="4" value="10"/>' . "\n";

			}
			if (is_utf8($content)) {
				$gexf .= '<attvalue for="2" value="' . htmlspecialchars($content) . '"/>' . "\n";
			}
			$gexf .= '</attvalues></node>' . "\n";
		}
	}

}

$gexf .= '</nodes><edges>' . "\n";
// écritude des liens
$edgeid = 0;

// ecriture des liens bipartite
foreach ($scholars as $scholar) {
	$scholarId = $scholar['unique_id'];

	if (!array_key_exists($scholarId, $scholarsMatrix)) {
		continue;
	}

	$res = $scholarsMatrix[$scholarId]['cooc'];
	if (count($res) > 1) {
		foreach ($scholar['keywords_ids'] as $keywords)
			if ($keywords != null) {
				$edgeid += 1;
				$gexf .= '<edge id="' . $edgeid . '"' . ' source="D::' . $scholar['unique_id'] . '" ' . ' target="N::' . $keywords . '" weight="1">' . "\n";
				$gexf .= '<attvalues> <attvalue for="5" value="1"' . '/><attvalue for="6" value="bipartite"/></attvalues>' . "\n" . '</edge>' . "\n";
			}
	}
}

// ecriture des liens semantiques
//print_r($terms);
foreach ($terms_array as $term) {
	$nodeId1 = $term['id'];
	if (!array_key_exists($nodeId1, $termsMatrix)) {
		continue;
	}
	$neighbors = $termsMatrix[$nodeId1]['cooc'];
	if (!$neighbors) {
		continue;
	}
	foreach ($neighbors as $neigh_id => $occ) {
		if ($neigh_id != $nodeId1) {
			$edgeid += 1;
			$gexf .= '<edge id="' . $edgeid . '"' . ' source="N::' . $nodeId1 . '" ' . ' target="N::' . $neigh_id . '" weight="' . ($occ / $term['occurrences']) . '">' . "\n";
			$gexf .= '<attvalues> <attvalue for="5" value="' . ($occ / $term['occurrences']) . '"' . '/><attvalue for="6" value="nodes2"/></attvalues>' . "\n" . '</edge>' . "\n";

		}
	}
}

// ecriture des liens entre scholars
//print_r($terms);
foreach ($scholars as $scholar) {
	$nodeId1 = $scholar['unique_id'];
	if (!array_key_exists($nodeId1, $scholarsMatrix)) {
		continue;
	}
	$neighbors = $scholarsMatrix[$nodeId1]['cooc'];
	if (!$neighbors) {
		continue;
	}
	foreach ($neighbors as $neigh_id => $occ) {
		if ($neigh_id != $nodeId1) {
			$edgeid += 1;
			$gexf .= '<edge id="' . $edgeid . '"' . ' source="D::' . $nodeId1 . '" ' . ' target="D::' . $neigh_id . '" weight="' . $occ . '">' . "\n";
			$gexf .= '<attvalues> <attvalue for="5" value="' . $occ . '"' . '/><attvalue for="6" value="nodes2"/></attvalues>' . "\n" . '</edge>' . "\n";

		}
	}
}

$gexf .= '</edges></graph></gexf>';

//pt(count($scholarsMatrix).' scholars');
//pt($scholarsIncluded.' scholars included');
//pt(count($termsMatrix).' terms');

echo $gexf;

function pt($string){
    echo $string.'<br/>';
}

function scholarlink($term_occurrences,$scholars1_nb_keywords,$scholars2nb_keywords){
    if (($term_occurrences>0)&&($scholars1_nb_keywords>0)&&($scholars2_nb_keywords>0)){
        return 1/log($term_occurrences)*1/log($scholars1_nb_keywords)*1/$scholars2_nb_keywords;    
    }else {
        return 0;
    }
    
    }                      

?>

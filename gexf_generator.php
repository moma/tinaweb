<?php

/*
 * genère un graph gexf à partir de la requete sql sur la table scholars
 */

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

#echo "login: ".$login.";";
$scholars = array();
$scholars_colors = array(); // pour dire s'il y a des jobs postés sur ce scholar
$terms_colors = array();// pour dire s'il y a des jobs postés sur ce term

#echo $sql . ";<br/>";
#print_r($data);
#echo "END;";
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
        $info['photo_url']=$row['Photo'];
	//print_r($row);
	$scholars[$row['unique_id']] = $info;
}

foreach ($scholars as $scholar) {
        $scholars_colors[trim($scholar['login'])]=0;
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


// on établi les couleurs
$sql='select login from jobs';
foreach ($base->query($sql) as $row) {
    $scholars_colors[trim($row['login'])]+=1;
}        

// liste des termes
$sql = "SELECT term,id,occurrences FROM terms";
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
    $terms_colors[$term['id']]=0;
}
$sql='select term_id from jobs2terms';
foreach ($base->query($sql) as $row) {
    if (array_key_exists($row['term_id'], $terms_colors)){
            $terms_colors[trim($row['term_id'])]+=1;
            //pt($terms_array[$row['term_id']]['term']);
    }

}

//print_r($terms_colors);


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
                        $scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] += 1;
                    } else {
                        $scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] =1;
                    }
                }
            }
        } else {
            $scholarsMatrix[$term_scholars[$k]]['occ'] = 1;
            for ($l = 0; $l < count($term_scholars); $l++) {
                if (array_key_exists($term_scholars[$l], $scholars)) {
                    if ($scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] != null) {
						$scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] += 1;
					} else {
						$scholarsMatrix[$term_scholars[$k]]['cooc'][$term_scholars[$l]] = 1;
					}
				}
			}
		}
	}
	$nodeId = 'N::' . $term['id'];
	$nodeLabel = str_replace('&', ' and ', $terms_array[$term['id']]['term']);
	$nodePositionY = rand(0, 100) / 100;
	$gexf .= '<node id="' . $nodeId . '" label="' . $nodeLabel . '">' . "\n";
	$gexf .= '<viz:color b="19" g="'.max(0,150-(50*$terms_colors[$term['id']])).'"  r="244"/>' . "\n";
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

                if ($scholar['photo_url'] != null) {
			$content .= '<img src="'.$scholar['photo_url'].'" width=80 float="right">' . '</br>';
		}
                
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
			$gexf .= '<viz:color b="'.min(255,(10*$scholars_colors[$scholar['login']])).'" g="204"  r="200"/>' . "\n";
			//$gexf .= '<viz:color '.$color.'/>' . "\n";
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
	$neighbors=$scholarsMatrix[$nodeId1]['cooc'];   
    foreach ($neighbors as $neigh_id => $cooc) {        
        if ($neigh_id!=$nodeId1) {
            $weight=jaccard($scholarsMatrix[$nodeId1]['occ'],$scholarsMatrix[$neigh_id]['occ'],$cooc);
            $edgeid+=1;
            $gexf.='<edge id="'.$edgeid.'"'.' source="D::'.$nodeId1.'" '.
                    ' target="D::'.$neigh_id.'" weight="'.$weight.'">'."\n";
            $gexf.='<attvalues> <attvalue for="5" value="'.$weight.'"'.
                    '/><attvalue for="6" value="nodes2"/></attvalues>'."\n".'</edge>'."\n";

        }
    }
}

$gexf .= '</edges></graph></gexf>';

//pt(count($scholarsMatrix).' scholars');
//pt($scholarsIncluded.' scholars included');
//pt(count($termsMatrix).' terms');
$handle = fopen('test.gexf', "w", "UTF-8");
fputs($handle,$gexf);
fclose($handle);

echo $gexf;

?>

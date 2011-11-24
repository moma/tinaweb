<?php

/*
 * Génère le gexf des scholars à partir de la base sqlite
 */
include("parametres.php");
//include("../common/library/fonctions_php.php");
include("normalize.php");


$base = new PDO("sqlite:" . $dbname);

$category = trim(strtolower($_GET['category']));
$term =  trim(strtolower($_GET['term']));
$q = "%".sanitize_input($term)."%";

$cat = '';
$query = '';
if ($category == 'country' || $category == 'countries') {
  $cat = "country";
  $query = 'LIKE \''.$q.'\'';
} elseif ($category == 'organization' || $category == 'organizations') {
  $cat = "affiliation";
  $query = 'LIKE \''.$q.'\'';
} elseif ($category == 'keyword' || $category == 'keywords') {
  $cat = "keywords";
  $query = 'LIKE \''.$q.'\'';
} elseif ($category == 'labs' || $category == 'laboratories' || $category == 'laboratory') {
  $cat = "lab";
  $query = 'LIKE \''.$q.'\'';
} else {
  echo ("ERROR");
  exit();
}

  $filtered = array (
  "yes", "1", "0", "nvgfpmeilym", "no", "mr", "ms", "", " ", "   "
  );
function filter_word($value) {
  return ! in_array(strtolower($value),$filtered); 
}

$req = "SELECT ".$cat." AS key, count(".$cat.") AS value FROM scholars WHERE ".$cat." ".$query." GROUP BY ".$cat." ORDER BY value DESC";
$results = array();
$i = 0;
foreach ($base->query($req) as $row) {

  if ($cat == "keywords") {
  	//echo "in keywords\n";
  	 $words = explode(",", $row["key"]);
  	foreach ($words as $word) {

		$pos = strpos($word,$term);
		if($pos === false) {
		  continue;
		}
		//echo "match found\n";
        //	echo "(".$value." contains ".$term." ?)";
        if (filter_word($word)) {
	        if (array_key_exists($word, $results)) {
	            $results[ $word ] += intval($value);
	        } else {
	            $results[ $word ] = intval($value);
	        }
        }
    }
  } else {
  	$word = $row["key"];
     if ($cat == "country") {
        $word = normalize_country($word);  
    }

    if (filter_word($word)) {
        if (array_key_exists($word, $results)) {
            $results[ $word ] += intval($value);
        } else {
            $results[ $word ] = intval($value);
        }
    }
   }
}


$completion = array();
foreach($results as $key => $value) {
     array_push($completion, array(
        'id' => $key,
        'label' => $key,
       // 'value' => $value,
       'score' => $value,
       'category' => $cat
      ));
}
$i = 0;

echo json_encode(array_slice($completion,0,$limit));
?>
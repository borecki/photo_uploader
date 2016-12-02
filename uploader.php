<?php

if($_SERVER["REQUEST_METHOD"] == "POST" && isset($_FILES)) {

    $images = $_FILES["images"];
    $images_dir = "images/";
    $errors = 0;
	$operator = 0;
	$namesArr = array();
    
	if(!empty($images)) {
		if (is_uploaded_file($images['tmp_name'][$operator])) {
			foreach($images["name"] as $fileName) {
				if( $images["error"][$operator] > 0 ) {
					$errors++;
					continue;
				} else {  
					$actual_name = pathinfo($fileName,PATHINFO_FILENAME);
					$original_name = $actual_name;
					$extension = pathinfo($fileName, PATHINFO_EXTENSION);
					
					$i = 1;
					while(file_exists('images/'.$actual_name.".".$extension))
					{           
						$actual_name = (string)$original_name.$i;
						$fileName = $actual_name.".".$extension;
						$i++;
					}
					array_push($namesArr, "http://" . $_SERVER['HTTP_HOST'] .  $_SERVER['REQUEST_URI'] . "/../images/" . $fileName);
					if( !move_uploaded_file($images["tmp_name"][$operator], $images_dir . $fileName) ) {
						$errors++;
					}
				}
			$operator++;
			}
		}
    }
    if($errors > 0) {
        echo json_encode(array(
            "error"   => true,
            "message" => "Wystąpił błąd!",
			"test" => $namesArr
        ));
    } else {
        echo json_encode(array(
            "error"   => false,
            "message" => "Wysyłanie zakończone powodzeniem!",
			"links" => $namesArr
        ));
    }
}

?>


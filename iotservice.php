<?php
cors();

$post = json_decode(file_get_contents('php://input'), true);

$type = $post["type"];

if(isset($post["type"])){

    if($type === "updateCode"){
        $source_code = $post["code"];
        exec("sudo echo '".$source_code."' > /var/www/html/iot/sketch.ino", $output, $retval);
        $data["result"] = "true";
        $data["output"] = $output;
        $data["returnval"] = $retval;
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
    }else if($type === "fetchCode"){
        $file = fopen("/var/www/html/iot/sketch.ino","r");
        $output = "";
        while(! feof($file)){
              $output = $output.fgets($file). "\n";
        }
        echo $output;
        fclose($file);
        }
    else if($type === "getStatus"){
        $file = fopen("/var/www/html/iot/iotstatus","r");
        $output = "";
        while(! feof($file)){
              $output = $output.fgets($file). "\n";
        }
        $data["result"] = "true";
        $data["output"] = $output;
        
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
    }else if($type === "setStatus"){
        $status_data = $post["statusData"];
        file_put_contents("/var/www/html/iot/iotstatus", $status_data);
        $data["result"] = "true";
        $data["message"] = "Status saved successfully";
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
    }else{
        $data["result"] = "false";
        $data["message"] = "Unrecognized request";
        echo json_encode($data, JSON_UNESCAPED_SLASHES);
    }
    
}else{
$data["result"] = "false";
$data["message"] = "Insufficient parameters";
echo json_encode($data, JSON_UNESCAPED_SLASHES);
}

function cors() {

    // Allow from any origin
    if (isset($_SERVER['HTTP_ORIGIN'])) {
        // Decide if the origin in $_SERVER['HTTP_ORIGIN'] is one
        // you want to allow, and if so:
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true');
        header('Access-Control-Max-Age: 86400');    // cache for 1 day
    }

    // Access-Control headers are received during OPTIONS requests
    if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
            // may also be using PUT, PATCH, HEAD etc
            header("Access-Control-Allow-Methods: GET, POST, OPTIONS");         

        if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
            header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

        exit(0);
    }

    //echo "Cors enabled";
}
?>
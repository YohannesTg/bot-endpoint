<?php
include 'config.php';
$apiUrl="https://api.telegram.org/bot{$BOT_TOKEN}/getUpdates";
$response=file_get_contents($apiUrl);
$data=json_decode($response,true);
echo "{$data[]}";
/*if($response===false){
    echo "Error getting bot info";
    exit(0);
}else{
    ;
    if($data['ok']==true){
        echo "Bot name: {$data['result']['username']}\n";
        echo "<br>";
        echo "Bot id: {$data['result']['id']}\n";
    }else{
        echo "Error getting bot info";
        exit(0);
    }
}*/
?>
<?php
include 'config.php';
$webHookUrl="https://phptestregistration.000webhostapp.com/index.php";
$apiUrl="https://api.telegram.org/bot{$BOT_TOKEN}/deleteWebhook";
$response=file_get_contents($apiUrl);
echo $apiUrl;
<?php
include 'config.php';
$webHookUrl="https://telegram-game-f3421.web.app";
$apiUrl="https://api.telegram.org/bot{$BOT_TOKEN}/setWebhook?url={$webHookUrl}";
$response=file_get_contents($apiUrl);
echo $response;
<?php
    $log = "";

    $dbServername   = "localhost";
    $dbUsername     = "root";
    $dbPassword     = "";
    $dbName         = "shoppinglist"

    $conn = mysqli_connect($dbServername, $dbUsername, $dbPassword, $dbName);

    if(!$conn){
        $log = $log . "Error: Unable to connect to database";
    } elseif ($conn){
        $log = $log . "Database connection successful!";
    }

?>
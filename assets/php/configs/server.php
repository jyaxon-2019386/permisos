<?php

header('Content-Type: text/html; charset=UTF-8');
date_default_timezone_set("America/Guatemala");
session_start();
$hoy = date("Y-m-d");

// ---------------- MYSQL SISTEMAS -------------------- //

// $con = mysqli_connect("localhost", "root", "");
// if (!$con) {
//     die('Could not connect: ' . mysqli_connect_error());
// }
// mysqli_select_db($con, "crea");
// $con->set_charset("utf8");

// $dsn = "Driver={SQL Server};Server=192.168.1.7;Port=1433;Database=Permisos";
// $data_source = 'zzzz';
// $user = 'sa';
// $password = 'Empres@s0425';

$dsn = "Driver={SQL Server};Server=JUAN-PABLO\\SQLEXPRESS;Port=1433;Database=Permisos";
$data_source = 'zzzz';
$user = 'sa';
$password = 'Empresas0425';

// $dsn = "Driver={SQL Server};Server=JUAN-PABLO\\SQLEXPRESS;Port=1433;Database=Permisos;Integrated Security=SSPI;";
// $user = ''; // Dejar vacío
// $password = ''; // Dejar vacío

// Connect to the data source and get a handle for that connection.

$con = odbc_connect($dsn, $user, $password);
if (!$con) {
    if (phpversion() < '4.0') {
        exit("Connection Failed: . $php_errormsg");
    } else {
        exit("Connection Failed:" . odbc_errormsg());
    }
}

// Detectar tipo de petición
$request_method = $_SERVER["REQUEST_METHOD"];
$quest = isset($_GET['quest']) ? $_GET['quest'] : null;
$data = json_decode(file_get_contents('php://input'), true);



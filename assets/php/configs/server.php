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

$dsn = "Driver={SQL Server};Server=LAPTOP-VURT2290;Port=1433;Database=Permisos";
$data_source = 'zzzz';
$user = 'admin';
$password = '1215';
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

// Detectar acción
$quest = null;
$data = [];

if ($request_method === 'GET') {
    $quest = isset($_GET['quest']) ? $_GET['quest'] : null;
} else {
    $data = json_decode(file_get_contents('php://input'), true);
    $quest = isset($data['quest']) ? $data['quest'] : null;
}

// 👉 Lista de acciones que **NO** requieren autenticación
$acciones_publicas = ['login', 'getUser', 'getUserTicketVacations', 'getUserTicketReplaceTime', 'getUserTicketJustification', 'getUserTicketRequestIGSS', 'getUserTicketOffIGSS', 'getUserOff', 'Boleta', 'getLastTicket', 'getProyectosByFechaInicioFin'];

// Si la acción no es pública, verificamos si el usuario está logueado
if (!in_array($quest, $acciones_publicas)) {
    if (!isset($_SESSION['id_usuario'])) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'Usuario no autenticado']);
        exit;
    }
}

// Si pasa, podés seguir usando $id_usuario en tus acciones privadas
$id_usuario = $_SESSION['id_usuario'] ?? null;

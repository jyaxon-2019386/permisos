<?php


// --- Configuración inicial y CORS ---
header('Content-Type: text/html; charset=UTF-8'); // Considera 'application/json' si solo retornas JSON
date_default_timezone_set("America/Guatemala");
session_start(); // Inicia la sesión si la usas

header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS"); // Métodos permitidos
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Cabeceras permitidas

// Manejo de solicitudes OPTIONS (pre-vuelo CORS)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit(); // Termina la ejecución para solicitudes OPTIONS
}

 // --- Configuración de Conexión a Base de Datos ---
$dsn = "Driver={SQL Server};Server=JUAN-PABLO\\SQLEXPRESS;Port=1433;Database=Permisos";
$user = 'sa';
$password = 'Empresas0425';

// $dsn = "Driver={SQL Server};Server=LAPTOP-VURT2290;Port=1433;Database=Permisos"; 
// $user = 'admin';
// $password = '1215';

// $dsn = "Driver={SQL Server};Server=192.168.1.7;Port=1433;Database=Permisos";
// $user = 'sa';
// $password = 'Empres@s0425';

$con = odbc_connect($dsn, $user, $password);
if (!$con) {
    // Un mensaje de error más claro
    http_response_code(500);
    echo json_encode(["error" => "Error de conexión a la base de datos: " . odbc_errormsg()]);
    exit(); // Termina la ejecución si no hay conexión a la DB
}

// --- Detección del Método de Solicitud y Parseo de Datos ---
$request_method = $_SERVER["REQUEST_METHOD"]; 

$raw_input = file_get_contents('php://input');
$data = json_decode($raw_input, true); 


$quest = null;
if ($request_method === 'GET' && isset($_GET['quest'])) {
    $quest = $_GET['quest'];
} elseif (isset($data['quest'])) { 
    $quest = $data['quest'];      
}




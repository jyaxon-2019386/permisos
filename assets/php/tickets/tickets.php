<?php
require_once ('../configs/server.php'); // Incluye las configuraciones del servidor y SWITCH / CASE

switch ($request_method) {
    case 'GET':
        switch ($quest) {
                case 'getUserTicketVacations': // BOLETAS VACACIONES
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';
                    $sql = "SELECT * FROM BoletaVacaciones WHERE idCreador = ?";
                    $stmt = odbc_prepare($con, $sql);

                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];
                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }
                    if (!empty($tickets)) {
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;
                case 'getUserTicketReplaceTime': // BOLETAS REPOSICIÓN DE TIEMPO
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';
                    if (!is_numeric($idCreador) || $idCreador === '') {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "ID de solicitante inválido"
                        ]);
                        break;
                    }
                    $sql = "SELECT * FROM BoletaReposicion WHERE idCreador = ?";
                    $stmt = odbc_prepare($con, $sql);

                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];
                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }
                    if (!empty($tickets)) {
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;
                case 'getUserTicketJustification': // BOLETAS FALTA JUSTIFICADA
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';
                    $sql = "SELECT * FROM BoletaEspecial WHERE idCreador = ?";
                    $stmt = odbc_prepare($con, $sql);

                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];
                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }

                    if(!empty($tickets)){
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;
                case 'getUserTicketRequestIGSS': // BOLETAS CONSULTA IGSS
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';
                    $sql = "SELECT * FROM BoletaConsultaIGSS WHERE idCreador = ?";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];

                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }

                    if(!empty($tickets)){
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;
                case 'getUserTicketOffIGSS': // BOLETAS SUSPENSION IGSS
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';

                    $sql = "SELECT * FROM BoletaSuspencionIGSS WHERE idCreador = ?";
                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];

                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }

                    if(!empty($tickets)){
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;

                    case 'getUserOff': // BOLETAS SANCION
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';

                    $sql = "SELECT * FROM BoletaSancion WHERE idCreador = ?";
                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];

                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }

                    if(!empty($tickets)){
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;
                
                case 'getLastTicket': // ÚLTIMA BOLETA VACACIONES
                    $idCreador = isset($_GET['idCreador']) ? trim($_GET['idCreador']) : '';
                    $sql = "SELECT TOP 5 * FROM BoletaEspecial WHERE idCreador = ? ORDER BY fechaSolicitud DESC";
                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt, [$idCreador]);
                    $tickets = [];
                    if($exec){
                        while($row = odbc_fetch_array($stmt)){
                            $row = array_map(function($val){
                                return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                            }, $row);
                            $tickets[] = $row;
                        }
                    }

                    if(!empty($tickets)){
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boletas encontradas",
                            "my tickets" => $tickets
                        ]);
                    } else {
                        http_response_code(400);
                        echo json_encode([
                            "success" => false,
                            "error" => "Boletas no encontradas"
                        ]);
                    }
                    break;

                    default:
                        header("HTTP/1.1 400 Bad Request");
                        echo json_encode(["error" => "Quest GET no encontrado"]);
                        break;
                }
                break;
    
    case 'POST':
        switch ($quest) {
            case 'postTicketVacations': // INSERTAR BOLETAS VACACIONES
                $idCreador = isset($_POST['idCreador']) ? trim($_POST['idCreador']) : '';
                $fechaInicio = isset($_POST['fechaInicio']) ? trim($_POST['fechaInicio']) : '';
                $fechaFin = isset($_POST['fechaFin']) ? trim($_POST['fechaFin']) : '';
                $motivo = isset($_POST['motivo']) ? trim($_POST['motivo']) : '';

                if (empty($idCreador) || empty($fechaInicio) || empty($fechaFin) || empty($motivo)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Datos incompletos para la boleta de vacaciones"]);
                    break;
                }

                $sql = "INSERT INTO BoletaVacaciones (idCreador, fechaInicio, fechaFin, motivo) VALUES (?, ?, ?, ?)";
                $stmt = odbc_prepare($con, $sql);
                $exec = odbc_execute($stmt, [$idCreador, $fechaInicio, $fechaFin, $motivo]);

                if ($exec) {
                    http_response_code(201);
                    echo json_encode(["success" => "Boleta de vacaciones creada exitosamente"]);
                } else {
                    http_response_code(500);
                    echo json_encode(["error" => "Error al crear la boleta de vacaciones"]);
                }
                
            
            default:
                header("HTTP/1.1 400 Bad Request");
                echo json_encode(["error" => "Quest POST no encontrado"]);
                break;
            }
            break;

            default:
            header('HTTP/1.1 405 Method Not Allowed');
            echo json_encode(['error' => 'Método no permitido']);
            break;
}

?>
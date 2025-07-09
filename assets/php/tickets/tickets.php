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

                case 'getTicketVacationsRRHH':
                
                    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                    $offset = ($page - 1) * $limit;

                    // Consulta principal paginada
                    $sql = "SELECT 
                    b.idBoleta, 
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion, 
                    u.nombre AS Solicitante, 
                    d.nombre AS Departamento, 
                    e.nombre AS Estado,
					u.puesto AS Puesto,
					u.idEmpresa AS Empresa,
					b.totalD AS TotalDias,
					b.fecha1 AS Fecha1,
					b.fecha2 AS Fecha2,
					b.fecha3 AS Fecha3,
					b.fecha4 AS Fecha4,
					b.fecha5 AS Fecha5,
					b.desc1 AS Detalle1,
					b.desc2 AS Detalle2,
					b.desc3 AS Detalle3,
					b.desc4 AS Detalle4,
					b.desc5 AS Detalle5,
                    b.fecha_actualizado AS FechaActualizado
                FROM 
                    BoletaVacaciones b
                INNER JOIN 
                    Estado e ON b.idEstado = e.idEstado
                INNER JOIN 
                    Usuario u ON b.idSolicitante = u.idUsuario
                INNER JOIN 
                    Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    b.idEstado IN (4, 9, 11, 12, 13)
                ORDER BY b.idBoleta DESC
                    OFFSET $offset ROWS FETCH NEXT $limit ROWS ONLY";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt);
                    $tickets = [];

                    if ($exec) {
                        while ($row = odbc_fetch_array($stmt)) {
                            $row = array_map(fn($v) => !is_null($v) ? mb_convert_encoding($v, 'UTF-8', 'Windows-1252') : null, $row);
                            $tickets[] = $row;
                        }
                    }

                    // Obtener el total de boletas
                    $countQuery = "SELECT COUNT(*) AS total FROM BoletaVacaciones WHERE idEstado IN (4, 9, 11, 12, 13)";
                    $countResult = odbc_exec($con, $countQuery);
                    $totalRows = ($countResult && odbc_fetch_row($countResult)) ? intval(odbc_result($countResult, 'total')) : 0;
                    $totalPaginas = ceil($totalRows / $limit);

                    http_response_code(!empty($tickets) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($tickets),
                        "message" => !empty($tickets) ? "Boletas encontradas" : "Boletas no encontradas",
                        "boletas" => $tickets,
                        "paginaActual" => $page,
                        "totalPaginas" => $totalPaginas,
                        "totalBoletas" => $totalRows
                    ]);
                    break;


                case 'getTicketReplaceTimeRRHH':

                    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                    $offset = ($page - 1) * $limit;

                    $sql = "SELECT 
                    b.idBoleta, 
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion, 
                    u.nombre AS Solicitante, 
                    u.puesto AS Cargo,
                    u.idEmpresa AS Empresa,
                    b.fecha1 AS Fecha1,
                    b.fecha2 AS Fecha2,
                    b.fecha3 AS Fecha3,
                    b.fecha4 AS Fecha4,
                    b.fecha5 AS Fecha5,
                    b.fecha1R AS FechaR1,
                    b.fecha2R AS FechaR2,
                    b.fecha3R AS FechaR3,
                    b.fecha4R AS FechaR4,
                    b.fecha5R AS FechaR5,
                    b.totalH AS totalHoras,
                    b.totalH AS totalHorasR,
                    b.observaciones1,
                    b.observaciones2,
                    b.observaciones3,
                    b.observaciones4,
                    d.nombre AS Departamento, 
                    e.nombre AS Estado, 
                    b.fecha_actualizado AS FechaActualizado
                FROM 
                    BoletaReposicion b
                INNER JOIN 
                    Estado e ON b.idEstado = e.idEstado
                INNER JOIN 
                    Usuario u ON b.idSolicitante = u.idUsuario
                INNER JOIN 
                    Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    b.idEstado IN (4, 9, 11, 12, 13)
                ORDER BY 
                    b.idBoleta DESC
                    OFFSET $offset ROWS FETCH NEXT $limit ROWS ONLY;";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt);
                    $tickets = [];

                    if ($exec) {
                        while ($row = odbc_fetch_array($stmt)) {
                            $row = array_map(fn($v) => !is_null($v) ? mb_convert_encoding($v, 'UTF-8', 'Windows-1252') : null, $row);
                            $tickets[] = $row;
                        }
                    }

                    // Obtener el total de boletas
                    $countQuery = "SELECT COUNT(*) AS total FROM BoletaReposicion WHERE idEstado IN (4, 9, 11, 12, 13)";
                    $countResult = odbc_exec($con, $countQuery);
                    $totalRows = ($countResult && odbc_fetch_row($countResult)) ? intval(odbc_result($countResult, 'total')) : 0;
                    $totalPaginas = ceil($totalRows / $limit);

                    http_response_code(!empty($tickets) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($tickets),
                        "message" => !empty($tickets) ? "Boletas encontradas" : "Boletas no encontradas",
                        "boletas" => $tickets,
                        "paginaActual" => $page,
                        "totalPaginas" => $totalPaginas,
                        "totalBoletas" => $totalRows
                    ]);
                    break;

                case 'getTicketJustificationRRHH': // BOLETAS JUSTIFICACION / ESPECIAL

                    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                    $offset = ($page - 1) * $limit;

                    $sql = "SELECT 
                    b.idBoleta, 
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion, 
                    u.nombre AS Solicitante, 
					u.puesto AS Cargo,
                    u.idEmpresa AS Empresa,
                    d.nombre AS Departamento, 
                    e.nombre AS Estado, 
					b.fecha1 AS fecha1,
					b.fecha2 AS fecha2,
					b.fecha3 AS fecha3,
					b.fecha4 AS fecha4,
					b.fecha5 AS fecha5,
					
					b.desc1A AS Detalle1,
					b.desc2A AS Detalle2,
					b.desc3A AS Detalle3,
					b.desc4A AS Detalle4,
					b.desc5A AS Detalle5,

					b.observaciones1 AS observaciones1,
					b.observaciones2 AS observaciones2,
					b.observaciones3 AS observaciones3,
					b.observaciones4 AS observaciones4,
					b.totalH AS totalHoras,
                    b.fecha_actualizado AS FechaActualizado
                FROM 
                    BoletaEspecial b
                INNER JOIN 
                    Estado e ON b.idEstado = e.idEstado
                INNER JOIN 
                    Usuario u ON b.idSolicitante = u.idUsuario
                INNER JOIN 
                    Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    b.idEstado IN (4, 9, 11, 12, 13)
                    
                ORDER BY b.idBoleta DESC
                    OFFSET $offset ROWS FETCH NEXT $limit ROWS ONLY;";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt);
                    $tickets = [];

                    if ($exec) {
                        while ($row = odbc_fetch_array($stmt)) {
                            $row = array_map(fn($v) => !is_null($v) ? mb_convert_encoding($v, 'UTF-8', 'Windows-1252') : null, $row);
                            $tickets[] = $row;
                        }
                    }

                    // Obtener el total de boletas
                    $countQuery = "SELECT COUNT(*) AS total FROM BoletaEspecial WHERE idEstado IN (4, 9, 11, 12, 13)";
                    $countResult = odbc_exec($con, $countQuery);
                    $totalRows = ($countResult && odbc_fetch_row($countResult)) ? intval(odbc_result($countResult, 'total')) : 0;
                    $totalPaginas = ceil($totalRows / $limit);

                    http_response_code(!empty($tickets) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($tickets),
                        "message" => !empty($tickets) ? "Boletas encontradas" : "Boletas no encontradas",
                        "boletas" => $tickets,
                        "paginaActual" => $page,
                        "totalPaginas" => $totalPaginas,
                        "totalBoletas" => $totalRows
                    ]);
                    break;

                
                case 'getTicketRequestIGSSRRHH':

                    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                    $offset = ($page - 1) * $limit;

                    $sql = "SELECT 
                    b.idBoleta, 
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion, 
                    u.nombre AS Solicitante, 
					u.puesto AS Cargo,
                    u.idEmpresa AS Empresa,
                    d.nombre AS Departamento, 
                    e.nombre AS Estado,
					b.fecha1 AS Fecha,
					b.desc1 AS Detalle,
					b.horaI1 AS HoraInicio,
					b.horaF1 AS HoraFinal,
					b.observaciones1 AS observaciones1,
					b.observaciones2 AS observaciones2,
					b.observaciones3 AS observaciones3,
					b.observaciones4 AS observaciones4,
					b.totalH as HorasTotal,
                    b.fecha_actualizado AS FechaActualizado
                FROM 
                    BoletaConsultaIGSS b
                INNER JOIN 
                    Estado e ON b.idEstado = e.idEstado
                INNER JOIN 
                    Usuario u ON b.idSolicitante = u.idUsuario
                INNER JOIN 
                    Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    b.idEstado IN (4, 9, 11, 12, 13)
                    
                ORDER BY b.idBoleta DESC
                    OFFSET $offset ROWS FETCH NEXT $limit ROWS ONLY;";
                     

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt);
                    $tickets = [];

                    if ($exec) {
                        while ($row = odbc_fetch_array($stmt)) {
                            $row = array_map(fn($v) => !is_null($v) ? mb_convert_encoding($v, 'UTF-8', 'Windows-1252') : null, $row);
                            $tickets[] = $row;
                        }
                    }

                    // Obtener el total de boletas
                    $countQuery = "SELECT COUNT(*) AS total FROM BoletaConsultaIGSS WHERE idEstado IN (4, 9, 11, 12, 13)";
                    $countResult = odbc_exec($con, $countQuery);
                    $totalRows = ($countResult && odbc_fetch_row($countResult)) ? intval(odbc_result($countResult, 'total')) : 0;
                    $totalPaginas = ceil($totalRows / $limit);

                    http_response_code(!empty($tickets) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($tickets),
                        "message" => !empty($tickets) ? "Boletas encontradas" : "Boletas no encontradas",
                        "boletas" => $tickets,
                        "paginaActual" => $page,
                        "totalPaginas" => $totalPaginas,
                        "totalBoletas" => $totalRows
                    ]);
                    break;

                case 'getUserTicketOffIGSSRRHH':

                    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                    $offset = ($page - 1) * $limit;

                    $sql = "SELECT 
                    b.idBoleta, 
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion, 
                    u.nombre AS Solicitante,
                    u.puesto AS Cargo,
                    u.idEmpresa AS Empresa,
                    d.nombre AS Departamento, 
                    e.nombre AS Estado, 
                    b.fechaInicio AS fechaInicio,
                    b.fechaFinal AS fechaFinal,
                    b.totalD as TotalDias,
                    b.fecha_actualizado AS FechaActualizado
                FROM 
                    BoletaSuspencionIGSS b
                INNER JOIN 
                    Estado e ON b.idEstado = e.idEstado
                INNER JOIN 
                    Usuario u ON b.idSolicitante = u.idUsuario 
                    
                INNER JOIN 
                    Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    b.idEstado IN (4, 9, 11, 12, 13)

                                    
                ORDER BY b.idBoleta DESC
                    OFFSET $offset ROWS FETCH NEXT $limit ROWS ONLY;";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt);
                    $tickets = [];

                    if ($exec) {
                        while ($row = odbc_fetch_array($stmt)) {
                            $row = array_map(fn($v) => !is_null($v) ? mb_convert_encoding($v, 'UTF-8', 'Windows-1252') : null, $row);
                            $tickets[] = $row;
                        }
                    }

                    // Obtener el total de boletas
                    $countQuery = "SELECT COUNT(*) AS total FROM BoletaSuspencionIGSS WHERE idEstado IN (4, 9, 11, 12, 13)";
                    $countResult = odbc_exec($con, $countQuery);
                    $totalRows = ($countResult && odbc_fetch_row($countResult)) ? intval(odbc_result($countResult, 'total')) : 0;
                    $totalPaginas = ceil($totalRows / $limit);

                    http_response_code(!empty($tickets) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($tickets),
                        "message" => !empty($tickets) ? "Boletas encontradas" : "Boletas no encontradas",
                        "boletas" => $tickets,
                        "paginaActual" => $page,
                        "totalPaginas" => $totalPaginas,
                        "totalBoletas" => $totalRows
                    ]);
                    break;

                case 'getTicketOffRRHH':

                    $page = isset($_GET['page']) ? intval($_GET['page']) : 1;
                    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 10;
                    $offset = ($page - 1) * $limit;

                    $sql = "SELECT 
                    b.idBoleta,
                    b.tipo AS Tipo,
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion,
                    u.nombre AS Solicitante,
                    u.puesto AS Cargo,
                    u.idEmpresa AS Empresa,
                    e.nombre AS Estado,
                    d.nombre AS Departamento,
                    b.fecha_actualizado AS FechaActualizado
                FROM 
                    BoletaSancion b
                INNER JOIN 
                    Estado e ON b.idEstado = e.idEstado
                INNER JOIN 
                    Usuario u ON b.idSolicitante = u.idUsuario
                INNER JOIN 
                    Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    b.idEstado IN (4, 9, 11, 12, 13)
                    
                ORDER BY b.idBoleta DESC
                    OFFSET $offset ROWS FETCH NEXT $limit ROWS ONLY;";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt);
                    $tickets = [];

                    if ($exec) {
                        while ($row = odbc_fetch_array($stmt)) {
                            $row = array_map(fn($v) => !is_null($v) ? mb_convert_encoding($v, 'UTF-8', 'Windows-1252') : null, $row);
                            $tickets[] = $row;
                        }
                    }

                    // Obtener el total de boletas
                    $countQuery = "SELECT COUNT(*) AS total FROM BoletaSancion WHERE idEstado IN (4, 9, 11, 12, 13)";
                    $countResult = odbc_exec($con, $countQuery);
                    $totalRows = ($countResult && odbc_fetch_row($countResult)) ? intval(odbc_result($countResult, 'total')) : 0;
                    $totalPaginas = ceil($totalRows / $limit);

                    http_response_code(!empty($tickets) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($tickets),
                        "message" => !empty($tickets) ? "Boletas encontradas" : "Boletas no encontradas",
                        "boletas" => $tickets,
                        "paginaActual" => $page,
                        "totalPaginas" => $totalPaginas,
                        "totalBoletas" => $totalRows
                    ]);
                    break;

                    case 'getTicketById':
            $idBoleta = isset($_GET['idBoleta']) ? intval($_GET['idBoleta']) : 0;

                    $sql = "SELECT 
                                b.idBoleta, 
                                CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreacion, 
                                u.nombre AS Solicitante, 
                                d.nombre AS Departamento, 
                                e.nombre AS Estado,
                                u.puesto AS Puesto,
                                u.idEmpresa AS Empresa,
                                b.totalD AS TotalDias,
                                b.fecha1 AS Fecha1,
                                b.fecha2 AS Fecha2,
                                b.fecha3 AS Fecha3,
                                b.fecha4 AS Fecha4,
                                b.fecha5 AS Fecha5,
                                b.desc1 AS Detalle1,
                                b.desc2 AS Detalle2,
                                b.desc3 AS Detalle3,
                                b.desc4 AS Detalle4,
                                b.desc5 AS Detalle5,
                                b.fecha_actualizado AS FechaActualizado
                            FROM BoletaVacaciones b
                            INNER JOIN Estado e ON b.idEstado = e.idEstado
                            INNER JOIN Usuario u ON b.idSolicitante = u.idUsuario
                            INNER JOIN Departamento d ON u.idDepartamentoP = d.idDepartamento
                            WHERE b.idBoleta = ?";

                    $stmt = odbc_prepare($con, $sql);
                    $exec = odbc_execute($stmt, [$idBoleta]);
                    $ticket = [];

                    if ($exec && odbc_fetch_row($stmt)) {
                        for ($i = 1; $i <= odbc_num_fields($stmt); $i++) {
                            $field = odbc_field_name($stmt, $i);
                            $ticket[$field] = mb_convert_encoding(odbc_result($stmt, $i), 'UTF-8', 'Windows-1252');
                        }
                    }

                    http_response_code(!empty($ticket) ? 200 : 404);
                    echo json_encode([
                        "success" => !empty($ticket),
                        "message" => !empty($ticket) ? "Boleta encontrada" : "Boleta no encontrada",
                        "boleta" => $ticket
                    ]);
                    break;

                case 'getBoletasPorFecha':
    $fechaInicio = $_GET['fechaInicio'] ?? null;
    $fechaFin = $_GET['fechaFin'] ?? null;

    if ($fechaInicio && $fechaFin) {
        try {
            // Formatear las fechas al formato YYYY-MM-DD
            $fechaInicioFormat = date('Y-m-d', strtotime(str_replace('/', '-', $fechaInicio)));
            $fechaFinFormat = date('Y-m-d', strtotime(str_replace('/', '-', $fechaFin)));

            $sql = "
                SELECT 
                    b.idBoleta, 
                    CONVERT(VARCHAR(10), b.fechaSolicitud, 103) AS FechaDeCreación, 
                    u.nombre AS Solicitante,
                    d.nombre AS Departamento, 
                    e.nombre AS Estado, 
                    b.fecha_actualizado AS [Fecha Actualizado]
                FROM BoletaVacaciones b
                INNER JOIN Estado e ON b.idEstado = e.idEstado
                INNER JOIN Usuario u ON b.idSolicitante = u.idUsuario
                INNER JOIN Departamento d ON u.idDepartamentoP = d.idDepartamento
                WHERE 
                    TRY_CONVERT(DATE, b.fechaSolicitud, 103) BETWEEN ? AND ?
                    AND b.idEstado IN (4, 9, 11, 12, 13)
            ";

            $stmt = $conn->prepare($sql);
            $stmt->execute([$fechaInicioFormat, $fechaFinFormat]);
            $boletas = $stmt->fetchAll(PDO::FETCH_ASSOC);

            if ($boletas) {
                echo json_encode([
                    'success' => true,
                    'boletas' => $boletas
                ]);
            } else {
                echo json_encode([
                    'success' => false,
                    'message' => 'No se encontraron boletas en ese rango de fechas.'
                ]);
            }

        } catch (Exception $e) {
            echo json_encode([
                'success' => false,
                'message' => 'Error al buscar boletas por fecha.',
                'error' => $e->getMessage()
            ]);
        }
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Debe proporcionar fechaInicio y fechaFin.'
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
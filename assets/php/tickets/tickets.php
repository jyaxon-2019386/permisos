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
                    b.observaciones1,
                    b.observaciones2,
                    b.observaciones3,
                    b.observaciones4,
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

                                $row['HoraInicio'] = convertirDecimalAHora($row['HoraInicio']);
                                $row['HoraFinal']  = convertirDecimalAHora($row['HoraFinal']);

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
                        b.observaciones1,
                        b.observaciones2,
                        b.observaciones3,
                        b.observaciones4,
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
                        b.observaciones1,
                        b.observaciones2,
                        b.observaciones3,
                        b.observaciones4,
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
                      case 'getTicketsIGSSFaltantes': // Obtener boletas con horaF1 o totalH en NULL o 0


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
            case 'postTicketVacations':

            function limpiarTexto($texto) {
                return isset($texto) ? utf8_decode(trim($texto)) : null;
            }

            // Obtener nuevo correlativo
            $sqlCorrelativo = "SELECT ISNULL(MAX(correlativo), 0) + 1 AS nuevoCorrelativo FROM BoletaVacaciones";
            $result = odbc_exec($con, $sqlCorrelativo);
            $correlativo = 1;
            if ($result && odbc_fetch_row($result)) {
                $correlativo = odbc_result($result, "nuevoCorrelativo");
            }

            $fechaSolicitud = isset($data['fechaSolicitud']) ? trim($data['fechaSolicitud']) : '';

            $observaciones1 = limpiarTexto($data['observaciones1'] ?? null);
            $observaciones2 = limpiarTexto($data['observaciones2'] ?? null);
            $observaciones3 = limpiarTexto($data['observaciones3'] ?? null);
            $observaciones4 = limpiarTexto($data['observaciones4'] ?? null);

            $idSolicitante = trim($data['idSolicitante'] ?? '');
            $idCreador = trim($data['idCreador'] ?? '');
            $idDepartamento = trim($data['idDepartamento'] ?? '');
                        
            $idGerente = trim($data['idGerente'] ?? '') ?: null;
            $idRH = trim($data['idRH'] ?? '') ?: null;
            
            if (empty($idDepartamento)) {
                http_response_code(400);
                echo json_encode(["error" => "No se pudo determinar el departamento del solicitante."]);
                break;
            }

            // Consulta para encontrar al jefe y pueda autorizar
            $sqlJefe = "SELECT idUsuario FROM UsuarioDep WHERE nivel = 1 AND idDepartamento = ?";
            $stmtJefe = odbc_prepare($con, $sqlJefe);
            if (!$stmtJefe) {
                http_response_code(500);
                echo json_encode(["error" => "Error al preparar la consulta para encontrar al jefe."]);
                break;
            }
            
            $paramsJefe = [$idDepartamento];
            if (!odbc_execute($stmtJefe, $paramsJefe)) {
                http_response_code(500);
                echo json_encode(["error" => "Error al ejecutar la consulta para encontrar al jefe.", "detalle" => odbc_errormsg($con)]);
                break;
            }
            
            if (!odbc_fetch_row($stmtJefe)) {
                http_response_code(400);
                echo json_encode([
                    "error" => "No se encontró un jefe de nivel 1 para el departamento con ID {$idDepartamento}. Por favor, verifique la configuración de los usuarios."
                ]);
                break;
            }
            
            $idJefe = odbc_result($stmtJefe, 'idUsuario');
            
            
            $idEstado = trim($data['idEstado'] ?? '');
            $totalD = trim($data['totalD'] ?? '') ?: null;

            $fechas = [];
            $descs = [];
            $tieneParValido = false;

            for ($i = 1; $i <= 10; $i++) {
                $fecha = isset($data['fecha' . $i]) ? trim($data['fecha' . $i]) : null;
                $desc = isset($data['desc' . $i]) ? limpiarTexto($data['desc' . $i]) : null;

                $fecha = (strtolower($fecha) === 'null' || $fecha === '') ? null : $fecha;
                $desc = (strtolower($desc) === 'null' || $desc === '') ? null : $desc;

                $fechas[$i] = $fecha;
                $descs[$i] = $desc;

                if (($fecha && !$desc) || (!$fecha && $desc)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Debes ingresar una fecha válida. Revisar el día #{$i}."]);
                    break 2;
                }
                if ($fecha && $desc) {
                    $tieneParValido = true;
                }
            }

            if (!$tieneParValido) {
                http_response_code(400);
                echo json_encode(["error" => "Debe ingresar al menos una fecha con su descripción."]);
                break;
            }

            odbc_exec($con, "SET LANGUAGE SPANISH;");

            $sql = "INSERT INTO BoletaVacaciones (
                correlativo, observaciones1, observaciones2, observaciones3, observaciones4,
                fechaSolicitud,
                fecha1, desc1, fecha2, desc2, fecha3, desc3, fecha4, desc4, fecha5, desc5,
                fecha6, desc6, fecha7, desc7, fecha8, desc8, fecha9, desc9, fecha10, desc10,
                totalD, idSolicitante, idCreador, idDepartamento, idJefe, idGerente, idRH, idEstado, fecha_actualizado
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?,
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )";

            $params = [
                $correlativo,
                $observaciones1,
                $observaciones2,
                $observaciones3,
                $observaciones4,
                $fechaSolicitud,
                $fechas[1], $descs[1],
                $fechas[2], $descs[2],
                $fechas[3], $descs[3],
                $fechas[4], $descs[4],
                $fechas[5], $descs[5],
                $fechas[6], $descs[6],
                $fechas[7], $descs[7],
                $fechas[8], $descs[8],
                $fechas[9], $descs[9],
                $fechas[10], $descs[10],
                $totalD,
                $idSolicitante,
                $idCreador,
                $idDepartamento,
                $idJefe,
                $idGerente,
                $idRH,
                $idEstado,
                null
            ];

            $stmt = odbc_prepare($con, $sql);
            if (!$stmt) {
                http_response_code(500);
                echo json_encode(["error" => "Falló la preparación de la consulta SQL.", "detalle" => odbc_errormsg($con)]);
                break;
            }

            $exec = odbc_execute($stmt, $params);

            if ($exec) {
                http_response_code(201);
                echo json_encode(["success" => "Boleta creada exitosamente."]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al crear la boleta de vacaciones.", "detalle" => odbc_errormsg($con)]);
            }

            break;
        case 'postTicketSpecial':

            function limpiarTexto($texto) {
                return isset($texto) ? utf8_decode(trim($texto)) : null;
            }

            // Obtener nuevo correlativo
            $sqlCorrelativo = "SELECT ISNULL(MAX(correlativo), 0) + 1 AS nuevoCorrelativo FROM BoletaEspecial";
            $result = odbc_exec($con, $sqlCorrelativo);
            $correlativo = 1;
            if ($result && odbc_fetch_row($result)) {
                $correlativo = odbc_result($result, "nuevoCorrelativo");
            }

            $fechaSolicitud = isset($data['fechaSolicitud']) ? trim($data['fechaSolicitud']) : '';

            $observaciones1 = limpiarTexto($data['observaciones1'] ?? null);
            $observaciones2 = limpiarTexto($data['observaciones2'] ?? null);
            $observaciones3 = limpiarTexto($data['observaciones3'] ?? null);
            $observaciones4 = limpiarTexto($data['observaciones4'] ?? null);

            $idSolicitante = trim($data['idSolicitante'] ?? '');
            $idCreador = trim($data['idCreador'] ?? '');
            $idDepartamento = trim($data['idDepartamento'] ?? '');
            
            $idGerente = trim($data['idGerente'] ?? '') ?: null;
            $idRH = trim($data['idRH'] ?? '') ?: null;

            if (empty($idDepartamento)) {
                http_response_code(400);
                echo json_encode(["error" => "No se pudo determinar el departamento del solicitante."]);
                break;
            }

            // Buscar jefe de departamento
            $sqlJefe = "SELECT idUsuario FROM UsuarioDep WHERE nivel = 1 AND idDepartamento = ?";
            $stmtJefe = odbc_prepare($con, $sqlJefe);
            if (!$stmtJefe) {
                http_response_code(500);
                echo json_encode(["error" => "Error al preparar la consulta para encontrar al jefe."]);
                break;
            }

            if (!odbc_execute($stmtJefe, [$idDepartamento])) {
                http_response_code(500);
                echo json_encode(["error" => "Error al ejecutar la consulta para encontrar al jefe.", "detalle" => odbc_errormsg($con)]);
                break;
            }

            if (!odbc_fetch_row($stmtJefe)) {
                http_response_code(400);
                echo json_encode(["error" => "No se encontró un jefe de nivel 1 para el departamento con ID {$idDepartamento}."]);
                break;
            }

            $idJefe = odbc_result($stmtJefe, 'idUsuario');
            $idEstado = trim($data['idEstado'] ?? '');
            $totalH = trim($data['totalH'] ?? '') ?: null;

            // Procesar fechas y descripciones
            $fechas = [];
            $descs = [];
            $tieneParValido = false;

            for ($i = 1; $i <= 5; $i++) {
                $fecha = isset($data['fecha' . $i]) ? trim($data['fecha' . $i]) : null;
                $desc = isset($data['desc' . $i]) ? limpiarTexto($data['desc' . $i]) : null;

                $fecha = (strtolower($fecha) === 'null' || $fecha === '') ? null : $fecha;
                $desc = (strtolower($desc) === 'null' || $desc === '') ? null : $desc;

                $fechas[$i] = $fecha;
                $descs[$i] = $desc;

                if (($fecha && !$desc) || (!$fecha && $desc)) {
                    http_response_code(400);
                    echo json_encode(["error" => "Debes ingresar una fecha válida. Revisar el día #{$i}."]);
                    break 2;
                }

                if ($fecha && $desc) {
                    $tieneParValido = true;
                }
            }

            if (!$tieneParValido) {
                http_response_code(400);
                echo json_encode(["error" => "Debe ingresar al menos una fecha con su descripción."]);
                break;
            }

            // Capturar horas
            $horaI1 = $data['horaI1'] ?? null;
            $horaF1 = $data['horaF1'] ?? null;
            $horaI2 = $data['horaI2'] ?? null;
            $horaF2 = $data['horaF2'] ?? null;
            $horaI3 = $data['horaI3'] ?? null;
            $horaF3 = $data['horaF3'] ?? null;
            $horaI4 = $data['horaI4'] ?? null;
            $horaF4 = $data['horaF4'] ?? null;
            $horaI5 = $data['horaI5'] ?? null;
            $horaF5 = $data['horaF5'] ?? null;

            // Asignar descripciones
            $desc1A = $descs[1];
            $desc2A = $descs[2];
            $desc3A = $descs[3];
            $desc4A = $descs[4];
            $desc5A = $descs[5];

            odbc_exec($con, "SET LANGUAGE SPANISH;");

            $sql = "INSERT INTO BoletaEspecial (
                fechaSolicitud,
                correlativo, observaciones1, observaciones2, observaciones3, observaciones4,
                fecha1, horaI1, horaF1, fecha2, horaI2, horaF2, fecha3, horaI3, horaF3, fecha4, horaI4, horaF4, fecha5, horaI5, horaF5,
                desc1A, desc2A, desc3A, desc4A, desc5A,
                totalH, idSolicitante, idCreador, idDepartamento, idJefe, idGerente, idRH, idEstado, fecha_actualizado
            ) VALUES (
                ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
            )";

            $params = [
                $fechaSolicitud,
                $correlativo,
                $observaciones1,
                $observaciones2,
                $observaciones3,
                $observaciones4,
                $fechas[1], $horaI1, $horaF1,
                $fechas[2], $horaI2, $horaF2,
                $fechas[3], $horaI3, $horaF3,
                $fechas[4], $horaI4, $horaF4,
                $fechas[5], $horaI5, $horaF5,
                $desc1A,
                $desc2A,
                $desc3A,
                $desc4A,
                $desc5A,
                $totalH,
                $idSolicitante,
                $idCreador,
                $idDepartamento,
                $idJefe,
                $idGerente,
                $idRH,
                $idEstado,
                null
            ];

            $stmt = odbc_prepare($con, $sql);
            if (!$stmt) {
                http_response_code(500);
                echo json_encode(["error" => "Falló la preparación de la consulta SQL.", "detalle" => odbc_errormsg($con)]);
                break;
            }

            $exec = odbc_execute($stmt, $params);

            if ($exec) {
                http_response_code(201);
                echo json_encode(["success" => "Boleta creada exitosamente."]);
            } else {
                http_response_code(500);
                echo json_encode(["error" => "Error al crear la boleta de vacaciones.", "detalle" => odbc_errormsg($con)]);
            }

            break;

        default:
                header("HTTP/1.1 400 Bad Request");
                echo json_encode(["error" => "Quest POST no encontrado"]);
                break;
            }
            break;
    case 'PUT':
            switch ($quest) {
            case 'putStateTickets':

                $idBoleta = isset($data['idBoleta']) ? intval($data['idBoleta']) : 0;
                $nuevoEstado = isset($data['nuevoEstado']) ? intval($data['nuevoEstado']) : -1;

                if ($idBoleta <= 0 || $nuevoEstado < 0) {
                    http_response_code(400);
                    echo json_encode(["error" => "Datos incompletos o inválidos para actualizar la boleta"]);
                    break;
                }

                // Validar que solo se permita estado 12 o 13
                if (!in_array($nuevoEstado, [12, 13])) {
                    http_response_code(400);
                    echo json_encode([
                        "error" => "Estado no permitido. Solo se aceptan los valores 12 o 13."
                    ]);
                    break;
                }

                // 1. Obtener el estado actual
                $sqlEstado = "SELECT idEstado FROM BoletaReposicion WHERE idBoleta = $idBoleta";
                $resEstado = odbc_exec($con, $sqlEstado);

                if (!$resEstado || !odbc_fetch_row($resEstado)) {
                    http_response_code(404);
                    echo json_encode(["error" => "No se encontró la boleta con ID $idBoleta."]);
                    break;
                }

                $estadoActual = intval(odbc_result($resEstado, 'idEstado'));

                // 2. Verificar si ya tiene el mismo estado
                if ($estadoActual === $nuevoEstado) {
                    http_response_code(409); // Conflicto
                    echo json_encode([
                        "error" => "La boleta ya tiene el estado especificado.",
                        "estadoActual" => $estadoActual
                    ]);
                    break;
                }

                // 3. Actualizar si es diferente
                $sql = "UPDATE BoletaReposicion 
                        SET idEstado = $nuevoEstado, fecha_actualizado = GETDATE() 
                        WHERE idBoleta = $idBoleta";

                $exec = odbc_exec($con, $sql);

                if ($exec) {
                    http_response_code(200);
                    echo json_encode([
                        "success" => true,
                        "message" => "Boleta actualizada correctamente.",
                        "idBoleta" => $idBoleta
                    ]);
                } else {
                    http_response_code(500);
                    echo json_encode(["success" => false, "message" => "Error al ejecutar la actualización."]);
                }

                break;

                case 'putTicketOffRRHH': // ACTUALIZAR BOLETAS DE CONSULTA IGSS HORARIO
                    function convertirHoraADecimal($hora) {
                        if (!$hora || !preg_match('/^\d{1,2}:\d{2}$/', $hora)) return null;
                        list($horas, $minutos) = explode(':', $hora);
                        return floatval($horas) + floatval($minutos) / 60;
                    }

                    $horaF1 = isset($data['horaF1']) && $data['horaF1'] !== '' ? $data['horaF1'] : null;
                    $totalH = isset($data['totalH']) ? floatval($data['totalH']) : 0;
                    $idBoleta = isset($data['idBoleta']) ? intval($data['idBoleta']) : 0;

                    // Convertir hora a decimal si aplica
                    $horaF1Decimal = is_null($horaF1) ? null : round(convertirHoraADecimal($horaF1), 2);

                    if ($idBoleta <= 0) {
                        http_response_code(400);
                        echo json_encode(["success" => false, "message" => "Datos inválidos."]);
                        break;
                    }

                    $sql = "UPDATE BoletaConsultaIGSS 
                            SET horaF1 = ?, totalH = ?, idEstado = 11 
                            WHERE idBoleta = ?";

                    $stmt = odbc_prepare($con, $sql);
                    $params = [$horaF1Decimal, $totalH, $idBoleta];
                    $exec = odbc_execute($stmt, $params);

                    if ($exec) {
                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Boleta actualizada correctamente.",
                            "idBoleta" => $idBoleta
                        ]);
                    } else {
                        http_response_code(500);
                        echo json_encode([
                            "success" => false,
                            "message" => "Error al actualizar la boleta."
                        ]);
                    }

                    break;
                default:
                    header('HTTP/1.1 400 Bad Request');
                    echo json_encode(['error' => 'Quest PUT no encontrado']);
                    break;
            }
            exit;

        default:
        header('HTTP/1.1 405 Method Not Allowed');
        echo json_encode(['error' => 'Método no permitido']);
        break;
        
}

function convertirDecimalAHora($decimal) {
    if ($decimal === null || !is_numeric($decimal)) return null;
    $horas = floor($decimal);
    $minutos = round(($decimal - $horas) * 60);
    return sprintf('%02d:%02d', $horas, $minutos);
}


?>
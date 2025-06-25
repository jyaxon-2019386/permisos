<?php
require_once ('../configs/server.php'); // Incluye las configuraciones del servidor y SWITCH / CASE

switch ($request_method) {
    case 'GET':
        switch ($quest) {
            case 'get-all':
                // Verificar si el usuario está autenticado y obtener su ID
                $id_usuario = isset($_GET['id_usuario']) ? intval($_GET['id_usuario']) : 0; 

                // Asegurarse de que $id_usuario esté definido y sea un entero mayor a 0
                if ($id_usuario <= 0) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Usuario no autenticado o ID de usuario inválido'
                    ]);
                    exit;
                }
                
                // Realizar la consulta
                $sql = "SELECT * FROM proyectos WHERE lider_proyecto = $id_usuario ORDER BY created_at DESC";
                $res = mysqli_query($con, $sql);
                
                // Validación: verificar que la consulta se ejecutó correctamente
                if (!$res) {
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Error al ejecutar la consulta: ' . mysqli_error($con)
                    ]);
                    exit;
                }
                
                // Procesar resultados
                if (mysqli_num_rows($res) > 0) {
                    $proyectos = [];
                    while ($row = mysqli_fetch_assoc($res)) {
                        // Validación adicional: verificar formatos críticos, por ejemplo la fecha de creación
                        if (isset($row['created_at']) && strtotime($row['created_at']) === false) {
                            $row['created_at'] = null;
                        }
                        $proyectos[] = $row;
                    }   
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Proyectos obtenidos correctamente', 'proyectos' => $proyectos]);
                } else {
                    http_response_code(404);
                    // No se encontraron proyectos
                    echo json_encode([
                        'success' => false,
                        'message' => 'El usuario no tiene proyectos creados',
                        'proyectos' => []
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
            case 'new-project':         
                $centro_costos = $data['centro_costos'] ?? '';
                $codigo = $data['codigo'] ?? '';
                $nombre_proyecto = $data['nombre_proyecto'] ?? '';
                $fecha_inicio = $data['fecha_inicio'] ?? '';
                $fecha_fin = $data['fecha_fin'] ?? '';
                $miembros_equipo = $data['miembros_equipo'] ?? '';
                $objetivos = $data['objetivos'] ?? '';
                $metas_indicadores = $data['metas_indicadores'] ?? '';
                $asignacion_recursos = $data['asignacion_recursos'] ?? '';
                $plan_trabajo = $data['plan_trabajo'] ?? '';
                $descripcion_inversion = $data['descripcion_inversion'] ?? '';  
                $monto_inversion = $data['monto_inversion'] ?? '';
                $retorno_inversion = $data['retorno_inversion'] ?? '';  
                $notas_importantes = $data['notas_importantes'] ?? '';
                $conclusion_final = $data['conclusion_final'] ?? '';    
                $evaluacion_exito = $data['evaluacion_exito'] ?? '';
                $evaluacion_no_exito = $data['evaluacion_no_exito'] ?? '';  
                $evaluacion_exito_parcial = $data['evaluacion_exito_parcial'] ?? '';
            
                if (!$data) {
                    http_response_code(400);
                    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
                    exit;
                }
            
                // Validación de campos obligatorios
                $required_fields = [
                    'codigo',
                    'nombre_proyecto',
                    'fecha_inicio',
                    'fecha_fin',
                    'miembros_equipo',
                    'objetivos',
                    'metas_indicadores',
                    'asignacion_recursos',
                    'plan_trabajo',
                    'descripcion_inversion',
                    'monto_inversion',
                    'retorno_inversion',
                    'notas_importantes',
                    'conclusion_final'
                ];
                
                $missing_fields = [];
                foreach ($required_fields as $field) {
                    if (empty($data[$field]) && $data[$field] !== "0") {
                        $missing_fields[] = $field;
                    }
                }
                
                if (!empty($missing_fields)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Faltan los siguientes campos obligatorios: ' . implode(', ', $missing_fields)
                    ]);
                    exit;
                }

                // Validación: la fecha de inicio no puede ser mayor que la fecha fin
                if (strtotime($fecha_inicio) > strtotime($fecha_fin)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'La fecha de inicio no puede ser mayor que la fecha fin'
                    ]);
                    exit;
                }
                
                // Validar formato de fechas (esperado formato YYYY-MM-DD)
                $fecha_inicio_obj = DateTime::createFromFormat('Y-m-d', $fecha_inicio);
                $fecha_fin_obj = DateTime::createFromFormat('Y-m-d', $fecha_fin);
                if (!$fecha_inicio_obj || $fecha_inicio_obj->format('Y-m-d') !== $fecha_inicio) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'El formato de la fecha de inicio es inválido. Use YYYY-MM-DD.'
                    ]);
                    exit;
                }
                if (!$fecha_fin_obj || $fecha_fin_obj->format('Y-m-d') !== $fecha_fin) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'El formato de la fecha fin es inválido. Use YYYY-MM-DD.'
                    ]);
                    exit;
                }

                // Validar campos numéricos
                if (!is_numeric($monto_inversion)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'El monto de inversión debe ser un valor numérico'
                    ]);
                    exit;
                }
                if (!is_numeric($retorno_inversion)) {
                    http_response_code(400);
                    echo json_encode([
                        'success' => false,
                        'message' => 'El retorno de inversión debe ser un valor numérico'
                    ]);
                    exit;
                }
            
                // Sanitización
                $centro_costos = $con->real_escape_string($centro_costos);
                $codigo = $con->real_escape_string($codigo);
                $nombre_proyecto = $con->real_escape_string($nombre_proyecto);
                $fecha_inicio = $con->real_escape_string($fecha_inicio);
                $fecha_fin = $con->real_escape_string($fecha_fin);
                $miembros_equipo = $con->real_escape_string($miembros_equipo);
                $objetivos = $con->real_escape_string($objetivos);
                $metas_indicadores = $con->real_escape_string($metas_indicadores);
                $asignacion_recursos = $con->real_escape_string($asignacion_recursos);
                $plan_trabajo = $con->real_escape_string($plan_trabajo);
                $descripcion_inversion = $con->real_escape_string($descripcion_inversion);
                $monto_inversion = $con->real_escape_string($monto_inversion);
                $retorno_inversion = $con->real_escape_string($retorno_inversion);
                $notas_importantes = $con->real_escape_string($notas_importantes);
                $conclusion_final = $con->real_escape_string($conclusion_final);
                $evaluacion_exito = $con->real_escape_string($evaluacion_exito);
                $evaluacion_no_exito = $con->real_escape_string($evaluacion_no_exito);
                $evaluacion_exito_parcial = $con->real_escape_string($evaluacion_exito_parcial);
            
                // Consulta con id_usuario
                $sql = "INSERT INTO proyectos 
                (centro_costos, codigo, nombre_proyecto, fecha_inicio, fecha_fin, lider_proyecto, miembros_equipo, objetivos, metas_indicadores, asignacion_recursos, plan_trabajo, descripcion_inversion, monto_inversion, retorno_inversion, notas_importantes, conclusion_final, evaluacion_exito, evaluacion_no_exito, evaluacion_exito_parcial)
                VALUES ('$centro_costos', '$codigo', '$nombre_proyecto', '$fecha_inicio', '$fecha_fin', '$id_usuario', '$miembros_equipo', '$objetivos', '$metas_indicadores', '$asignacion_recursos', '$plan_trabajo', '$descripcion_inversion', '$monto_inversion', '$retorno_inversion', '$notas_importantes', '$conclusion_final', '$evaluacion_exito', '$evaluacion_no_exito', '$evaluacion_exito_parcial')";

            
                $res = mysqli_query($con, $sql);
            
                if ($res) {
                    http_response_code(200);
                    echo json_encode(['success' => true, 'message' => 'Proyecto registrado correctamente']);
                    exit;
                } else {
                    http_response_code(500);
                    echo json_encode(['success' => false, 'message' => 'Error al registrar el proyecto: ' . mysqli_error($con)]);
                }
            
                break;
            
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
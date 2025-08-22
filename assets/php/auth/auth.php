<?php
require_once('../configs/server.php'); // Incluye las configuraciones del servidor y SWITCH / CASE

switch ($request_method) {
    case 'GET':
        switch ($quest) {
            case 'login':
                $usuario = isset($_GET['usuario']) ? trim($_GET['usuario']) : '';
                $contrasena = isset($_GET['contrasena']) ? trim($_GET['contrasena']) : '';

                header('Content-Type: application/json; charset=utf-8'); 

                if (!$usuario || !$contrasena) {
                    http_response_code(400); 
                    echo json_encode([
                        'success' => false,
                        'error' => 'No se ingresó el usuario y/o contraseña'
                    ]);
                    break;
                }

                $sql = "SELECT * FROM Usuario WHERE usuario = ?";
                $stmt = odbc_prepare($con, $sql);

                // 👇 Conversión necesaria si el usuario tiene Ñ, etc.
                $isUsuario = mb_convert_encoding($usuario, 'Windows-1252', 'UTF-8');
                $exec = odbc_execute($stmt, [$isUsuario]);

                if ($exec && ($user = odbc_fetch_array($stmt))) {
                    // Convertir todo el array a UTF-8
                    $user = array_map(function($val) {
                        return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                    }, $user);

                    $db_password = $user['contrasena'];

                    if ($contrasena === $db_password) {
                        $_SESSION['idUsuario'] = $user['idUsuario'];
                        $_SESSION['puesto'] = $user['puesto'];
                        $_SESSION['idDepartamentoP'] = $user['idDepartamentoP'];

                        $nombre = $user['nombre'];
                        $puesto = $user['puesto'];
                        $idDepartamentoP = $user['idDepartamentoP'];

                        http_response_code(200);
                        echo json_encode([
                            "success" => true,
                            "message" => "Login exitoso",
                            "greeting" => 'Bienvenido de nuevo, ' . $nombre,
                            "nombre" => $nombre,
                            "usuario" => $usuario,
                            "idUsuario" => $user['idUsuario'],
                            "puesto" => $puesto,
                            "idDepartamentoP" => $idDepartamentoP,
                        ]);
                    } else {
                        http_response_code(401);
                        echo json_encode([
                            "success" => false, 
                            "error" => "Contraseña incorrecta"
                        ]);
                    }
                } else {
                    http_response_code(400);
                    echo json_encode([
                        "success" => false,
                        "error" => "Usuario no encontrado"
                    ]);
                }
                break;
            case 'getUser':
                $idUsuario = isset($_GET['idUsuario']) ? trim($_GET['idUsuario']) : '';
                $sql = "SELECT * FROM Usuario WHERE idUsuario = ?";
                $stmt = odbc_prepare($con, $sql);

                // 👇 Conversión necesaria si el usuario tiene Ñ, etc.
                $exec = odbc_execute($stmt, [$idUsuario]);
                if ($exec && ($idUsuario = odbc_fetch_array($stmt))) {
                    $idUsuario = array_map(function($val) {
                    return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                }, $idUsuario);
                    http_response_code(200);
                    echo json_encode([
                        "success" => true,
                        "message" => "Usuario encontrado",
                        "user" => $idUsuario
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        "success" => false,
                        "error" => "Usuario no encontrado"
                    ]);
                }
                break;

            case 'getUserData':
                $idUsuario = isset($_GET['idUsuario']) ? trim($_GET['idUsuario']) : '';

                if (empty($idUsuario)){
                    http_response_code(400);
                    echo json_encode(["success" => false, "error" => "Usuario obligatorio."]);
                    break;
                }
                
                $sql = "SELECT 
                    u.idUsuario AS idSolicitante, 
                    u.nombre, 
                    u.puesto, 
                    u.vacaciones, 
                    u.contador, 
                    u.inicioLabores, 
                    u.permiso, 
                    e.nombre AS empresa, 
                    d.nivel AS nivel, 
                    u.idDepartamentoP AS idDepartamento 
                FROM Usuario u
                INNER JOIN Empresa e ON u.idEmpresa = e.idEmpresa
                INNER JOIN UsuarioDep d ON u.idDepartamentoP = d.idDepartamento AND u.idUsuario = d.idUsuario 
                WHERE u.idUsuario = ?";
                
                $stmt = odbc_prepare($con, $sql);

                $exec = odbc_execute($stmt, [$idUsuario]);

                if ($exec && ($user = odbc_fetch_array($stmt))) {

                    $user = array_map(function($val) {
                        return !is_null($val) ? mb_convert_encoding($val, 'UTF-8', 'Windows-1252') : null;
                    }, $user);

                    http_response_code(200);
                    echo json_encode([
                        "success" => true,
                        "message" => "Usuario encontrado",
                        "user" => $user
                    ]);
                } else {
                    http_response_code(400);
                    echo json_encode([
                        "success" => false,
                        "error" => "Usuario no encontrado o credenciales incorrectas."
                    ]);
                }
                break;
            default:
            http_response_code(500);
            echo json_encode([
                    "success" => false,
                    "error" => "Quest GET no encontrado"]);
                break;
            }
            break;
    case 'POST':
        switch ($quest) {
            case 'signup':

                $nombre = $data['nombre'] ?? '';
                $usuario = $data['usuario'] ?? '';
                $contrasena = $data['contrasena'] ?? '';

                header('Content-Type: application/json; charset=utf-8'); 


                // Validar campos vacíos
                if (empty($nombre) || empty($usuario) || empty($contrasena)) {
                    http_response_code(400);
                    echo json_encode(['message' => 'Todos los campos son obligatorios']);
                    exit;
                }

                // Limpiar datos
                $nombre = $con->real_escape_string($nombre);
                $usuario = $con->real_escape_string($usuario);
                $contrasena = $con->real_escape_string($contrasena);

                // Generar usuario único
                $usuario_base = preg_replace('/\d+$/', '', $usuario);
                $usuario_nuevo = $usuario;
                $max_intentos = 100;

                for ($i = 1; $i <= $max_intentos; $i++) {
                    $stmt = mysqli_prepare($con, "SELECT COUNT(*) as count FROM usuarios WHERE usuario = ?");
                    mysqli_stmt_bind_param($stmt, "s", $usuario_nuevo);
                    mysqli_stmt_execute($stmt);
                    $rs = mysqli_stmt_get_result($stmt);
                    $row = mysqli_fetch_assoc($rs);

                    if ($row['count'] == 0) break;
                    $usuario_nuevo = $usuario_base . $i;
                }

                if ($i > $max_intentos) {
                    http_response_code(500);
                    echo json_encode(['message' => 'No se pudo generar un usuario único']);
                    exit;
                }

                // Si el usuario fue modificado
                if ($usuario_nuevo !== $usuario) {
                    http_response_code(409); 
                    echo json_encode([
                        "success" => false,
                        "message" => "Usuario no disponible. Te sugerimos: $usuario_nuevo"
                    ]);
                    exit;
                }

                // Insertar usuario (con consulta preparada)
                $hashed_password = password_hash($contrasena, PASSWORD_DEFAULT);
                $stmt = mysqli_prepare($con, "INSERT INTO usuarios(nombre, usuario, contrasena) VALUES (?, ?, ?)");
                mysqli_stmt_bind_param($stmt, "sss", $nombre, $usuario_nuevo, $hashed_password);

                if (mysqli_stmt_execute($stmt)) {
                    $id_generado = mysqli_insert_id($con);
                    http_response_code(200); 
                    echo json_encode([
                        "success" => true,
                        "message" => "Usuario creado exitosamente",
                        "usuario" => $usuario_nuevo
                    ]);
                } else {
                    error_log("Error en registro: " . mysqli_error($con));
                    http_response_code(500);
                    echo json_encode([
                        "success" => false,
                        "message" => "Error al crear el usuario"
                    ]);
                }
            break;
                        
            default:
                http_response_code(500);
                echo json_encode(['error' => 'Quest POST no encontrado']);
                break;
        }
        break;

    case 'PUT':
        switch ($quest) {
            case 'forget-password':
                $data = json_decode(file_get_contents("php://input"), true);

                $usuario = isset($data['usuario']) ? $con->real_escape_string(trim($data['usuario'])) : '';
                $nuevaContrasena = isset($data['nuevaContrasena']) ? trim($data['nuevaContrasena']) : '';
                $confirmarNuevaContrasena = isset($data['confirmarNuevaContrasena']) ? trim($data['confirmarNuevaContrasena']) : '';

                header('Content-Type: application/json; charset=utf-8'); 

                // Validaciones básicas
                if (empty($usuario) || empty($nuevaContrasena) || empty($confirmarNuevaContrasena)) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Todos los campos son obligatorios']);
                    exit;
                }

                if ($nuevaContrasena !== $confirmarNuevaContrasena) {
                    http_response_code(400);
                    echo json_encode(['error' => 'Las contraseñas no coinciden']);
                    exit;
                }

                // Verificar existencia de usuario
                $sql = "SELECT usuario FROM usuarios WHERE usuario = '$usuario'";
                $resultado = $con->query($sql);

                if ($resultado->num_rows === 0) {
                    http_response_code(404); // Not Found
                    echo json_encode(['error' => 'Usuario no registrado']);
                    exit;
                }

                // Actualizar contraseña
                $hashPassword = password_hash($nuevaContrasena, PASSWORD_DEFAULT);
                $hashSeguro = $con->real_escape_string($hashPassword);

                $updateSql = "UPDATE usuarios SET contrasena = '$hashSeguro' WHERE usuario = '$usuario'";

                if ($con->query($updateSql)) {
                    echo json_encode([
                        'success' => true,
                        'message' => 'Contraseña actualizada correctamente'
                    ]);
                } else {
                    http_response_code(500); 
                    echo json_encode([
                        'error' => 'Error al actualizar: ' . $con->error
                    ]);
                } 
                break;
                        
            default:
                header('HTTP/1.1 400 Bad Request');
                echo json_encode(['error' => 'Quest no encontrado']);
                break;
            }
            break;
    default:
        header('HTTP/1.1 405 Method Not Allowed');
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
?>
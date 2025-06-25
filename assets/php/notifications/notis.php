<?php
require_once ('../configs/server.php');

switch($request_method) {
    case 'GET':
        switch ($quest) {
            case 'get-notifications':
                if (isset($_GET['user_id'])) {
                    $user_id = $_GET['user_id'];

                    $sql = "SELECT * FROM notificaciones WHERE user_id = ? AND leido = false ORDER BY fecha_creado DESC";
                    $stmt = mysqli_prepare($con, $sql);

                    mysqli_stmt_bind_param($stmt, 'i', $user_id);

                    if (mysqli_stmt_execute($stmt)) {
                        $result = mysqli_stmt_get_result($stmt);
                        $notifications = mysqli_fetch_all($result, MYSQLI_ASSOC);
                        echo json_encode(['status' => 'success', 'notifications' => $notifications]);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Error al obtener las notificaciones.']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Falta el parámetro user_id.']) 
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
            case 'add-notification':
                if (isset($_POST['user_id']) && isset($_POST['messages'])) {
                    $user_id = $_POST['user_id'];
                    $messages = $_POST['messages'];

                    $sql = "INSERT INTO notificaciones (user_id, messages) VALUES (?, ?)";
                    $stmt = mysqli_prepare($con, $sql);
                    mysqli_stmt_bind_param($stmt, 'is', $user_id, $messages);

                    if (mysqli_stmt_execute($stmt)) {
                        echo json_encode(['status' => 'success', 'message' => 'Notificación agregada correctamente.']);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Error al agregar la notificación.']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Faltan parámetros: user_id o messages.']);
                }
                break;
            case 'read-notification':
                if (isset($_POST['user_id'])) {
                    $user_id = $_POST['user_id'];

                    $sql = "UPDATE notificaciones SET leido = true WHERE user_id = ?";
                    $stmt = mysqli_prepare($con, $sql);
                    mysqli_stmt_bind_param($stmt, 'i', $user_id);

                    if (mysqli_stmt_execute($stmt)) {
                        echo json_encode(['status' => 'success', 'message' => 'Notificaciones marcadas como leídas.']);
                    } else {
                        echo json_encode(['status' => 'error', 'message' => 'Error al marcar como leídas.']);
                    }
                } else {
                    echo json_encode(['status' => 'error', 'message' => 'Falta el parámetro user_id.']);
                }
                break;

            default:
                header("HTTP/1.1 400 Bad Request");
                echo json_encode(["error" => "Quest POST no encontrado"]);
                break;
        }
        break;

    default:
        header("HTTP/1.1 405 Method Not Allowed");
        echo json_encode(["error" => "Método no permitido"]);
        break;
}
?>

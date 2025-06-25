<?php

require_once('../configs/server.php'); // Incluye las configuraciones del servidor y SWITCH / CASE

  session_start();
  // Destruye la sesión actual
  session_destroy();
  // Redirige al usuario al login
  header("Location: http://localhost/gestor-proyectos/pages/authentication/signin/login.html");
  exit;
?>       
<?php
// Failas: api/check_auth.php
session_start();
header('Content-Type: application/json');

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    // Vartotojas prisijungęs. Grąžiname rolę.
    echo json_encode([
        'logged_in' => true, 
        'role' => $_SESSION['user_role'] ?? 'user',
        'user_id' => $_SESSION['user_id']
    ]);
} else {
    // Vartotojas neprisijungęs.
    echo json_encode(['logged_in' => false]);
}
?>
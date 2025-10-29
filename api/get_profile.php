<?php
// Failas: api/get_profile.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// Patikrinimas, ar vartotojas prisijungęs ir yra augintojas
if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'grower') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // Gauname profilį pagal prisijungusio vartotojo ID
    $stmt = $pdo->prepare("SELECT farm_name, description, address, phone, logo_url, latitude, longitude 
                           FROM augaluprofiliai 
                           WHERE user_id = ?");
    $stmt->execute([$userId]);
    $profile = $stmt->fetch();

    if ($profile) {
        http_response_code(200);
        echo json_encode($profile);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Profilis nerastas.']);
    }

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
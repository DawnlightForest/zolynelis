<?php
// Failas: api/get_products.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// Patikrinimas, ar vartotojas prisijungęs ir yra augintojas
if (!lisset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'grower') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}

$userId = $_SESSION['user_id'];

try {
    // 1. Surandame augintojo profilį pagal vartotojo ID
    $stmt_profile = $pdo->prepare("SELECT id FROM augaluprofiliai WHERE user_id = ?");
    $stmt_profile->execute([$userId]);
    $profile = $stmt_profile->fetch();

    if (!$profile) {
        http_response_code(404);
        echo json_encode(['error' => 'Augintojo profilis nerastas.']);
        exit;
    }

    $growerProfileId = $profile['id'];

    // 2. Gauname visus produktus, priklausančiuus šiam profiliui
    $stmt_products = $pdo->prepare("SELECT id, name, description, status FROM produktai WHERE grower_profile_id =?");
    $stmt_products->execute([$growerProfileId]);
    $products = $stmt_products->fetchAll();

    http_response_code(200);
    echo json_encode($products); // Grąžiname produktų sąrašą

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
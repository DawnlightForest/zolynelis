<?php
// Failas: api/add_product.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// Patikrinimas, ar vartotojas prisijungęs ir yra augintojas
if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'grower') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik POST metodas.']);
    exit;
}

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$status = $data['status'] ?? 'available'; // Numatome 'available'

// Validacija
if (empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Produkto pavadinimas yra privalomas.']);
    exit;
}

try {
    // 1. Reikia gauti augintojo profilio ID (grower_profile_id)
    $stmt_profile = $pdo->prepare("SELECT id FROM augaluprofiliai WHERE user_id = ?");
    $stmt_profile->execute([$userId]);
    $profile = $stmt_profile->fetch();

    if (!$profile) {
        http_response_code(404);
        echo json_encode(['error' => 'Augintojo profilis nerastas.']);
        exit;
    }
    $growerProfileId = $profile['id'];

    // 2. Įrašome naują produktą
    $stmt = $pdo->prepare(
        "INSERT INTO produktai (grower_profile_id, name, description, status) 
         VALUES (?, ?, ?, ?)"
    );
    $stmt->execute([$growerProfileId, $name, $description, $status]);

    http_response_code(201); // Created
    echo json_encode(['success' => true, 'message' => 'Produktas sėkmingai pridėtas.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida pridedant produktą: ' . $e->getMessage()]);
}
?>
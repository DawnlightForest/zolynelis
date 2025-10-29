<?php
// Failas: api/update_profile.php
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

// Gauname duomenis (pridedame naują koordinačių lauką)
$farmName = $data['farm_name'] ?? '';
$description = $data['description'] ?? '';
$address = $data['address'] ?? '';
$phone = $data['phone'] ?? '';
$latitude = $data['latitude'] ?? null;
$longitude = $data['longitude'] ?? null;
// Galima pridėti ir kitus laukus...

// Pagrindinė validacija
if (empty($farmName)) {
    http_response_code(400);
    echo json_encode(['error' => 'Ūkio pavadinimas yra privalomas.']);
    exit;
}

try {
    // Atnaujiname augintojo profilį DB
    $stmt = $pdo->prepare("UPDATE augaluprofiliai SET 
                            farm_name = :farm_name,
                            description = :description,
                            address = :address,
                            phone = :phone,
                            latitude = :latitude,
                            longitude = :longitude
                          WHERE user_id = :user_id");
                          
    $stmt->execute([
        'farm_name' => $farmName,
        'description' => $description,
        'address' => $address,
        'phone' => $phone,
        'latitude' => $latitude,
        'longitude' => $longitude,
        'user_id' => $userId
    ]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Profilis sėkmingai atnaujintas.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida atnaujinant profilį: ' . $e->getMessage()]);
}
?>
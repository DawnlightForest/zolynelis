<?php
// Failas: api/get_grower_details.php
require_once '../db_config.php';
header('Content-Type: application/json');

// Tai viešas API, sesijos tikrinti nereikia
$profileId = $_GET['id'] ?? null;

if (empty($profileId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta augintojo profilio ID.']);
    exit;
}

try {
    // 1. Gauname pagrindinę profilio informaciją (tik jei patvirtintas)
    $stmt_profile = $pdo->prepare(
        "SELECT farm_name, description, address, phone, logo_url, latitude, longitude 
         FROM augaluprofiliai 
         WHERE id = ? AND is_approved = 1"
    );
    $stmt_profile->execute([$profileId]);
    $profile = $stmt_profile->fetch();

    if (!$profile) {
        http_response_code(404);
        echo json_encode(['error' => 'Augintojo profilis nerastas arba nėra patvirtintas.']);
        exit;
    }

    // 2. Gauname visus šio augintojo produktus (kurie yra matomi)
    $stmt_products = $pdo->prepare(
        "SELECT name, description, status 
         FROM produktai 
         WHERE grower_profile_id = ? AND status != 'out_of_stock'" // Nerodome išparduotų
    );
    $stmt_products->execute([$profileId]);
    $products = $stmt_products->fetchAll();

    // 3. Sujungiame viską į vieną atsakymą
    $response_data = [
        'profile' => $profile,
        'products' => $products
    ];

    http_response_code(200);
    echo json_encode($response_data);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
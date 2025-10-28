<?php
// 1. Prisijungimo prie duomenų bazės
require_once '../db_config.php';

// Nurodome, kad grąžinsime JSON formatą
header('content-Type: application/json');

// 2. Gauname augalo ID iš url
$plant_id = $_GET['id'] ?? null;

if (!$plant_id) {
    http_response_code(400); // Blogas užklausos kodas
    echo json_encode(['error' => 'Trūksta augalo ID']);
    exit;
}

try {
    // 3. Paruošiame SQL užklausą
    $sql = "SELECT * FROM augalai WHERE id = :id";

    // 4. Paruošiame užklausą
    $stmt = $pdo->prepare($sql);

    // 5. Vykdome užklausą su augalo ID
    $stmt->execute(['id' => $plant_id]);

    // 6. Gauname rezultatą
    $plant = $stmt->fetch();

    if ($plant) {
        echo json_encode($plant);
    } else {
        http_response_code(404); // Nerasta
        echo json_encode(['error' => 'Augalas nerastas']);
    }
    
} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}

?>

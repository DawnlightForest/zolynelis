<?php
// Failas: zolynelis/api/get_growers.php
require_once '../db_config.php';

header('Content-Type: application/json');

try {
    // Paruošiame SQL užklausą
    $sql = "SELECT id, farm_name, description, latitude, longitude, logo_url
            FROM augaluprofiliai
            WHERE is_approved = 1";
    
    $stmt = $pdo->query($sql);
    $growers = $stmt->fetchAll();

    echo json_encode($growers);

} catch (\PDOExcepion $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida gaunant augintojus: ' . $e->getMessage()]);
}
?>
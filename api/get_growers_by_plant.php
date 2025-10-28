<?php
// Failas: api/get_growers_by_plant.php
require_once '../db_config.php';

header('Content-Type: application/json');

// Gauname augalo ID iš URL
$plant_id = $_GET['plant_id'] ?? null;

if (!$plant_id || !is_numeric($plant_id)) {
    http_response_code(400); 
    echo json_encode(['error' => 'Neteisingas arba trūkstamas augalo ID parametras.']);
    exit;
}

try {
    // Sudėtinė užklausa su JOIN: Augalų profiliai -> Produktai -> Ryšio lentelė
    $sql = " 
        SELECT DISTINCT
            p. id,
            p.farm_name,
            p.latitude,
            p.longitude,
            p.description
        FROM 
            augaluprofiliai p
        JOIN
            produktai pr ON p.id = pr.grower_profile_id
        JOIN
            rysio_lentele r ON pr.id = r.product_id
        WHERE 
            r.plant_id = :plant_id
        AND
            p.is_approved = 1;
    ";
    // Paruošiame užklausą
    $stmt = $pdo->prepare($sql);
    $stmt->execute(['plant_id' => $plant_id]);

    $growers = $stmt->fetchAll();

    echo json_encode($growers);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida filtruojant augintojus: ' . $e->getMessage()]);
}
?>

    
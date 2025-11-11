<?php
// Failas: api/search_plants.php
require_once '../db_config.php';
header('Content-Type: application/json');

// 1. Gauname paieškos terminą iš URL (pvz., ?term=ramun)
$term = $_GET['term'] ?? '';

try {
    // 2. Paruošiame SQL užklausą su LIKE
    // % simboliai reiškia, kad ieškome bet kokio teksto prieš ar po termino
    $sql = "SELECT id, name_lt, name_latin, main_image_url 
            FROM augalai 
            WHERE name_lt LIKE ? OR name_latin LIKE ?";
            
    $stmt = $pdo->prepare($sql);
    
    // 3. Vykdome užklausą, pridedant % prie termino
    $stmt->execute(['%' . $term . '%', '%' . $term . '%']);
    
    $plants = $stmt->fetchAll();
    
    echo json_encode($plants);

} catch (\PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
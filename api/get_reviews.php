<?php
// Failas: api/get_reviews.php
require_once '../db_config.php';
header('Content-Type: application/json');

// Gauname augintojo ID iš URL
$grower_profile_id = $_GET['grower_profile_id'] ?? null;

if (empty($grower_profile_id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta augintojo ID.']);
    exit;
}

try {
    // Gauname visus atsiliepimus konkrečiam augintojui, naujausi viršuje
    $sql = "SELECT id, rating, comment, reviewer_name, created_at 
            FROM reviews 
            WHERE grower_profile_id = ? 
            ORDER BY created_at DESC";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$grower_profile_id]);
    
    $reviews = $stmt->fetchAll();

    echo json_encode($reviews); // Grąžiname sąrašą (gali būti tuščias [])

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
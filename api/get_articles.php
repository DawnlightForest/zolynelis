<?php
// Failas: api/get_articles.php
require_once '../db_config.php';
header('Content-Type: application/json');

try {
    // Gauname visus straipsnius, naujausi viršuje
    $stmt = $pdo->query("SELECT id, title, content, image_url, created_at FROM articles ORDER BY created_at DESC");
    $articles = $stmt->fetchAll();

    echo json_encode($articles);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
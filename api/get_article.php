<?php
// Failas: api/get_article.php
require_once '../db_config.php';
header('Content-Type: application/json');

$id = $_GET['id'] ?? null;

if (empty($id)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta ID.']);
    exit;
}

try {
    $stmt = $pdo->prepare("SELECT * FROM articles WHERE id = ?");
    $stmt->execute([$id]);
    $article = $stmt->fetch();

    if ($article) {
        echo json_encode($article);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'Straipsnis nerastas.']);
    }
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Klaida: ' . $e->getMessage()]);
}
?>
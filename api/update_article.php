<?php
// Failas: api/update_article.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;
$title = $data['title'] ?? '';
$content = $data['content'] ?? '';
$image_url = $data['image_url'] ?? '';

if (empty($id) || empty($title)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta duomenų.']);
    exit;
}

try {
    $sql = "UPDATE articles SET title = ?, content = ?, image_url = ? WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$title, $content, $image_url, $id]);

    echo json_encode(['success' => true, 'message' => 'Straipsnis atnaujintas.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Klaida: ' . $e->getMessage()]);
}
?>
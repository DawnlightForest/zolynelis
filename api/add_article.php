<?php
// Failas: api/add_article.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// Tik administratorius gali rašyti
if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$title = $data['title'] ?? '';
$content = $data['content'] ?? '';
$image_url = $data['image_url'] ?? '';

if (empty($title) || empty($content)) {
    http_response_code(400);
    echo json_encode(['error' => 'Pavadinimas ir turinys yra privalomi.']);
    exit;
}

try {
    $sql = "INSERT INTO articles (title, content, image_url) VALUES (?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$title, $content, $image_url]);

    http_response_code(201);
    echo json_encode(['success' => true, 'message' => 'Straipsnis sėkmingai sukurtas.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
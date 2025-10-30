<?php
// Failas: api/update_plant.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$id = $data['id'] ?? null;
// ... renkame visus kitus laukus ...
$name_lt = $data['name_lt'] ?? '';
$name_latin = $data['name_latin'] ?? '';
$description = $data['description'] ?? '';
$properties = $data['properties'] ?? '';
$preparation_methods = $data['preparation_methods'] ?? '';
$warnings = $data['warnings'] ?? '';
$main_image_url = $data['main_image_url'] ?? '';

if (empty($id) || empty($name_lt) || empty($name_latin)) {
    http_response_code(400);
    echo json_encode(['error' => 'ID, Lietuviškas ir lotyniškas pavadinimai yra privalomi.']);
    exit;
}

try {
    $sql = "UPDATE augalai SET 
                name_lt = ?, 
                name_latin = ?, 
                description = ?, 
                properties = ?, 
                preparation_methods = ?, 
                warnings = ?, 
                main_image_url = ?
            WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name_lt, $name_latin, $description, $properties, $preparation_methods, $warnings, $main_image_url, $id]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Augalas sėkmingai atnaujintas.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
<?php
// Failas: api/delete_plant.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'admin') {
    http_response_code(403);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    exit;
}

$plantId = $_GET['id'] ?? null;

if (empty($plantId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta augalo ID.']);
    exit;
}

try {
    // DĖMESIO: Tai neištrins sąsajų iš 'rysio_lentele'.
    // Norint ištrinti, reikėtų sudėtingesnės logikos su transakcija,
    // panašiai kaip trynėme produktus.
    // Bet kol kas paliekame paprastą trynimą:
    
    // 1. Ištriname sąsajas
    $stmt_links = $pdo->prepare("DELETE FROM rysio_lentele WHERE plant_id = ?");
    $stmt_links->execute([$plantId]);
    
    // 2. Ištriname augalą
    $stmt = $pdo->prepare("DELETE FROM augalai WHERE id = ?");
    $stmt->execute([$plantId]);
    
    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Augalas ir jo sąsajos ištrintos.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
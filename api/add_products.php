<?php
// Failas: api/update_product.php
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'grower') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik POST metodas.']);
    exit;
}

$userId = $_SESSION['user_id'];
$data = json_decode(file_get_contents('php://input'), true);

$productId = $data['id'] ?? null;
$name = $data['name'] ?? '';
$description = $data['description'] ?? '';
$status = $data['status'] ?? 'available';

if (empty($productId) || empty($name)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta produkto ID arba pavadinimo.']);
    exit;
}

try {
    // Patikriname, ar augintojas tikrai valdo šį produktą
    $stmt_profile = $pdo->prepare("SELECT id FROM augaluprofiliai WHERE user_id = ?");
    $stmt_profile->execute([$userId]);
    $profile = $stmt_profile->fetch();
    $growerProfileId = $profile['id'];

    $stmt = $pdo->prepare(
        "UPDATE produktai SET name = ?, description = ?, status = ? 
         WHERE id = ? AND grower_profile_id = ?"
    );
    $stmt->execute([$name, $description, $status, $productId, $growerProfileId]);

    http_response_code(200);
    echo json_encode(['success' => true, 'message' => 'Produktas sėkmingai atnaujintas.']);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
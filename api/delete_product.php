<?php
// Failas: api/delete_product.php (PATAISYTA VERSIJA)
require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'grower') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik DELETE metodas.']);
    exit;
}

$userId = $_SESSION['user_id'];
$productId = $_GET['id'] ?? null;

if (empty($productId)) {
    http_response_code(400);
    echo json_encode(['error' => 'Trūksta produkto ID.']);
    exit;
}

try {
    $stmt_profile = $pdo->prepare("SELECT id FROM augaluprofiliai WHERE user_id = ?");
    $stmt_profile->execute([$userId]);
    $profile = $stmt_profile->fetch();
    $growerProfileId = $profile['id'];

    // Pradedame transakciją
    $pdo->beginTransaction();

    // 1. IŠTRINAME VAIKINIUS ĮRAŠUS (iš rysio_lentele)
    // Tai išsprendžia "foreign key constraint" klaidą
    $stmt_links = $pdo->prepare("DELETE FROM rysio_lentele WHERE product_id = ?");
    $stmt_links->execute([$productId]);
    
    // 2. TADA IŠTRINAME TĖVINĮ ĮRAŠĄ (iš produktai)
    $stmt_product = $pdo->prepare("DELETE FROM produktai WHERE id = ? AND grower_profile_id = ?");
    $stmt_product->execute([$productId, $growerProfileId]);

    if ($stmt_product->rowCount() > 0) {
        $pdo->commit();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Produktas ir jo sąsajos ištrintos.']);
    } else {
        $pdo->rollBack();
        http_response_code(404);
        echo json_encode(['error' => 'Produktas nerastas arba neturite teisės jo trinti.']);
    }

} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
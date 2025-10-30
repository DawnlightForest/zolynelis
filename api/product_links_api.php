<?php
// Failas: api/product_links_api.php (ŠVARI VERSIJA)

// Įjungiame klaidų rodymą
ini_set('display_errors', 1);
error_reporting(E_ALL);

require_once '../db_config.php';
session_start();
header('Content-Type: application/json');

// Patikriname teises
if (!isset($_SESSION['logged_in']) || $_SESSION['user_role'] !== 'grower') {
    http_response_code(403);
    echo json_encode(['error' => 'Prieiga uždrausta.']);
    exit;
}
$userId = $_SESSION['user_id'];

// Funkcija patikrinti, ar produktas priklauso augintojui
function checkProductOwnership($pdo, $productId, $userId) {
    $stmt_profile = $pdo->prepare("SELECT id FROM augaluprofiliai WHERE user_id = ?");
    $stmt_profile->execute([$userId]);
    $profile = $stmt_profile->fetch();
    if (!$profile) return false;
    $growerProfileId = $profile['id'];

    $stmt_product = $pdo->prepare("SELECT id FROM produktai WHERE id = ? AND grower_profile_id = ?");
    $stmt_product->execute([$productId, $growerProfileId]);
    return $stmt_product->fetch() !== false;
}

// ==========================================================
// Skirtinga logika pagal HTTP metodą (GET arba POST)
// ==========================================================

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // === VEIKSMAS: GAUTI ESAMAS SĄSAJAS ===
    
    $productId = $_GET['product_id'] ?? null;
    if (empty($productId)) {
        http_response_code(400);
        echo json_encode(['error' => 'Trūksta produkto ID.']);
        exit;
    }

    try {
        // Gauname visus plant_id, susietus su šiuo product_id
        $stmt = $pdo->prepare("SELECT plant_id FROM rysio_lentele WHERE product_id = ?");
        $stmt->execute([$productId]);
        // Grąžina tik ID sąrašą, pvz., [1, 5, 12] arba tuščią []
        $links = $stmt->fetchAll(PDO::FETCH_COLUMN); 

        echo json_encode($links); 

    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
    }

} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // === VEIKSMAS: ATNAUJINTI SĄSAJAS ===

    $data = json_decode(file_get_contents('php://input'), true);
    $productId = $data['product_id'] ?? null;
    $plantIds = $data['plant_ids'] ?? []; // Tikimės gauti masyvą ID, pvz., [1, 5]

    if (empty($productId) || !checkProductOwnership($pdo, $productId, $userId)) {
        http_response_code(403);
        echo json_encode(['error' => 'Neturite teisės redaguoti šio produkto sąsajų.']);
        exit;
    }

    try {
        $pdo->beginTransaction();

        // 1. Ištriname visas senas sąsajas šiam produktui
        $stmt_delete = $pdo->prepare("DELETE FROM rysio_lentele WHERE product_id = ?");
        $stmt_delete->execute([$productId]);

        // 2. Įrašome naujas sąsajas (jei jų yra)
        if (!empty($plantIds)) {
            $stmt_insert = $pdo->prepare("INSERT INTO rysio_lentele (product_id, plant_id) VALUES (?, ?)");
            foreach ($plantIds as $plantId) {
                $stmt_insert->execute([$productId, $plantId]);
            }
        }

        $pdo->commit();
        http_response_code(200);
        echo json_encode(['success' => true, 'message' => 'Produkto sąsajos sėkmingai atnaujintos.']);

    } catch (PDOException $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['error' => 'Serverio klaida atnaujinant sąsajas: ' . $e->getMessage()]);
    }
} else {
    // Jei metodas nei GET, nei POST
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik GET ir POST metodas.']);
}
?>
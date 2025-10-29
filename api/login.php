<?php
// Failas: api/login.php
require_once '../db_config.php';
header('Content-Type: application/json');

// Pradedame sesiją
session_start();

// Leidžiame tik POST metodą
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Leidžiamas tik POST metodas.']);
    exit;
}

// Gauname duomenis
$data = json_decode(file_get_contents('php://input'), true);

$email = $data['email'] ?? '';
$password = $data['password'] ?? '';

// 1. Validacija
if (empty($email) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Įveskite el. paštą ir slaptažodį.']);
    exit;
}

try {
    // 2. Ieškome vartotojo pagal el. paštą ir gauname hash'ą
    $stmt = $pdo->prepare("SELECT id, password_hash, role FROM vartotojai WHERE email = ?");
    $stmt->execute([$email]);
    $user = $stmt->fetch();

    if (!$user) {
        // Vartotojas nerastas
        http_response_code(401); // Unauthorized
        echo json_encode(['error' => 'Neteisingas el. paštas arba slaptažodis.']);
        exit;
    }
    
    // 3. Patikriname slaptažodį
    if (!password_verify($password, $user['password_hash'])) {
        // Slaptažodis neteisingas
        http_response_code(401);
        echo json_encode(['error' => 'Neteisingas el. paštas arba slaptažodis.']);
        exit;
    }

    // 4. Patikriname, ar augintojas patvirtintas
    if ($user['role'] === 'grower') {
        $stmt_profile = $pdo->prepare("SELECT is_approved FROM augaluprofiliai WHERE user_id = ?");
        $stmt_profile->execute([$user['id']]);
        $profile = $stmt_profile->fetch();
        
        if ($profile && $profile['is_approved'] == 0) {
            http_response_code(403); // Forbidden
            echo json_encode(['error' => 'Jūsų paskyra dar nėra patvirtinta administratoriaus.']);
            exit;
        }
    }
    
    // 5. SĖKMĖ: Nustatome sesijos kintamuosius
    $_SESSION['user_id'] = $user['id'];
    $_SESSION['user_role'] = $user['role'];
    $_SESSION['logged_in'] = true;

    // Grąžiname sėkmės atsakymą
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Prisijungimas sėkmingas.',
        'role' => $user['role']
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Serverio klaida: ' . $e->getMessage()]);
}
?>
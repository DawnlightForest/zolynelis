<?php 
// Failas: zolynelis/api/get_plants.php

// 1. Prisijungimo prie duomenų bazės
// (kelias '../' reiškia, kad einame vienu lygiu aukščiau į katalogą)
require_once '../db_config.php';

// 2. Nurodome, kad grąžinsime JSON formatą
// Tai yra svarbu, heterogeninei sisemai!
header('Content-Type: application/json');

// 3. Vykdome užklausą saugiame 'try-catch' bloke
try {

    // 4. Paruošiame SQL užklausą
    // Renkamės tik tuos stulpelius, kurie reikalingi
    $sql = "SELECT id , name_lt, name_latin, main_image_url FROM augalai";
    $stmt = $pdo->query($sql);

    // 5. Gauname visus rezultatus kaip masyvą
    $plants = $stmt->fetchAll();

    // 6. Konvertuojame PHP masyvą į JSON tekstą ir jį atspausdiname
    echo json_encode($plants);
} catch (\PDOException $e) {
    // 7. Klaidos atveju - parodome klaidą JSON formatu
    http_response_code(500); // Nustatome HTTP klaidos kodą
    echo json_encode(['error' => 'Įvyko serverio klaida: ' . $e->getMessage()]);
}

?>
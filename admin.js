// Failas: admin.js (PILNA VERSIJA SU AUGALŲ VALDYMU)

document.addEventListener('DOMContentLoaded', () => {
    const pendingGrowersContainer = document.getElementById('pending-growers-container');
    const plantsAdminContainer = document.getElementById('plants-admin-container');
    const logoutLink = document.getElementById('admin-logout-link');

    // 1. Patikriname, ar vartotojas tikrai yra administratorius
    fetch('api/check_auth.php')
        .then(response => response.json())
        .then(auth => {
            if (!auth.logged_in || auth.role !== 'admin') {
                window.location.href = 'login.html';
                return;
            }
            // Jei administratorius, krauname abu sąrašus
            loadPendingGrowers();
            loadPlantsAdminList(); // <-- NAUJAS IŠKVIETIMAS
        })
        .catch(() => {
            window.location.href = 'login.html';
        });

    // 2. Atsijungimo funkcija
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetch('api/logout.php').then(() => {
            window.location.href = 'login.html';
        });
    });

    // 3. Funkcija gauti ir atvaizduoti laukiančius augintojus
    function loadPendingGrowers() {
        pendingGrowersContainer.innerHTML = '<p>Kraunamas sąrašas...</p>';
        
        fetch('api/get_pending_growers.php')
            .then(response => response.json())
            .then(growers => {
                if (growers.error) {
                    pendingGrowersContainer.innerHTML = `<p class="error">${growers.error}</p>`;
                    return;
                }
                
                let html = `... (visas jūsų stalo kodas augintojams lieka čia) ...`;
                // ... (Palieku šią dalį, nes ji jau veikia pas jus) ...
                
                // --- Tikslumo dėlei, įklijuoju veikiantį kodą ---
                html = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Ūkio pavadinimas</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">El. paštas</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Užsiregistravo</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Veiksmas</th>
                            </tr>
                        </thead>
                        <tbody>
                `;

                if (growers.length === 0) {
                    html += '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center;">Naujų augintojų, laukiančių patvirtinimo, nėra.</td></tr>';
                } else {
                    growers.forEach(grower => {
                        html += `
                            <tr id="grower-row-${grower.id}">
                                <td style="padding: 8px; border: 1px solid #ddd;">${grower.farm_name}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${grower.email}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${grower.created_at}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">
                                    <button onclick="window.approveGrower(${grower.id})">Patvirtinti</button>
                                </td>
                            </tr>
                        `;
                    });
                }
                html += '</tbody></table>';
                pendingGrowersContainer.innerHTML = html;
                // --- Kodo pabaiga ---
            })
            .catch(error => {
                pendingGrowersContainer.innerHTML = `<p class="error">Klaida gaunant duomenis.</p>`;
            });
    }

    // ================================================
    // === NAUJOS FUNKCIJOS AUGALŲ VALDYMUI ===
    // ================================================

    // 4. Funkcija įkelti augalų sąrašą
    function loadPlantsAdminList() {
        plantsAdminContainer.innerHTML = '<p>Kraunamas augalų sąrašas...</p>';
        
        // Naudojame tą patį viešą API, kurį jau turime
        fetch('api/get_plants.php') 
            .then(response => response.json())
            .then(plants => {
                let html = `
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr style="background-color: #f2f2f2;">
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">ID</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Lietuviškas pavadinimas</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Lotyniškas pavadinimas</th>
                                <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Veiksmai</th>
                            </tr>
                        </thead>
                        <tbody>
                `;
                
                if (plants.length === 0) {
                    html += '<tr><td colspan="4" style="padding: 8px; border: 1px solid #ddd; text-align: center;">Enciklopedijoje nėra augalų.</td></tr>';
                } else {
                    plants.forEach(plant => {
                        html += `
                            <tr id="plant-row-${plant.id}">
                                <td style="padding: 8px; border: 1px solid #ddd;">${plant.id}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${plant.name_lt}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">${plant.name_latin}</td>
                                <td style="padding: 8px; border: 1px solid #ddd;">
                                    <button onclick="window.showPlantForm(${plant.id})">Redaguoti</button>
                                    <button onclick="window.deletePlant(${plant.id})" style="background-color: #dc3545;">Trinti</button>
                                </td>
                            </tr>
                        `;
                    });
                }
                html += '</tbody></table>';
                html += '<button id="add-new-plant-btn" style="margin-top: 20px;">+ Pridėti naują augalą</button>';
                html += '<div id="plant-form-container" style="display: none; margin-top: 20px; padding: 20px; border: 1px solid #ccc; background: #f9f9f9;"></div>';
                
                plantsAdminContainer.innerHTML = html;

                document.getElementById('add-new-plant-btn').addEventListener('click', () => {
                    window.showPlantForm(null); // Kviesime formą naujam augalui
                });
            })
            .catch(error => {
                plantsAdminContainer.innerHTML = `<p class="error">Klaida gaunant augalų sąrašą.</p>`;
            });
    }
});

// 5. Funkcija patvirtinti augintoją (padarome ją globalią, kad HTML mygtukai ją matytų)
window.approveGrower = async function(profileId) {
    if (!confirm(`Ar tikrai norite patvirtinti augintoją (Profilio ID: ${profileId})?`)) {
        return;
    }
    try {
        const response = await fetch('api/approve_grower.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ profile_id: profileId })
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            const row = document.getElementById(`grower-row-${profileId}`);
            if (row) row.remove();
        } else {
            alert(`Klaida: ${result.error}`);
        }
    } catch (error) {
        alert('Tinklo klaida. Nepavyko patvirtinti.');
    }
}

// ================================================
// === NAUJOS GLOBALIOS FUNKCIJOS AUGALŲ VALDYMUI ===
// ================================================

// 6. Funkcija parodyti augalo formą (naujam arba redagavimui)
window.showPlantForm = async function(plantId) {
    const container = document.getElementById('plant-form-container');
    container.style.display = 'block';
    let plant = {}; 

    if (plantId) {
        // ... (kodas augalo duomenims gauti lieka toks pats) ...
        container.innerHTML = "<p>Kraunami augalo duomenys...</p>";
        try {
            const response = await fetch(`api/get_plant_details.php?id=${plantId}`);
            plant = await response.json();
            if (plant.error) {
                container.innerHTML = `<p class="error">${plant.error}</p>`;
                return;
            }
        } catch (e) {
            container.innerHTML = `<p class="error">Klaida gaunant augalo duomenis.</p>`;
            return;
        }
    }
    
    // Sukuriame formos HTML (PAKEISTAS NUOTRAUKOS BLOKAS)
    container.innerHTML = `
        <h4>${plantId ? 'Redaguoti augalą' : 'Pridėti naują augalą'}</h4>
        <form id="plant-form">
            <input type="hidden" id="plant_id" value="${plant.id || ''}">
            
            <div class="form-group">
                <label for="plant_name_lt">Lietuviškas pavadinimas:</label>
                <input type="text" id="plant_name_lt" value="${plant.name_lt || ''}" required>
            </div>
            <div class="form-group">
                <label for="plant_name_latin">Lotyniškas pavadinimas:</label>
                <input type="text" id="plant_name_latin" value="${plant.name_latin || ''}" required>
            </div>
            <div class="form-group">
                <label for="plant_description">Aprašymas:</label>
                <textarea id="plant_description">${plant.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="plant_properties">Savybės:</label>
                <textarea id="plant_properties">${plant.properties || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="plant_preparation">Paruošimo būdai:</label>
                <textarea id="plant_preparation">${plant.preparation_methods || ''}</textarea>
            </div>
            <div class="form-group">
                <label for="plant_warnings">Įspėjimai:</label>
                <textarea id="plant_warnings">${plant.warnings || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="plant_image_file">Įkelti naują nuotrauką:</label>
                <input type="file" id="plant_image_file" accept="image/png, image/jpeg, image/gif">
                <small>Pasirinkite naują failą, jei norite pakeisti esamą.</small>
                
                <input type="hidden" id="plant_image_url_hidden" value="${plant.main_image_url || ''}">

                ${plant.main_image_url ? 
                  `<div style="margin-top:10px;">
                       <label>Esama nuotrauka:</label><br>
                       <img src="${plant.main_image_url}" alt="${plant.name_lt}" style="max-width: 200px; height: auto; border: 1px solid #ddd; margin-top: 5px;">
                   </div>` 
                  : '<p style="margin-top:10px;">Nuotrauka neįkelta.</p>'}
                </div>
            
            <button type="submit">${plantId ? 'Atnaujinti' : 'Pridėti'}</button>
            <button type="button" id="cancel-plant-form" style="background-color: #aaa; margin-left: 10px;">Atšaukti</button>
        </form>
        <p id="plant-form-message" style="margin-top: 10px; font-weight: bold;"></p>
    `;

    document.getElementById('plant-form').addEventListener('submit', window.handlePlantFormSubmit);
    document.getElementById('cancel-plant-form').addEventListener('click', () => {
        container.style.display = 'none';
    });
}

// 7. Funkcija išsaugoti augalo formos duomenis
window.handlePlantFormSubmit = async function(e) {
    e.preventDefault();
    const message = document.getElementById('plant-form-message');
    message.textContent = 'Išsaugoma...';

    const plantId = document.getElementById('plant_id').value;
    const isEditing = plantId !== '';
    const fileInput = document.getElementById('plant_image_file');
    const oldImageUrl = document.getElementById('plant_image_url_hidden').value;

    let imageUrl = oldImageUrl; // Pagal nutylėjimą paliekame seną

    try {
        // === 1 ŽINGSNIS: NUOTRAUKOS ĮKĖLIMAS (JEI PASIRINKTA NAUJA) ===
        if (fileInput.files.length > 0) {
            message.textContent = 'Kraunama nuotrauka...';
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('imageFile', file); // 'imageFile' turi atitikti PHP $_FILES raktą

            const uploadResponse = await fetch('api/upload_image.php', {
                method: 'POST',
                body: formData 
                // JOKIŲ 'Content-Type' antraščių - naršyklė nustatys automatiškai
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadResult.error || 'Nežinoma nuotraukos įkėlimo klaida.');
            }
            
            imageUrl = uploadResult.filePath; // Gavome naują nuoroda, pvz., 'uploads/plant_12345.jpg'
            message.textContent = 'Nuotrauka įkelta. Išsaugomi augalo duomenys...';
        }

        // === 2 ŽINGSNIS: AUGALO DUOMENŲ IŠSAUGOJIMAS ===
        const plantData = {
            id: plantId,
            name_lt: document.getElementById('plant_name_lt').value,
            name_latin: document.getElementById('plant_name_latin').value,
            description: document.getElementById('plant_description').value,
            properties: document.getElementById('plant_properties').value,
            preparation_methods: document.getElementById('plant_preparation').value,
            warnings: document.getElementById('plant_warnings').value,
            main_image_url: imageUrl // Naudojame naują arba seną nuorodą
        };

        const apiUrl = isEditing ? 'api/update_plant.php' : 'api/add_plant.php';

        const saveResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(plantData)
        });
        
        const saveResult = await saveResponse.json();

        if (saveResponse.ok) {
            message.style.color = 'green';
            message.textContent = saveResult.message;
            document.getElementById('plant-form-container').style.display = 'none';
            // Perkame visą admin panelės turinį, kad atsinaujintų sąrašas
            document.dispatchEvent(new Event('DOMContentLoaded')); 
        } else {
            throw new Error(saveResult.error || 'Nežinoma klaida išsaugant augalą.');
        }

    } catch (error) {
        message.style.color = 'red';
        message.textContent = error.message;
    }
}

// 8. Funkcija ištrinti augalą
window.deletePlant = async function(plantId) {
    if (!confirm(`Ar tikrai norite ištrinti augalą (ID: ${plantId})? Tai pašalins ir visas jo sąsajas su produktais.`)) {
        return;
    }
    try {
        const response = await fetch(`api/delete_plant.php?id=${plantId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            const row = document.getElementById(`plant-row-${plantId}`);
            if (row) row.remove();
        } else {
            alert(`Klaida: ${result.error}`);
        }
    } catch (error) {
        alert('Tinklo klaida trinant augalą.');
    }
}
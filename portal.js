// =======================================================
// FAILAS: portal.js (PILNA GALUTINĖ PATAISYTA VERSIJA)
// APIMA: Profilio valdymą, Žemėlapį, Produktų CRUD, Pataisytos <label> žymos
// =======================================================

let mapInstance = null;
let currentMarker = null;

document.addEventListener('DOMContentLoaded', () => {
    const portalContent = document.getElementById('portal-content');
    const logoutLink = document.getElementById('logout-link');
    let currentUserId = null;

    // 1. AUTENTIFIKACIJA
    fetch('api/check_auth.php')
        .then(response => response.json())
        .then(auth => {
            if (!auth.logged_in || auth.role !== 'grower') {
                window.location.href = 'login.html';
                return;
            }
            currentUserId = auth.user_id;
            
            portalContent.innerHTML = `
                <h3>Sveiki, augintojau!</h3>
                <div id="profile-management"></div>
                <hr style="margin: 2rem 0;">
                <h3>Produkcijos Valdymas</h3>
                <div id="products-management"></div>
            `;
            
            // Kviečiame abi pagrindines funkcijas
            loadProfileForm(currentUserId);
            loadProductsList();
        })
        .catch(error => {
            console.error('Klaida autentifikuojant:', error);
            portalContent.innerHTML = '<p class="error">Klaida jungiantis prie sistemos.</p>';
        });

    // 2. ATSIJUNGIMAS
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetch('api/logout.php').then(() => {
            window.location.href = 'login.html';
        });
    });
});

// =======================================================
// === PROFILIO VALDYMO FUNKCIJOS
// =======================================================

// FUNKCIJA: Įkelia profilio formą ir duomenis
// PAKEISKITE ŠIĄ FUNKCIJĄ
function loadProfileForm(userId) {
    const profileDiv = document.getElementById('profile-management');
    profileDiv.innerHTML = '<p>Kraunami profilio duomenys...</p>';

    fetch('api/get_profile.php')
        .then(response => response.json())
        .then(profile => {
            if (profile.error) {
                profileDiv.innerHTML = `<p class="error">${profile.error}</p>`;
                return;
            }
            
            profileDiv.innerHTML = `
                <form id="profile-form">
                    <div class="form-group">
                        <label for="farm_name">Ūkio Pavadinimas:</label>
                        <input type="text" id="farm_name" value="${profile.farm_name || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="description">Aprašymas:</label>
                        <textarea id="description">${profile.description || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Adresas:</label>
                        <input type="text" id="address" value="${profile.address || ''}">
                    </div>

                    <div class="form-group">
                        <label for="phone">Telefonas:</label>
                        <input type="tel" id="phone" value="${profile.phone || ''}">
                    </div>

                    <div class="form-group">
                        <label for="logo_file">Ūkio logotipas:</label>
                        <input type="file" id="logo_file" accept="image/png, image/jpeg, image/gif">
                        <input type="hidden" id="logo_url_hidden" value="${profile.logo_url || ''}">
                        ${profile.logo_url ? 
                          `<div style="margin-top:10px;">
                               <img src="${profile.logo_url}" alt="Logotipas" style="max-width: 150px; height: auto; border: 1px solid #ddd;">
                           </div>` 
                          : ''}
                    </div>
                    <fieldset style="border: 1px solid #ccc; padding: 10px;">
                        <legend>Lokacijos koordinatės</legend>
                        <small>Jas galite pakeisti paspaudę žemėlapyje.</small>
                        <div class="form-group">
                            <label for="latitude">Platuma (Latitude):</label>
                            <input type="text" id="latitude" value="${profile.latitude || ''}" readonly required>
                        </div>
                        <div class="form-group">
                            <label for="longitude">Ilguma (Longitude):</label>
                            <input type="text" id="longitude" value="${profile.longitude || ''}" readonly required>
                        </div>
                        <div id="profile-map" style="height: 300px; margin-top: 10px;"></div>
                    </fieldset>
                    
                    <button type="submit" style="margin-top: 20px;">Išsaugoti Profilį</button>
                    <p id="profile-message" style="margin-top: 10px; font-weight: bold;"></p>
                </form>
            `;

            // Atidedame žemėlapio inicializavimą
            setTimeout(() => {
                initProfileMap(profile.latitude, profile.longitude);
            }, 50);
            
            document.getElementById('profile-form').addEventListener('submit', handleProfileSubmit);
        })
        .catch(error => {
            console.error('Nepavyko įkelti profilio:', error);
            profileDiv.innerHTML = `<p class="error">Nepavyko įkelti profilio duomenų.</p>`;
        });
}

// FUNKCIJA: Inicializuoja profilio žemėlapį
function initProfileMap(lat, lon) {
    const hasCoords = !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon));
    const defaultLat = hasCoords ? parseFloat(lat) : 55.1694;
    const defaultLon = hasCoords ? parseFloat(lon) : 23.8813;
    const defaultZoom = hasCoords ? 14 : 7;

    if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
    }
    mapInstance = L.map('profile-map').setView([defaultLat, defaultLon], defaultZoom);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(mapInstance);

    if (hasCoords) {
        currentMarker = L.marker([defaultLat, defaultLon]).addTo(mapInstance);
    }

    mapInstance.on('click', function (e) {
        const newLat = e.latlng.lat.toFixed(8);
        const newLon = e.latlng.lng.toFixed(8);
        document.getElementById('latitude').value = newLat;
        document.getElementById('longitude').value = newLon;
        if (currentMarker) {
            mapInstance.removeLayer(currentMarker);
        }
        currentMarker = L.marker([newLat, newLon]).addTo(mapInstance);
    });
}

// FUNKCIJA: Siunčia atnaujintus profilio duomenis
// PAKEISKITE ŠIĄ FUNKCIJĄ
async function handleProfileSubmit(e) {
    e.preventDefault();
    const message = document.getElementById('profile-message');
    message.textContent = 'Atnaujinama...';

    const fileInput = document.getElementById('logo_file');
    const oldLogoUrl = document.getElementById('logo_url_hidden').value;
    let logoUrl = oldLogoUrl; // Pagal nutylėjimą paliekame seną

    try {
        // === 1 ŽINGSNIS: LOGOTIPO ĮKĖLIMAS (JEI PASIRINKTAS) ===
        if (fileInput.files.length > 0) {
            message.textContent = 'Kraunamas logotipas...';
            const file = fileInput.files[0];
            const formData = new FormData();
            formData.append('imageFile', file); // Naudojame tą patį 'imageFile' raktą

            // Naudojame tą patį 'upload_image.php' API
            const uploadResponse = await fetch('api/upload_image.php', {
                method: 'POST',
                body: formData
            });

            const uploadResult = await uploadResponse.json();

            if (!uploadResponse.ok) {
                throw new Error(uploadResult.error || 'Nežinoma logotipo įkėlimo klaida.');
            }
            
            logoUrl = uploadResult.filePath; // Gavome naują nuorodą
            message.textContent = 'Logotipas įkeltas. Išsaugomi profilio duomenys...';
        }

        // === 2 ŽINGSNIS: PROFILIO DUOMENŲ IŠSAUGOJIMAS ===
        const profileData = {
            farm_name: document.getElementById('farm_name').value,
            description: document.getElementById('description').value,
            address: document.getElementById('address').value,
            phone: document.getElementById('phone').value,
            latitude: document.getElementById('latitude').value,
            longitude: document.getElementById('longitude').value,
            logo_url: logoUrl // Siunčiame naują arba seną nuorodą
        };

        const response = await fetch('api/update_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });
        const result = await response.json();
        
        if (response.ok) {
            message.style.color = 'green';
            message.textContent = result.message;
            // Atnaujiname paslėptą lauką, kad kitas atnaujinimas žinotų naują URL
            document.getElementById('logo_url_hidden').value = logoUrl;
        } else {
            throw new Error(result.error || 'Atnaujinimo klaida.');
        }
    } catch (error) {
        message.style.color = 'red';
        message.textContent = error.message;
    }
}


// =======================================================
// === PRODUKTŲ VALDYMO FUNKCIJOS
// =======================================================

// FUNKCIJA: Įkelia produktų sąrašą
function loadProductsList() {
    const productsDiv = document.getElementById('products-management');
    productsDiv.innerHTML = '<p>Kraunamas produktų sąrašas...</p>';

    fetch('api/get_products.php')
        .then(response => response.json())
        .then(products => {
            if (products.error) {
                productsDiv.innerHTML = `<p class="error">${products.error}</p>`;
                return;
            }

            let html = `
                <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Pavadinimas</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Būsena</th>
                            <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Veiksmai</th>
                        </tr>
                    </thead>
                    <tbody>
            `;

            if (products.length === 0) {
                html += '<tr><td colspan="3" style="padding: 8px; border: 1px solid #ddd; text-align: center;">Jūs dar nepridėjote jokių produktų.</td></tr>';
            } else {
                products.forEach(product => {
                    html += `
                        <tr>
                            <td data-label="Pavadinimas">${product.name}</td>
                            <td data-label="Būsena">${product.status}</td>
                            <td data-label="Veiksmai">
                                <button onclick='showProductForm(${JSON.stringify(product)})'>Redaguoti</button>
                                <button onclick="deleteProduct(${product.id})" class="danger">Trinti</button>
                            </td>
                        </tr>
                    `;
                });
            }

            html += '</tbody></table>';
            html += '<button id="add-new-product-btn" style="margin-top: 20px;">+ Pridėti naują produktą</button>';
            html += '<div id="product-form-container" style="display: none; margin-top: 20px;"></div>';

            productsDiv.innerHTML = html;

            document.getElementById('add-new-product-btn').addEventListener('click', () => {
                showProductForm(); // Kvies formą be duomenų (naujas produktas)
            });
        })
        .catch(error => {
            console.error('Klaida kraunant produktus:', error);
            productsDiv.innerHTML = `<p class="error">Nepavyko įkelti produktų sąrašo.</p>`;
        });
}

// PAKEISKITE ŠIĄ FUNKCIJĄ
function showProductForm(product = null) {
    const container = document.getElementById('product-form-container');
    container.style.display = 'block';
    container.innerHTML = '<p>Kraunama forma...</p>'; // Laikinas pranešimas

    const isEditing = product !== null;
    const formTitle = isEditing ? 'Redaguoti produktą' : 'Pridėti naują produktą';
    const productName = isEditing ? product.name : '';
    const productDesc = isEditing ? product.description : '';
    const productStatus = isEditing ? product.status : 'available';

    // Sukuriame formos HTML (kol kas be augalų sąrašo)
    container.innerHTML = `
        <div style="padding: 20px; border: 1px solid #ccc; background: #f9f9f9; border-radius: 5px;">
            <h4>${formTitle}</h4>
            <form id="product-form">
                <input type="hidden" id="product_id" value="${isEditing ? product.id : ''}">
                
                <div class="form-group">
                    <label for="product_name">Produkto pavadinimas:</label>
                    <input type="text" id="product_name" value="${productName}" required>
                </div>
                
                <div class="form-group">
                    <label for="product_description">Aprašymas:</label>
                    <textarea id="product_description">${productDesc}</textarea>
                </div>

                <div class="form-group">
                    <label for="product_status">Būsena:</label>
                    <select id="product_status">
                        <option value="available" ${productStatus === 'available' ? 'selected' : ''}>Yra (Available)</option>
                        <option value,"seasonal" ${productStatus === 'seasonal' ? 'selected' : ''}>Sezoninis (Seasonal)</option>
                        <option value="out_of_stock" ${productStatus === 'out_of_stock' ? 'selected' : ''}>Išparduota (Out of Stock)</option>
                    </select>
                </div>

                <fieldset style="border: 1px solid #ccc; padding: 10px; margin-top: 15px;">
                    <legend>Susieti su augalais (filtravimui)</legend>
                    <small>Pažymėkite, iš kurių augalų šis produktas pagamintas.</small>
                    <div id="plant-links-container" style="max-height: 150px; overflow-y: auto; border: 1px solid #eee; padding: 5px; margin-top: 5px;">
                        <p>Kraunamas augalų sąrašas...</p>
                    </div>
                </fieldset>
                <button type="submit">${isEditing ? 'Atnaujinti' : 'Išsaugoti'}</button>
                <button type="button" id="cancel-product-form" class="secondary" style="margin-left: 10px;">Atšaukti</button>
            </form>
            <p id="product-form-message" style="margin-top: 10px; font-weight: bold;"></p>
        </div>
    `;

    // Pridedame įvykius formos mygtukams
    document.getElementById('product-form').addEventListener('submit', handleProductFormSubmit);
    document.getElementById('cancel-product-form').addEventListener('click', () => {
        container.style.display = 'none'; // Paslepiame formą
    });

    // IŠKVIEČIAME FUNKCIJĄ AUGALŲ SĄRAŠUI ĮKELTI
    if (isEditing) {
        loadPlantLinks(product.id);
    } else {
        loadPlantLinks(null); // Įkelsime tik sąrašą, be pažymėjimų
    }
}

// FUNKCIJA: Siunčia produkto formos duomenis (CREATE/UPDATE)
// PAKEISKITE ŠIĄ FUNKCIJĄ
async function handleProductFormSubmit(e) {
    e.preventDefault();
    const message = document.getElementById('product-form-message');
    message.textContent = 'Siunčiama...';

    const productId = document.getElementById('product_id').value;
    const isEditing = productId !== '';

    const productData = {
        name: document.getElementById('product_name').value,
        description: document.getElementById('product_description').value,
        status: document.getElementById('product_status').value
    };

    let apiUrl = '';
    let method = 'POST';

    if (isEditing) {
        apiUrl = 'api/update_product.php';
        productData.id = productId;
    } else {
        apiUrl = 'api/add_product.php';
    }
    
    try {
        // 1. Išsaugome/Atnaujiname patį produktą
        const response = await fetch(apiUrl, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Nežinoma klaida išsaugant produktą.');
        }

        // 2. Sėkmės atveju – atnaujiname sąsajas
        // Nuskaitome pažymėtus augalus
        const checkedBoxes = document.querySelectorAll('input[name="plant_links"]:checked');
        const linkedPlantIds = Array.from(checkedBoxes).map(cb => cb.value);
        
        // Nustatome produkto ID (jei tai buvo naujas produktas, API turėtų jį grąžti)
        // DĖMESIO: Tam, kad tai veiktų 100%, add_product.php turėtų grąžinti naują ID.
        // Kol kas naudosime esamą ID (jei redaguojame) arba ieškosime pagal pavadinimą (netobula)
        // PAPRASTESNIS VAR.: Kol kas leidžiame sąsajas redaguoti tik ESAMIEMS produktams.
        
        let currentProductId = productId;
        if (!isEditing) {
            // Jei kuriame naują, turime gauti naują ID.
            // Kadangi `add_product.php` negrąžina ID, pranešame vartotojui.
            message.style.color = 'green';
            message.textContent = "Produktas sukurtas. Dabar galite jį redaguoti ir pridėti sąsajas.";
            document.getElementById('product-form-container').style.display = 'none';
            loadProductsList();
            return; // Baigiame čia
        }

        // Jei REDAGUOJAME, siunčiame sąsajų atnaujinimą
        const linksResponse = await fetch('api/product_links_api.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                product_id: currentProductId,
                plant_ids: linkedPlantIds
            })
        });

        const linksResult = await linksResponse.json();
        if (!linksResponse.ok) {
            throw new Error(linksResult.error || 'Klaida atnaujinant sąsajas.');
        }

        // Viskas pavyko
        message.style.color = 'green';
        message.textContent = result.message + " " + linksResult.message;
        document.getElementById('product-form-container').style.display = 'none';
        loadProductsList(); // Atnaujiname lentelę

    } catch (error) {
        message.style.color = 'red';
        message.textContent = error.message;
    }
}

// FUNKCIJA: Trina produktą (DELETE)
async function deleteProduct(id) {
    if (!confirm(`Ar tikrai norite ištrinti produktą (ID: ${id})?`)) {
        return;
    }

    try {
        // Pataisome API: ID turi būti perduodamas per URL
        const response = await fetch(`api/delete_product.php?id=${id}`, {
            method: 'DELETE'
        });

        const result = await response.json();

        if (response.ok) {
            alert(result.message);
            loadProductsList(); // Atnaujiname lentelę
        } else {
            // Parodome DB klaidą, jei ji grąžinama
            alert(`Klaida: ${result.error}`);
        }
    } catch (error) {
        alert('Tinklo klaida trinant produktą.');
    }
}

// PRIDĖKITE ŠIĄ NAUJĄ FUNKCIJĄ
// Ji paims visus augalus (iš get_plants.php) ir esamas sąsajas (iš product_links_api.php)
async function loadPlantLinks(productId) {
    const container = document.getElementById('plant-links-container');
    try {
        // 1. Gauname visų įmanomų augalų sąrašą
        const plantsResponse = await fetch('api/get_plants.php');
        const allPlants = await plantsResponse.json();

        // 2. Gauname jau pažymėtų augalų sąrašą (jei redaguojame)
        let linkedPlantIds = [];
        if (productId) {
            const linksResponse = await fetch(`api/product_links_api.php?product_id=${productId}`);
            linkedPlantIds = await linksResponse.json();
        }

        if (allPlants.length === 0) {
            container.innerHTML = '<p>Sistemoje nėra augalų, kuriuos būtų galima priskirti.</p>';
            return;
        }

        // 3. Generuojame žymimuosius langelius (checkboxes)
        let html = '';
        allPlants.forEach(plant => {
            const isChecked = linkedPlantIds.includes(plant.id);
            html += `
                <div>
                    <input type="checkbox" id="plant_${plant.id}" name="plant_links" value="${plant.id}" ${isChecked ? 'checked' : ''}>
                    <label for="plant_${plant.id}">${plant.name_lt}</label>
                </div>
            `;
        });
        container.innerHTML = html;

    } catch (error) {
        console.error('Klaida kraunant augalų sąsajas:', error);
        container.innerHTML = '<p class="error">Klaida kraunant augalų sąrašą.</p>';
    }
}
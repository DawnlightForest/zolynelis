// Failas: portal.js (SU PROFILIO VALDYMU)

// Globalus kintamasis žemėlapiui, kad vėliau būtų galima jį valdyti (pvz., smeigtuką)
let mapInstance = null;
let currentMarker = null;

document.addEventListener('DOMContentLoaded', () => {
    const portalContent = document.getElementById('portal-content');
    const logoutLink = document.getElementById('logout-link');
    let currentUserId = null;

    // Patikrinimas, ar vartotojas prisijungęs (API: check_auth.php)
    fetch('api/check_auth.php')
        .then(response => response.json())
        .then(auth => {
            if (!auth.logged_in || auth.role !== 'grower') {
                window.location.href = 'login.html';
                return;
            }
            currentUserId = auth.user_id;
            
            portalContent.innerHTML = '<h3>Sveiki, augintojau!</h3>' +
                                      '<div id="profile-management"></div>' +
                                      '<h3>Produkcijos Valdymas</h3>' +
                                      '<div id="products-management"><p>Produktų valdymas bus sukurtas vėlesniuose žingsniuose...</p></div>';
            
            // Kviečiame pagrindinę profilio funkciją
            loadProfileForm(currentUserId);

        })
        .catch(error => {
            console.error('Klaida autentifikuojant:', error);
            portalContent.innerHTML = '<p class="error">Klaida jungiantis prie sistemos.</p>';
        });

    // Atsijungimo funkcija
    logoutLink.addEventListener('click', (e) => {
        e.preventDefault();
        fetch('api/logout.php').then(() => {
            window.location.href = 'login.html';
        });
    });
});


// FUNKCIJA: Įkelia profilio formą ir duomenis (API: get_profile.php)
function loadProfileForm(userId) {
    const profileDiv = document.getElementById('profile-management');
    profileDiv.innerHTML = '<p>Kraunami profilio duomenys...</p>';

    // Gauname dabartinius profilio duomenis
    fetch('api/get_profile.php')
        .then(response => response.json())
        .then(profile => {
            if (profile.error) {
                profileDiv.innerHTML = `<p class="error">${profile.error}</p>`;
                return;
            }
            
            // Sugeneruojame formą su gautais duomenimis
            profileDiv.innerHTML = `
                <form id="profile-form">
                    <label>Ūkio Pavadinimas:</label>
                    <input type="text" id="farm_name" value="${profile.farm_name || ''}" required><br><br>
                    
                    <label>Aprašymas:</label>
                    <textarea id="description">${profile.description || ''}</textarea><br><br>
                    
                    <label>Adresas:</label>
                    <input type="text" id="address" value="${profile.address || ''}"><br><br>

                    <label>Telefonas:</label>
                    <input type="tel" id="phone" value="${profile.phone || ''}"><br><br>

                    <fieldset style="border: 1px solid #ccc; padding: 10px;">
                        <legend>Lokacijos koordinatės</legend>
                        <small>Jas galite pakeisti paspaudę žemėlapyje.</small><br>
                        <label>Platuma (Latitude):</label>
                        <input type="text" id="latitude" value="${profile.latitude || ''}" readonly required><br>
                        
                        <label>Ilguma (Longitude):</label>
                        <input type="text" id="longitude" value="${profile.longitude || ''}" readonly required>
                        <div id="profile-map" style="height: 300px; margin-top: 10px;"></div>
                    </fieldset>
                    
                    <button type="submit" style="margin-top: 20px;">Išsaugoti Profilį</button>
                    <p id="profile-message" style="margin-top: 10px; font-weight: bold;"></p>
                </form>
            `;

            // 3. Inicializuojame žemėlapį formoje
            setTimeout(() => {
            initProfileMap(profile.latitude, profile.longitude);
            }, 50);
            
            // 4. Pridedame formos siuntimo įvykio klausiklį
            document.getElementById('profile-form').addEventListener('submit', handleProfileSubmit);

        })
        .catch(error => {
            profileDiv.innerHTML = `<p class="error">Nepavyko įkelti profilio duomenų.</p>`;
        });
}




function initProfileMap(lat, lon) {
    // Patikriname, ar perduotos koordinatės yra teisingos skaičiai
    const hasCoords = !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lon));

    // Nustatome numatytas reikšmes (Lietuvos centras)
    const defaultLat = hasCoords ? parseFloat(lat) : 55.1694;
    const defaultLon = hasCoords ? parseFloat(lon) : 23.8813;
    const defaultZoom = hasCoords ? 14 : 7; // Priartiname, jei turime koordinates

    // Jei žemėlapis jau buvo sukurtas — išvalome jį
    if (mapInstance) {
        mapInstance.off();
        mapInstance.remove();
    }

    // Sukuriame žemėlapį
    mapInstance = L.map('profile-map').setView([defaultLat, defaultLon], defaultZoom);

    // Pridedame OpenStreetMap sluoksnį
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstance);

    // Pridedame žymeklį, jei yra koordinatės
    if (hasCoords) {
        currentMarker = L.marker([defaultLat, defaultLon]).addTo(mapInstance);
    }

    // Pridedame įvykį – pelės paspaudimas žemėlapyje
    mapInstance.on('click', function (e) {
        const newLat = e.latlng.lat.toFixed(8);
        const newLon = e.latlng.lng.toFixed(8);

        // Atnaujiname įvesties laukus, jei jie egzistuoja
        const latInput = document.getElementById('latitude');
        const lonInput = document.getElementById('longitude');
        if (latInput && lonInput) {
            latInput.value = newLat;
            lonInput.value = newLon;
        }

        // Ištriname seną žymeklį, jei yra, ir pridedame naują
        if (currentMarker) {
            mapInstance.removeLayer(currentMarker);
        }
        currentMarker = L.marker([newLat, newLon]).addTo(mapInstance);
    });
}


// FUNKCIJA: Tvarko formos siuntimą (API: update_profile.php)
async function handleProfileSubmit(e) {
    e.preventDefault();
    const message = document.getElementById('profile-message');
    message.textContent = 'Atnaujinama...';

    const profileData = {
        farm_name: document.getElementById('farm_name').value,
        description: document.getElementById('description').value,
        address: document.getElementById('address').value,
        phone: document.getElementById('phone').value,
        latitude: document.getElementById('latitude').value,
        longitude: document.getElementById('longitude').value
    };

    try {
        const response = await fetch('api/update_profile.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(profileData)
        });

        const result = await response.json();
        
        if (response.ok) {
            message.style.color = 'green';
            message.textContent = result.message;
            // Jei atnaujinamos koordinatės, reikia perbraižyti smeigtuką žemėlapyje (tai vyksta automatiškai, nes naudotojas paspaudė formoje)
        } else {
            message.style.color = 'red';
            message.textContent = result.error || 'Atnaujinimo klaida.';
        }
    } catch (error) {
        message.style.color = 'red';
        message.textContent = 'Tinklo klaida. Patikrinkite serverio būklę.';
    }
}
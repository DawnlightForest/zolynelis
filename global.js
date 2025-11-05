// Failas: global.js

document.addEventListener('DOMContentLoaded', () => {
    
    // Surandame navigacijos juostą pagal ID
    const nav = document.getElementById('main-nav');
    if (!nav) return; // Jei nerandame nav, nieko nedarome

    // Kreipiamės į API, kad patikrintume, kas prisijungęs
    fetch('api/check_auth.php')
        .then(response => response.json())
        .then(auth => {
            if (auth.logged_in) {
                // Vartotojas yra prisijungęs!

                let panelLink = '';
                if (auth.role === 'admin') {
                    // Sukuriame nuorodą į Admin panelę
                    panelLink = '<a href="admin.html" class="nav-button admin">ADMINO PANELĖ</a>';
                } else if (auth.role === 'grower') {
                    // Sukuriame nuorodą į Augintojo portalą
                    panelLink = '<a href="portal.html" class="nav-button grower">MANO PORTALAS</a>';
                }

                // Pridedame naują nuorodą į navigacijos pabaigą
                nav.innerHTML += panelLink;

                // Taip pat galime pridėti "Atsijungti" nuorodą
                nav.innerHTML += '<a href="#" id="global-logout-link" class="nav-button logout">Atsijungti</a>';
                
                // Pridedame funkcionalumą atsijungimo mygtukui
                const logoutLink = document.getElementById('global-logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        
                        fetch('api/logout.php')
                            .then(response => response.json()) // Priverčiame palaukti serverio atsakymo
                            .then(data => {
                                // Tik kai serveris patvirtina, kad sesija sunaikinta,
                                // perkrauname puslapį.
                                window.location.href = 'index.html';
                            })
                            .catch(error => {
                                console.error('Klaida atsijungiant:', error);
                                // Net jei įvyko klaida, vis tiek bandome perkrauti
                                window.location.href = 'index.html';
                            });
                    });
                }
            } else {
                // PRIDĖKITE ŠĮ BLOKĄ:
                // Vartotojas NĖRA prisijungęs
                nav.innerHTML += '<a href="login.html" class="nav-button login">Prisijungti</a>';
            }
            // Jei vartotojas neprisijungęs (auth.logged_in === false), nieko nedarome.
        })
        .catch(error => {
            console.error("Autentifikacijos patikros klaida:", error);
        });
});
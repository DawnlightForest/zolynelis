// Failas: global.js (PATAISYTA Meniu Rodyjimo Logika)

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. Surandame VISUS tris elementus
    const menuToggle = document.getElementById('menu-toggle');
    const mainNav = document.getElementById('main-nav'); // <-- SVARBUS PATAISYMAS: Randame pagrindinį <nav>
    const navLinksContainer = document.getElementById('nav-links');

    // 2. Hamburger meniu valdymas
    if (menuToggle && mainNav) { // <-- Tikriname, ar radome mainNav
        menuToggle.addEventListener('click', () => {
            // Perjungiame 'active' klasę visam <nav id="main-nav"> blokui
            mainNav.classList.toggle('active'); // <-- PATAISYTA
            
            // Taip pat perjungiame mygtukui (dėl "X" animacijos)
            menuToggle.classList.toggle('active');
        });
    }

    // 3. Autentifikacija ir nuorodų pridėjimas
    
    // Tikriname, ar radome vidinį nuorodų konteinerį
    if (!navLinksContainer) {
        console.error('Klaida: HTML struktūroje nerastas #nav-links konteineris.');
        return; 
    }

    fetch('api/check_auth.php')
        .then(response => response.json())
        .then(auth => {
            if (auth.logged_in) {
                // --- VARTOTOJAS PRISIJUNGĘS ---
                
                let panelLink = '';
                if (auth.role === 'admin') {
                    panelLink = '<a href="admin.html" class="nav-button admin">ADMINO PANELĖ</a>';
                } else if (auth.role === 'grower') {
                    panelLink = '<a href="portal.html" class="nav-button grower">MANO PORTALAS</a>';
                }

                // Dedame nuorodas į vidinį konteinerį
                navLinksContainer.innerHTML += panelLink;
                navLinksContainer.innerHTML += '<a href="#" id="global-logout-link" class="nav-button logout">Atsijungti</a>';
                
                // Pridedame atsijungimo funkciją
                const logoutLink = document.getElementById('global-logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        fetch('api/logout.php')
                            .then(response => response.json())
                            .then(() => window.location.href = 'index.html')
                            .catch(() => window.location.href = 'index.html');
                    });
                }
            } else {
                // --- VARTOTOJAS ATSIJUNGĘS ---
                navLinksContainer.innerHTML += '<a href="login.html" class="nav-button login">Prisijungti</a>';
            }
        })
        .catch(error => console.error("Autentifikacijos klaida:", error));
});
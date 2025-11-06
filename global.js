// Failas: global.js (GALUTINĖ VERSIJA: Hamburger + Autentifikacija)

document.addEventListener('DOMContentLoaded', () => {
    // 1. Surandame naujus elementus (pritaikytus mobiliam dizainui)
    const navLinksContainer = document.getElementById('nav-links');
    const menuToggle = document.getElementById('menu-toggle');

    // 2. Hamburger meniu valdymas (jei mygtukas egzistuoja puslapyje)
    if (menuToggle && navLinksContainer) {
        menuToggle.addEventListener('click', () => {
            // Perjungiame 'active' klasę, kurią CSS naudos rodymui/slėpimui
            navLinksContainer.classList.toggle('active');
        });
    }

    // 3. Autentifikacija ir nuorodų pridėjimas
    // Svarbu: tikriname, ar radome navLinksContainer, prieš dedant į jį nuorodas
    if (!navLinksContainer) return;

    fetch('api/check_auth.php')
        .then(response => response.json())
        .then(auth => {
            if (auth.logged_in) {
                // --- VARTOTOJAS PRISIJUNGĘS ---
                
                let panelLink = '';
                // Nustatome tinkamą nuorodą pagal rolę
                if (auth.role === 'admin') {
                    panelLink = '<a href="admin.html" class="nav-button admin">ADMINO PANELĖ</a>';
                } else if (auth.role === 'grower') {
                    panelLink = '<a href="portal.html" class="nav-button grower">MANO PORTALAS</a>';
                }

                // Pridedame nuorodas į NAUJĄJĮ konteinerį (#nav-links)
                navLinksContainer.innerHTML += panelLink;
                navLinksContainer.innerHTML += '<a href="#" id="global-logout-link" class="nav-button logout">Atsijungti</a>';
                
                // Pridedame atsijungimo funkciją
                const logoutLink = document.getElementById('global-logout-link');
                if (logoutLink) {
                    logoutLink.addEventListener('click', (e) => {
                        e.preventDefault();
                        // Sunaikiname sesiją serveryje
                        fetch('api/logout.php')
                            .then(response => response.json())
                            .then(() => window.location.href = 'index.html')
                            .catch(() => window.location.href = 'index.html');
                    });
                }
            } else {
                // --- VARTOTOJAS ATSIJUNGĘS ---
                // Pridedame "Prisijungti" mygtuką
                 navLinksContainer.innerHTML += '<a href="login.html" class="nav-button login">Prisijungti</a>';
            }
        })
        .catch(error => {
            console.error("Autentifikacijos klaida:", error);
        });
});
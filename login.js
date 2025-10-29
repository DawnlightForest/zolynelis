// Failas: login.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('login-form');
    const messageBox = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        messageBox.style.display = 'none';
        messageBox.className = 'message-box';

        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const loginData = {
            email: email,
            password: password
        };

        try {
            const response = await fetch('api/login.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(loginData)
            });

            const result = await response.json();

            if (response.ok) {
                // Sėkmė (HTTP 200 OK)
                messageBox.classList.add('success');
                messageBox.textContent = result.message;
                
                // NUKREIPIAME VARTOTOJĄ
                if (result.role === 'admin') {
                    // Administracijos puslapis
                    window.location.href = 'admin.html'; 
                } else if (result.role === 'grower') {
                    // Augintojo portalas
                    window.location.href = 'portal.html'; 
                } else {
                    // Bendrai prisijungusiems naudotojams
                    window.location.href = 'index.html'; 
                }

            } else {
                // Klaida (pvz., 401 Unauthorized, 403 Forbidden)
                messageBox.classList.add('error');
                messageBox.textContent = result.error || 'Nežinoma klaida prisijungimo metu.';
            }

        } catch (error) {
            messageBox.classList.add('error');
            messageBox.textContent = 'Nepavyko prisijungti prie serverio.';
        }
        
        messageBox.style.display = 'block';
    });
});
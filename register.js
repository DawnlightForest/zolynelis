// Failas: register.js

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('register-form');
    const messageBox = document.getElementById('message');

    form.addEventListener('submit', async (e) => {
        e.preventDefault(); // Sustabdome numatytąjį formos siuntimą

        // Išvalome pranešimus
        messageBox.style.display = 'none';
        messageBox.className = 'message-box';

        // Gauname duomenis iš laukų
        const farmName = document.getElementById('farm_name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        // Paruošiame duomenis siuntimui JSON formatu
        const registrationData = {
            farm_name: farmName,
            email: email,
            password: password
        };

        try {
            // Kreipiamės į mūsų registracijos API
            const response = await fetch('api/register.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json' // BŪTINA JSON formatui
                },
                body: JSON.stringify(registrationData) // Konvertuojame duomenis į JSON tekstą
            });

            const result = await response.json(); // Gauname atsakymą iš serverio

            if (response.ok) {
                // Sėkmė (HTTP 201 Created)
                messageBox.classList.add('success');
                messageBox.textContent = result.message;
                form.reset(); // Išvalome formą
            } else {
                // Klaida (pvz., 400 Bad Request, 409 Conflict)
                messageBox.classList.add('error');
                messageBox.textContent = result.error || 'Nežinoma klaida registracijos metu.';
            }

        } catch (error) {
            // Tinklo klaida
            messageBox.classList.add('error');
            messageBox.textContent = 'Nepavyko prisijungti prie serverio. Patikrinkite XAMPP.';
        }
        
        messageBox.style.display = 'block';
    });
});
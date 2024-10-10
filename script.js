// Funzione per la registrazione dell'utente
const registerUser = async (userData) => {
    try {
        const response = await fetch('http://localhost:5000/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        const result = await response.json();
        if (response.ok) {
            console.log('Utente registrato con successo:', result);
            alert('Registrazione avvenuta con successo!');
        } else {
            console.error('Errore durante la registrazione:', result.message);
            alert('Errore durante la registrazione: ' + result.message);
        }
    } catch (error) {
        console.error('Errore nella richiesta:', error);
        alert('Errore di rete durante la registrazione.');
    }
};

// Esempio: Funzione per gestire il submit del form di registrazione
document.getElementById('registerForm').addEventListener('submit', (event) => {
    event.preventDefault(); // Previene il refresh della pagina

    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userData = {
        username,
        email,
        password,
    };

    registerUser(userData);
});

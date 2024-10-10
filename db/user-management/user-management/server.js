require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/auth'); // Rotte per la registrazione e il login

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json()); // Middleware per interpretare i JSON

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("🎉 Connessione a MongoDB avvenuta con successo"))
    .catch(err => console.error("❌ Errore di connessione a MongoDB:", err));

// Utilizzo delle route di autenticazione
app.use('/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`☑️  Server in ascolto sulla porta ${PORT}`);
});

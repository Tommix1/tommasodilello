const express = require('express');
const router = express.Router();
const User = require('../models/user');
const crypto = require('crypto');  // Per generare il token
const nodemailer = require('nodemailer');  // Per inviare email
const bcrypt = require('bcrypt');

// Configura il trasporto di Nodemailer per l'invio dell'email
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Ignora gli errori del certificato
    },
});


// Rotta per richiedere la reimpostazione della password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'Utente non trovato' });
        }

        // Genera un token per la reimpostazione della password
        const token = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 ora

        await user.save();

        // Invia l'email all'utente con il link di reimpostazione
        const resetLink = `http://localhost:5000/reset-password/${token}`;
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: user.email,
            subject: 'Reimposta la tua password',
            text: `Clicca sul seguente link per reimpostare la tua password: ${resetLink}`
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Email di reimpostazione inviata!' });

    } catch (error) {
        console.error('Errore durante la richiesta di reimpostazione della password:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
});

// Rotta per reimpostare la password
router.post('/reset-password/:token', async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;

    try {
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }, // Controlla se il token è ancora valido
        });

        if (!user) {
            return res.status(400).json({ message: 'Token non valido o scaduto' });
        }

        // Cripta la nuova password e aggiorna l'utente
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        user.resetPasswordToken = undefined;  // Resetta il token e la scadenza
        user.resetPasswordExpires = undefined;

        await user.save();

        res.status(200).json({ message: 'Password reimpostata con successo!' });

    } catch (error) {
        console.error('Errore durante la reimpostazione della password:', error);
        res.status(500).json({ message: 'Errore del server' });
    }
});


// Route per la registrazione
router.post('/register', async (req, res) => {
        const { username, email, password } = req.body;

        try {
        // Verifica se l'utente esiste già

        const userEsistente = await User.findOne({ username });
        if (userEsistente) {
            return res.status(400).json({ message: 'Nome utente non disponibile' });
        }

        const mailEsistente = await User.findOne({ email });
        if (mailEsistente) {
            return res.status(400).json({ message: 'E-Mail già registrata' });
        }

        // Crea un nuovo utente
        const newUser = new User({ username, email, password });
        await newUser.save();

        res.status(201).json({ message: 'Utente creato con successo' });
    } catch (error) {
        res.status(500).json({ message: 'Errore nella registrazione', error: error.message });
    }
});

// Route per il login (puoi aggiungere ulteriori funzionalità qui)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Cerca l'utente tramite email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        // Verifica la password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Credenziali non valide' });
        }

        res.status(200).json({ message: 'Login effettuato con successo' });
    } catch (error) {
        res.status(500).json({ message: 'Errore del server', error: error.message });
    }
});

module.exports = router;

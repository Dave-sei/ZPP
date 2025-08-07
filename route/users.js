const express = require('express');
const router = express.Router();
const db = require('../db');
// For a real application, use a library like bcrypt for password hashing
// const bcrypt = require('bcrypt');

// GET all users
router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT id, name, email, role, status, last_login FROM users');
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// POST a new user (Registration)
router.post('/register', async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // In a real app, hash the password before storing it
        // const salt = await bcrypt.genSalt(10);
        // const password_hash = await bcrypt.hash(password, salt);
        const password_hash = password; // Placeholder

        const [result] = await db.query(
            'INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)',
            [name, email, password_hash, role]
        );
        res.status(201).json({ id: result.insertId, name, email, role });
    } catch (error) {
        console.error(error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ error: 'Email already exists.' });
        }
        res.status(500).json({ error: 'Database error' });
    }
});

// POST to login a user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const [rows] = await db.query('SELECT * FROM users WHERE email = ?', [email]);

        if (rows.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = rows[0];

        // In a real app, compare hashed passwords
        // const isMatch = await bcrypt.compare(password, user.password_hash);
        const isMatch = (password === user.password_hash); // Placeholder for plain text comparison

        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last_login timestamp
        await db.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

        // Don't send the password hash back to the client
        const { password_hash, ...userWithoutPassword } = user;

        res.json({ user: userWithoutPassword });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});


module.exports = router;
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM projects');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

router.post('/', async (req, res) => {
    try {
        const { name, description, status, priority } = req.body;
        const [result] = await db.query(
            'INSERT INTO projects (name, description, status, priority) VALUES (?, ?, ?, ?)',
            [name, description, status, priority]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        res.status(500).json({ error: 'Database error' });
    }
});

module.exports = router;
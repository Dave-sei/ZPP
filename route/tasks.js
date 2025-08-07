const express = require('express');
const router = express.Router();
const db = require('../db');

// GET all tasks
router.get('/', async (req, res) => {
    try {
        const { projectId } = req.query;
        let query = 'SELECT * FROM tasks';
        const params = [];
        if (projectId) {
            query += ' WHERE project_id = ?';
            params.push(projectId);
        }
        const [rows] = await db.query(query, params);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// GET a single task by ID
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [rows] = await db.query('SELECT * FROM tasks WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});


// POST a new task
router.post('/', async (req, res) => {
    try {
        const {
            project_id,
            title,
            description,
            status,
            priority,
            assignee_id,
            start_date,
            end_date,
            estimated_hours,
            actual_hours
        } = req.body;

        const [result] = await db.query(
            'INSERT INTO tasks (project_id, title, description, status, priority, assignee_id, start_date, end_date, estimated_hours, actual_hours, progress) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
            [project_id, title, description, status, priority, assignee_id, start_date, end_date, estimated_hours, actual_hours]
        );
        res.status(201).json({ id: result.insertId, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// PUT to update a task
router.put('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const {
            project_id,
            title,
            description,
            status,
            priority,
            assignee_id,
            start_date,
            end_date,
            estimated_hours,
            actual_hours,
            progress
        } = req.body;

        const [result] = await db.query(
            'UPDATE tasks SET project_id = ?, title = ?, description = ?, status = ?, priority = ?, assignee_id = ?, start_date = ?, end_date = ?, estimated_hours = ?, actual_hours = ?, progress = ? WHERE id = ?',
            [project_id, title, description, status, priority, assignee_id, start_date, end_date, estimated_hours, actual_hours, progress, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.json({ id, ...req.body });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.query('DELETE FROM tasks WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Task not found' });
        }

        res.status(204).send(); // No Content
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Database error' });
    }
});


module.exports = router;
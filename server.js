const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Import API routes from the correct 'route' (singular) directory
const projectRoutes = require('./route/projects');
const taskRoutes = require('./route/tasks');
const userRoutes = require('./route/users');

// Use API routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// ProjectPro Application JavaScript

const API_BASE_URL = 'http://localhost:3001/api';
let currentUser = null;
let isAuthenticated = false;
let currentPage = 'dashboard';
let charts = {};

// API Service
const api = {
    async get(endpoint) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`);
        return response.json();
    },
    async post(endpoint, data) {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });
        return response.json();
    }
};

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

async function initializeApp() {
  // Mock login for demonstration
  currentUser = { id: 1, name: "John Smith", role: "Super Admin" };
  isAuthenticated = true;
  showMainApp();
  await initializeDashboard();
}

// ... (keep your existing authentication and UI logic like showAuthModal, toggleAuthMode, etc.)

// Updated render functions
async function renderProjects() {
  const container = document.getElementById('projectsGrid');
  const projects = await api.get('/projects');
  
  // Your existing rendering logic using the fetched projects
  container.innerHTML = projects.map(project => `
    <div class="project-card">
      </div>
  `).join('');
}

async function renderTasks() {
    const container = document.getElementById('tasksList');
    const tasks = await api.get('/tasks');
    // Your existing rendering logic for tasks
}

async function handleProjectSubmit(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  const projectData = Object.fromEntries(formData.entries());
  
  await api.post('/projects', projectData);
  
  closeProjectModal();
  renderProjects();
}

// ... (Update other functions like renderUsers, renderTasks to use the API service)

// Initialize the first page
showDashboard();
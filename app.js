// ProjectPro Application JavaScript

const API_BASE_URL = 'http://localhost:3001/api';
let currentUser = null;
let isAuthenticated = false;
let currentPage = 'dashboard';
let charts = {};
let allProjects = [];
let allUsers = [];

// API Service
const api = {
    async request(method, endpoint, body = null) {
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' },
        };
        if (body) {
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        if (response.status === 204) return null; // Handle No Content response for DELETE
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || `API request failed with status ${response.status}`);
        }
        return response.json();
    },
    get(endpoint) {
        return this.request('GET', endpoint);
    },
    post(endpoint, data) {
        return this.request('POST', endpoint, data);
    },
    put(endpoint, data) {
        return this.request('PUT', endpoint, data);
    },
    delete(endpoint) {
        return this.request('DELETE', endpoint);
    },
};

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const savedUser = localStorage.getItem('projectpro_user');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            isAuthenticated = true;
            showMainApp();
            showDashboard(); // Start on dashboard
        } catch (e) {
            showAuthModal();
        }
    } else {
        showAuthModal();
    }
}

// --- Authentication ---
function showAuthModal() {
    document.getElementById('authModal').classList.remove('hidden');
    document.getElementById('mainApp').classList.add('hidden');
    document.getElementById('authForm').onsubmit = handleAuth;
}

function closeAuthModal() {
    document.getElementById('authModal').classList.add('hidden');
}

function toggleAuthMode() {
    const isSignup = document.getElementById('authModalTitle').textContent === 'Sign Up';
    if (isSignup) {
        document.getElementById('authModalTitle').textContent = 'Login';
        document.getElementById('authSubmitText').textContent = 'Login';
        document.getElementById('authSwitchText').textContent = "Don't have an account?";
        document.getElementById('authSwitchBtn').textContent = 'Sign Up';
        document.getElementById('signupFields').classList.add('hidden');
    } else {
        document.getElementById('authModalTitle').textContent = 'Sign Up';
        document.getElementById('authSubmitText').textContent = 'Sign Up';
        document.getElementById('authSwitchText').textContent = 'Already have an account?';
        document.getElementById('authSwitchBtn').textContent = 'Login';
        document.getElementById('signupFields').classList.remove('hidden');
    }
}

async function handleAuth(e) {
    e.preventDefault();
    const email = document.getElementById('authEmail').value;
    const password = document.getElementById('authPassword').value;
    const isSignup = document.getElementById('authModalTitle').textContent === 'Sign Up';

    try {
        if (isSignup) {
            const name = document.getElementById('authName').value;
            const role = document.getElementById('authRole').value;
            await api.post('/users/register', { name, email, password, role });
            // Automatically log in after successful registration
            const loginResponse = await api.post('/users/login', { email, password });
            currentUser = loginResponse.user;

        } else {
            const response = await api.post('/users/login', { email, password });
            currentUser = response.user;
        }

        isAuthenticated = true;
        localStorage.setItem('projectpro_user', JSON.stringify(currentUser));

        showMainApp();
        closeAuthModal();
        showDashboard();
    } catch (error) {
        alert(`Authentication failed: ${error.message}`);
    }
}

function showMainApp() {
    document.getElementById('authModal').classList.add('hidden');
    document.getElementById('mainApp').classList.remove('hidden');
    document.getElementById('currentUserName').textContent = `Welcome, ${currentUser.name}`;
    document.getElementById('currentUserRole').textContent = currentUser.role;
    updateNavigationAccess();
}

function updateNavigationAccess() {
    const userRole = currentUser.role;
    const usersNavItem = document.getElementById('nav-users-li');
    if (userRole === 'Super Admin' || userRole === 'Admin') {
        usersNavItem.classList.remove('hidden');
    } else {
        usersNavItem.classList.add('hidden');
    }
}

function logout() {
    currentUser = null;
    isAuthenticated = false;
    localStorage.removeItem('projectpro_user');
    showAuthModal();
    document.getElementById('authForm').reset();
    document.getElementById('authModalTitle').textContent = 'Login';
    document.getElementById('authSubmitText').textContent = 'Login';
    document.getElementById('signupFields').classList.add('hidden');
}


// --- Navigation ---
function showPage(pageId) {
    document.querySelectorAll('.page-content').forEach(page => page.classList.add('hidden'));
    document.querySelectorAll('.nav-item').forEach(item => item.classList.remove('active'));
    document.getElementById(pageId).classList.remove('hidden');
    const navItem = document.getElementById(`nav-${pageId}`);
    if (navItem) {
        navItem.classList.add('active');
    }
    currentPage = pageId;
}

// Navigation Handlers
function showDashboard() { showPage('dashboard'); renderDashboard(); }
function showProjects() { showPage('projects'); renderProjects(); }
function showTasks() { showPage('tasks'); renderTasks(); }
function showUsers() {
    if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') {
        showPage('users');
        renderUsers();
    }
}
// Add other navigation handlers as needed...

// --- Dashboard ---
async function renderDashboard() {
    // This data would ideally come from a dedicated dashboard API endpoint
    const projects = await api.get('/projects');
    const tasks = await api.get('/tasks');

    document.getElementById('totalProjects').textContent = projects.length;
    document.getElementById('activeProjects').textContent = projects.filter(p => p.status === 'In Progress').length;
    document.getElementById('completedTasks').textContent = tasks.filter(t => t.status === 'Completed').length;
    document.getElementById('pendingTasks').textContent = tasks.filter(t => t.status !== 'Completed').length;

    renderDashboardCharts(projects);
}

function renderDashboardCharts(projects) {
    const projectCtx = document.getElementById('projectProgressChart');
    if (charts.projectProgress) charts.projectProgress.destroy();
    charts.projectProgress = new Chart(projectCtx, {
        type: 'bar',
        data: {
            labels: projects.map(p => p.name),
            datasets: [{
                label: 'Progress %',
                data: projects.map(p => p.progress),
                backgroundColor: '#1FB8CD',
                borderRadius: 4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, max: 100 } } }
    });

    const budgetCtx = document.getElementById('budgetChart');
    if (charts.budget) charts.budget.destroy();
    const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
    const totalSpent = projects.reduce((sum, p) => sum + (p.spent || 0), 0);
    charts.budget = new Chart(budgetCtx, {
        type: 'doughnut',
        data: {
            labels: ['Spent', 'Remaining'],
            datasets: [{
                data: [totalSpent, totalBudget - totalSpent],
                backgroundColor: ['#B4413C', '#ECEBD5'],
                borderWidth: 0
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}

// --- Projects ---
async function renderProjects() {
    const container = document.getElementById('projectsGrid');
    container.innerHTML = '<div class="loading">Loading projects...</div>';
    try {
        allProjects = await api.get('/projects');
        allUsers = await api.get('/users');

        if (allProjects.length === 0) {
            container.innerHTML = '<div class="no-data">No projects found.</div>';
            return;
        }

        container.innerHTML = allProjects.map(project => {
            const canEdit = currentUser.role !== 'Viewer';
            return `
        <div class="project-card">
          <div class="project-header">
            <h3 class="project-title">${project.name}</h3>
            <p class="project-description">${project.description || ''}</p>
          </div>
          <div class="project-meta">
            <div class="project-stats">
              <div class="project-stat">
                <div class="project-stat-value">$${((project.budget || 0) / 1000).toFixed(0)}k</div>
                <div class="project-stat-label">Budget</div>
              </div>
              <div class="project-stat">
                <div class="project-stat-value">${project.status || 'N/A'}</div>
                <div class="project-stat-label">Status</div>
              </div>
              <div class="project-stat">
                <div class="project-stat-value">${project.priority || 'N/A'}</div>
                <div class="project-stat-label">Priority</div>
              </div>
            </div>
            <div class="project-progress">
              <div class="progress-label"><span>Progress</span><span>${project.progress || 0}%</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width: ${project.progress || 0}%"></div></div>
            </div>
            ${canEdit ? `
              <div class="project-actions">
                <button class="btn btn--sm btn--outline" onclick="openProjectModal(${project.id})"><i class="fas fa-edit"></i> Edit</button>
                ${currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? `
                  <button class="btn btn--sm btn--outline text-error" onclick="deleteProject(${project.id})"><i class="fas fa-trash"></i> Delete</button>` : ''}
              </div>` : ''}
          </div>
        </div>`;
        }).join('');
    } catch (error) {
        container.innerHTML = `<div class="no-data">Error loading projects: ${error.message}</div>`;
    }
}

async function openProjectModal(projectId = null) {
    const modal = document.getElementById('projectModal');
    const form = document.getElementById('projectForm');
    const title = document.getElementById('projectModalTitle');
    form.reset();

    if (projectId) {
        const project = allProjects.find(p => p.id === projectId);
        if (project) {
            title.textContent = 'Edit Project';
            document.getElementById('projectId').value = project.id;
            document.getElementById('projectName').value = project.name;
            document.getElementById('projectDescription').value = project.description;
            document.getElementById('projectPriority').value = project.priority;
            document.getElementById('projectStatus').value = project.status;
            document.getElementById('projectStartDate').value = project.start_date ? project.start_date.split('T')[0] : '';
            document.getElementById('projectEndDate').value = project.end_date ? project.end_date.split('T')[0] : '';
            document.getElementById('projectBudget').value = project.budget;
        }
    } else {
        title.textContent = 'Create Project';
    }
    modal.classList.remove('hidden');
    form.onsubmit = handleProjectSubmit;
}

function closeProjectModal() {
    document.getElementById('projectModal').classList.add('hidden');
}

async function handleProjectSubmit(e) {
    e.preventDefault();
    const projectId = document.getElementById('projectId').value;
    const projectData = {
        name: document.getElementById('projectName').value,
        description: document.getElementById('projectDescription').value,
        priority: document.getElementById('projectPriority').value,
        status: document.getElementById('projectStatus').value,
        start_date: document.getElementById('projectStartDate').value || null,
        end_date: document.getElementById('projectEndDate').value || null,
        budget: parseFloat(document.getElementById('projectBudget').value) || 0,
        manager_id: currentUser.id,
        progress: document.getElementById('projectProgress')?.value || 0
    };

    try {
        if (projectId) {
            await api.put(`/projects/${projectId}`, projectData);
        } else {
            await api.post('/projects', projectData);
        }
        closeProjectModal();
        renderProjects();
    } catch (error) {
        alert(`Failed to save project: ${error.message}`);
    }
}

async function deleteProject(projectId) {
    if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
        try {
            await api.delete(`/projects/${projectId}`);
            renderProjects();
        } catch (error) {
            alert(`Failed to delete project: ${error.message}`);
        }
    }
}


// --- Tasks ---
async function renderTasks() {
    const container = document.getElementById('tasksList');
    const projectFilter = document.getElementById('taskProjectFilter');
    container.innerHTML = '<div class="loading">Loading tasks...</div>';

    try {
        allProjects = await api.get('/projects');
        allUsers = await api.get('/users');

        // Populate project filter
        projectFilter.innerHTML = '<option value="">All Projects</option>' +
            allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

        const selectedProjectId = projectFilter.value;
        const tasks = await api.get(`/tasks${selectedProjectId ? `?projectId=${selectedProjectId}` : ''}`);

        if (tasks.length === 0) {
            container.innerHTML = '<div class="no-data">No tasks found.</div>';
            return;
        }

        container.innerHTML = `
      <table class="tasks-table">
        <thead>
          <tr>
            <th>Task</th><th>Project</th><th>Assignee</th><th>Priority</th><th>Status</th><th>Due Date</th><th>Actions</th>
          </tr>
        </thead>
        <tbody>
          ${tasks.map(task => {
            const project = allProjects.find(p => p.id === task.project_id);
            const assignee = allUsers.find(u => u.id === task.assignee_id);
            const canEdit = currentUser.role !== 'Viewer';
            return `
              <tr>
                <td>
                  <div class="task-title">${task.title}</div>
                  <div class="task-description">${task.description || ''}</div>
                </td>
                <td>${project ? project.name : 'N/A'}</td>
                <td>${assignee ? assignee.name : 'Unassigned'}</td>
                <td>${task.priority || 'N/A'}</td>
                <td>${task.status || 'N/A'}</td>
                <td>${task.end_date ? task.end_date.split('T')[0] : 'N/A'}</td>
                <td>
                  ${canEdit ? `<button class="btn btn--sm btn--outline" onclick="openTaskModal(${task.id})"><i class="fas fa-edit"></i></button>` : ''}
                  ${currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? `<button class="btn btn--sm btn--outline text-error" onclick="deleteTask(${task.id})"><i class="fas fa-trash"></i></button>` : ''}
                </td>
              </tr>`;
        }).join('')}
        </tbody>
      </table>`;
    } catch (error) {
        container.innerHTML = `<div class="no-data">Error loading tasks: ${error.message}</div>`;
    }
}


function filterTasks() {
    renderTasks();
}

async function openTaskModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const form = document.getElementById('taskForm');
    const title = document.getElementById('taskModalTitle');
    form.reset();

    // Populate dropdowns
    const projectSelect = document.getElementById('taskProject');
    projectSelect.innerHTML = '<option value="">Select Project</option>' +
        allProjects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');

    const assigneeSelect = document.getElementById('taskAssignee');
    assigneeSelect.innerHTML = '<option value="">Select Assignee</option>' +
        allUsers.map(u => `<option value="${u.id}">${u.name}</option>`).join('');

    if (taskId) {
        const task = await api.get(`/tasks/${taskId}`);
        if (task) {
            title.textContent = 'Edit Task';
            document.getElementById('taskId').value = task.id;
            document.getElementById('taskTitle').value = task.title;
            document.getElementById('taskDescription').value = task.description;
            projectSelect.value = task.project_id;
            assigneeSelect.value = task.assignee_id;
            document.getElementById('taskPriority').value = task.priority;
            document.getElementById('taskStatus').value = task.status;
            document.getElementById('taskStartDate').value = task.start_date ? task.start_date.split('T')[0] : '';
            document.getElementById('taskEndDate').value = task.end_date ? task.end_date.split('T')[0] : '';
            document.getElementById('taskEstimatedHours').value = task.estimated_hours;
            document.getElementById('taskActualHours').value = task.actual_hours;
        }
    } else {
        title.textContent = 'Create Task';
    }
    modal.classList.remove('hidden');
    form.onsubmit = handleTaskSubmit;
}

function closeTaskModal() {
    document.getElementById('taskModal').classList.add('hidden');
}

async function handleTaskSubmit(e) {
    e.preventDefault();
    const taskId = document.getElementById('taskId').value;
    const taskData = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        project_id: parseInt(document.getElementById('taskProject').value),
        assignee_id: parseInt(document.getElementById('taskAssignee').value) || null,
        priority: document.getElementById('taskPriority').value,
        status: document.getElementById('taskStatus').value,
        start_date: document.getElementById('taskStartDate').value || null,
        end_date: document.getElementById('taskEndDate').value || null,
        estimated_hours: parseInt(document.getElementById('taskEstimatedHours').value) || 0,
        actual_hours: parseInt(document.getElementById('taskActualHours').value) || 0,
    };

    try {
        if (taskId) {
            await api.put(`/tasks/${taskId}`, taskData);
        } else {
            await api.post('/tasks', taskData);
        }
        closeTaskModal();
        renderTasks();
    } catch (error) {
        alert(`Failed to save task: ${error.message}`);
    }
}

async function deleteTask(taskId) {
    if (confirm('Are you sure you want to delete this task?')) {
        try {
            await api.delete(`/tasks/${taskId}`);
            renderTasks();
        } catch (error) {
            alert(`Failed to delete task: ${error.message}`);
        }
    }
}

// --- Users ---
async function renderUsers() {
    const container = document.getElementById('usersTable');
    container.innerHTML = '<div class="loading">Loading users...</div>';

    try {
        const users = await api.get('/users');
        container.innerHTML = `
      <table>
        <thead>
          <tr><th>User</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Actions</th></tr>
        </thead>
        <tbody>
          ${users.map(user => `
            <tr>
              <td>
                <div class="user-info">
                  <div class="user-avatar">${user.name.charAt(0)}</div>
                  <span>${user.name}</span>
                </div>
              </td>
              <td>${user.email}</td>
              <td><span class="user-role">${user.role}</span></td>
              <td><span class="status status--${user.status === 'Active' ? 'success' : 'error'}">${user.status}</span></td>
              <td>${user.last_login ? new Date(user.last_login).toLocaleString() : 'N/A'}</td>
              <td>
                <button class="btn btn--sm btn--outline" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> Edit</button>
                ${currentUser.role === 'Super Admin' && user.id !== currentUser.id ? `<button class="btn btn--sm btn--outline text-error" onclick="deleteUser(${user.id})"><i class="fas fa-trash"></i> Delete</button>` : ''}
              </td>
            </tr>`).join('')}
        </tbody>
      </table>`;
    } catch (error) {
        container.innerHTML = `<div class="no-data">Error loading users: ${error.message}</div>`;
    }
}

function editUser(userId) {
    alert("User editing functionality would be implemented here, likely opening a modal similar to projects/tasks.");
}

async function deleteUser(userId) {
    if (confirm('Are you sure you want to delete this user?')) {
        try {
            await api.delete(`/users/${userId}`);
            renderUsers();
        } catch(error) {
            alert(`Failed to delete user: ${error.message}`);
        }
    }
}
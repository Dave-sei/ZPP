// ProjectPro Application JavaScript

// Application State
let currentUser = null;
let isAuthenticated = false;
let currentPage = 'dashboard';
let charts = {};

// Mock Data - In a real app, this would come from API
const mockData = {
  users: [
    {
      id: 1,
      name: "John Smith",
      email: "admin@projectpro.com",
      role: "Super Admin",
      status: "Active",
      lastLogin: "2025-01-15T09:30:00Z",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.johnson@projectpro.com", 
      role: "Admin",
      status: "Active",
      lastLogin: "2025-01-15T08:15:00Z",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 3,
      name: "Mike Chen",
      email: "mike.chen@projectpro.com",
      role: "Moderator", 
      status: "Active",
      lastLogin: "2025-01-14T16:45:00Z",
      avatar: "/api/placeholder/40/40"
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@projectpro.com",
      role: "Viewer",
      status: "Active", 
      lastLogin: "2025-01-14T14:20:00Z",
      avatar: "/api/placeholder/40/40"
    }
  ],
  projects: [
    {
      id: 1,
      name: "Website Redesign",
      description: "Complete redesign of company website",
      status: "In Progress",
      priority: "High",
      startDate: "2025-01-01",
      endDate: "2025-03-31",
      budget: 150000,
      spent: 45000,
      progress: 30,
      managerId: 2,
      teamMembers: [2, 3, 4],
      category: "Web Development"
    },
    {
      id: 2,
      name: "Mobile App Development", 
      description: "Native iOS and Android mobile application",
      status: "Planning",
      priority: "Medium",
      startDate: "2025-02-15",
      endDate: "2025-08-15",
      budget: 300000,
      spent: 0,
      progress: 5,
      managerId: 1,
      teamMembers: [1, 2, 3],
      category: "Mobile Development"
    },
    {
      id: 3,
      name: "Data Migration",
      description: "Migrate legacy data to new system",
      status: "Completed", 
      priority: "High",
      startDate: "2024-10-01",
      endDate: "2024-12-31",
      budget: 75000,
      spent: 72000,
      progress: 100,
      managerId: 2,
      teamMembers: [2, 4],
      category: "Data Management"
    }
  ],
  tasks: [
    {
      id: 1,
      projectId: 1,
      title: "UI/UX Design",
      description: "Create wireframes and mockups",
      status: "In Progress",
      priority: "High",
      assigneeId: 3,
      startDate: "2025-01-01",
      endDate: "2025-01-31",
      progress: 75,
      estimatedHours: 120,
      actualHours: 90,
      dependencies: []
    },
    {
      id: 2,
      projectId: 1,
      title: "Frontend Development",
      description: "Implement React components",
      status: "Not Started",
      priority: "High", 
      assigneeId: 4,
      startDate: "2025-02-01",
      endDate: "2025-02-28",
      progress: 0,
      estimatedHours: 160,
      actualHours: 0,
      dependencies: [1]
    },
    {
      id: 3,
      projectId: 1,
      title: "Backend API",
      description: "Develop REST API endpoints",
      status: "Not Started",
      priority: "Medium",
      assigneeId: 2,
      startDate: "2025-02-15", 
      endDate: "2025-03-15",
      progress: 0,
      estimatedHours: 80,
      actualHours: 0,
      dependencies: [1]
    }
  ],
  customFields: [
    {
      id: 1,
      name: "Client Name",
      type: "text",
      required: true,
      appliesTo: ["projects"],
      options: []
    },
    {
      id: 2,
      name: "Technology Stack", 
      type: "dropdown",
      required: false,
      appliesTo: ["projects", "tasks"],
      options: ["React", "Node.js", "Python", "Java", ".NET"]
    },
    {
      id: 3,
      name: "Risk Level",
      type: "dropdown",
      required: false,
      appliesTo: ["tasks"],
      options: ["Low", "Medium", "High", "Critical"]
    }
  ],
  resources: [
    {
      id: 1,
      name: "Development Team",
      type: "Human Resource",
      availability: 80,
      hourlyRate: 75,
      skills: ["React", "Node.js", "JavaScript"]
    },
    {
      id: 2,
      name: "Design Team",
      type: "Human Resource", 
      availability: 60,
      hourlyRate: 65,
      skills: ["UI/UX", "Figma", "Adobe Creative Suite"]
    },
    {
      id: 3,
      name: "AWS Cloud Services",
      type: "Infrastructure",
      availability: 100,
      monthlyCost: 2500,
      description: "Cloud hosting and services"
    }
  ],
  jiraIntegration: {
    isConnected: false,
    serverUrl: "",
    username: "",
    apiToken: "",
    defaultProject: "",
    syncEnabled: false,
    webhookUrl: "",
    lastSync: null
  },
  dashboardData: {
    totalProjects: 15,
    activeProjects: 8,
    completedTasks: 245,
    pendingTasks: 67,
    totalBudget: 850000,
    budgetSpent: 425000,
    teamUtilization: 75
  }
};

// Application Initialization
document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

function initializeApp() {
  // Check if user is already authenticated (mock check)
  const savedUser = localStorage.getItem('projectpro_user');
  if (savedUser) {
    try {
      currentUser = JSON.parse(savedUser);
      isAuthenticated = true;
      showMainApp();
      initializeDashboard();
    } catch (e) {
      showAuthModal();
    }
  } else {
    showAuthModal();
  }
}

// Authentication
function showAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('mainApp').classList.add('hidden');
  
  // Setup form handler
  document.getElementById('authForm').onsubmit = handleAuth;
}

function closeAuthModal() {
  if (isAuthenticated) {
    document.getElementById('authModal').classList.add('hidden');
  }
}

function toggleAuthMode() {
  const isSignup = document.getElementById('authModalTitle').textContent === 'Sign Up';
  
  if (isSignup) {
    // Switch to login
    document.getElementById('authModalTitle').textContent = 'Login';
    document.getElementById('authSubmitText').textContent = 'Login';
    document.getElementById('authSwitchText').textContent = "Don't have an account?";
    document.getElementById('authSwitchBtn').textContent = 'Sign Up';
    document.getElementById('signupFields').classList.add('hidden');
  } else {
    // Switch to signup
    document.getElementById('authModalTitle').textContent = 'Sign Up';
    document.getElementById('authSubmitText').textContent = 'Sign Up';
    document.getElementById('authSwitchText').textContent = 'Already have an account?';
    document.getElementById('authSwitchBtn').textContent = 'Login';
    document.getElementById('signupFields').classList.remove('hidden');
  }
}

function handleAuth(e) {
  e.preventDefault();
  
  const email = document.getElementById('authEmail').value;
  const password = document.getElementById('authPassword').value;
  const isSignup = document.getElementById('authModalTitle').textContent === 'Sign Up';
  
  if (isSignup) {
    const name = document.getElementById('authName').value;
    const role = document.getElementById('authRole').value;
    
    // Create new user
    const newUser = {
      id: mockData.users.length + 1,
      name: name,
      email: email,
      role: role,
      status: 'Active',
      lastLogin: new Date().toISOString()
    };
    
    mockData.users.push(newUser);
    currentUser = newUser;
  } else {
    // Find user by email (mock authentication)
    currentUser = mockData.users.find(u => u.email === email) || mockData.users[0];
  }
  
  isAuthenticated = true;
  localStorage.setItem('projectpro_user', JSON.stringify(currentUser));
  
  showMainApp();
  closeAuthModal();
  initializeDashboard();
}

function showMainApp() {
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('mainApp').classList.remove('hidden');
  
  // Update user info
  document.getElementById('currentUserName').textContent = `Welcome, ${currentUser.name}`;
  document.getElementById('currentUserRole').textContent = currentUser.role;
  
  // Show/hide navigation based on role
  updateNavigationAccess();
}

function updateNavigationAccess() {
  const userRole = currentUser.role;
  const usersNavItem = document.getElementById('nav-users-li');
  
  // User management only for Super Admin and Admin
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
  
  // Reset form
  document.getElementById('authForm').reset();
  document.getElementById('authModalTitle').textContent = 'Login';
  document.getElementById('authSubmitText').textContent = 'Login';
  document.getElementById('signupFields').classList.add('hidden');
}

// Navigation
function showPage(pageId) {
  // Hide all pages
  document.querySelectorAll('.page-content').forEach(page => {
    page.classList.add('hidden');
  });
  
  // Remove active class from nav items
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Show selected page
  document.getElementById(pageId).classList.remove('hidden');
  
  // Add active class to nav item
  const navItem = document.getElementById(`nav-${pageId}`);
  if (navItem) {
    navItem.classList.add('active');
  }
  
  currentPage = pageId;
}

function showDashboard() {
  showPage('dashboard');
  renderDashboardCharts();
}

function showProjects() {
  showPage('projects');
  renderProjects();
}

function showTasks() {
  showPage('tasks');
  renderTasks();
}

function showResources() {
  showPage('resources');
  renderResources();
}

function showCustomFields() {
  showPage('customFields');
  renderCustomFields();
}

function showReports() {
  showPage('reports');
  renderReports();
}

function showUsers() {
  if (currentUser.role === 'Super Admin' || currentUser.role === 'Admin') {
    showPage('users');
    renderUsers();
  }
}

function showIntegrations() {
  showPage('integrations');
  renderIntegrations();
}

// Dashboard
function initializeDashboard() {
  // Update dashboard stats
  const stats = mockData.dashboardData;
  document.getElementById('totalProjects').textContent = stats.totalProjects;
  document.getElementById('activeProjects').textContent = stats.activeProjects;
  document.getElementById('completedTasks').textContent = stats.completedTasks;
  document.getElementById('pendingTasks').textContent = stats.pendingTasks;
  
  renderDashboardCharts();
}

function renderDashboardCharts() {
  // Project Progress Chart
  const projectCtx = document.getElementById('projectProgressChart');
  if (projectCtx && Chart.getChart(projectCtx)) {
    Chart.getChart(projectCtx).destroy();
  }
  
  if (projectCtx) {
    charts.projectProgress = new Chart(projectCtx, {
      type: 'bar',
      data: {
        labels: mockData.projects.map(p => p.name),
        datasets: [{
          label: 'Progress %',
          data: mockData.projects.map(p => p.progress),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C'],
          borderRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
  
  // Budget Chart
  const budgetCtx = document.getElementById('budgetChart');
  if (budgetCtx && Chart.getChart(budgetCtx)) {
    Chart.getChart(budgetCtx).destroy();
  }
  
  if (budgetCtx) {
    charts.budget = new Chart(budgetCtx, {
      type: 'doughnut',
      data: {
        labels: ['Spent', 'Remaining'],
        datasets: [{
          data: [mockData.dashboardData.budgetSpent, mockData.dashboardData.totalBudget - mockData.dashboardData.budgetSpent],
          backgroundColor: ['#B4413C', '#ECEBD5'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

// Projects
function renderProjects() {
  const container = document.getElementById('projectsGrid');
  const canEdit = currentUser.role !== 'Viewer';
  
  container.innerHTML = mockData.projects.map(project => {
    const manager = mockData.users.find(u => u.id === project.managerId);
    const statusClass = project.status.toLowerCase().replace(' ', '-');
    const priorityClass = `priority-${project.priority.toLowerCase()}`;
    
    return `
      <div class="project-card">
        <div class="project-header">
          <div class="flex justify-between items-start">
            <div>
              <h3 class="project-title">${project.name}</h3>
              <p class="project-description">${project.description}</p>
            </div>
            <div class="flex gap-8">
              <span class="status status--${getStatusClass(project.status)}">${project.status}</span>
              <span class="status ${priorityClass}">${project.priority}</span>
            </div>
          </div>
        </div>
        <div class="project-meta">
          <div class="project-stats">
            <div class="project-stat">
              <div class="project-stat-value">$${(project.budget / 1000).toFixed(0)}k</div>
              <div class="project-stat-label">Budget</div>
            </div>
            <div class="project-stat">
              <div class="project-stat-value">$${(project.spent / 1000).toFixed(0)}k</div>
              <div class="project-stat-label">Spent</div>
            </div>
            <div class="project-stat">
              <div class="project-stat-value">${project.teamMembers.length}</div>
              <div class="project-stat-label">Team</div>
            </div>
          </div>
          <div class="project-progress">
            <div class="progress-label">
              <span>Progress</span>
              <span>${project.progress}%</span>
            </div>
            <div class="progress-bar">
              <div class="progress-fill" style="width: ${project.progress}%"></div>
            </div>
          </div>
          ${canEdit ? `
            <div class="project-actions">
              <button class="btn btn--sm btn--outline" onclick="editProject(${project.id})">
                <i class="fas fa-edit"></i> Edit
              </button>
              ${currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? `
                <button class="btn btn--sm btn--outline text-error" onclick="deleteProject(${project.id})">
                  <i class="fas fa-trash"></i> Delete
                </button>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }).join('');
}

function getStatusClass(status) {
  switch (status) {
    case 'Completed': return 'success';
    case 'In Progress': return 'info';
    case 'Planning': return 'warning';
    case 'On Hold': return 'error';
    default: return 'info';
  }
}

function openProjectModal(projectId = null) {
  const canEdit = currentUser.role !== 'Viewer';
  if (!canEdit) return;
  
  const modal = document.getElementById('projectModal');
  const form = document.getElementById('projectForm');
  const title = document.getElementById('projectModalTitle');
  
  if (projectId) {
    const project = mockData.projects.find(p => p.id === projectId);
    if (project) {
      title.textContent = 'Edit Project';
      document.getElementById('projectId').value = project.id;
      document.getElementById('projectName').value = project.name;
      document.getElementById('projectDescription').value = project.description;
      document.getElementById('projectPriority').value = project.priority;
      document.getElementById('projectStatus').value = project.status;
      document.getElementById('projectStartDate').value = project.startDate;
      document.getElementById('projectEndDate').value = project.endDate;
      document.getElementById('projectBudget').value = project.budget;
    }
  } else {
    title.textContent = 'Create Project';
    form.reset();
  }
  
  modal.classList.remove('hidden');
  form.onsubmit = handleProjectSubmit;
}

function closeProjectModal() {
  document.getElementById('projectModal').classList.add('hidden');
}

function handleProjectSubmit(e) {
  e.preventDefault();
  
  const formData = new FormData(e.target);
  const projectData = {
    name: document.getElementById('projectName').value,
    description: document.getElementById('projectDescription').value,
    priority: document.getElementById('projectPriority').value,
    status: document.getElementById('projectStatus').value,
    startDate: document.getElementById('projectStartDate').value,
    endDate: document.getElementById('projectEndDate').value,
    budget: parseInt(document.getElementById('projectBudget').value) || 0
  };
  
  const projectId = document.getElementById('projectId').value;
  
  if (projectId) {
    // Update existing project
    const index = mockData.projects.findIndex(p => p.id == projectId);
    if (index !== -1) {
      mockData.projects[index] = { ...mockData.projects[index], ...projectData };
    }
  } else {
    // Create new project
    const newProject = {
      id: Math.max(...mockData.projects.map(p => p.id)) + 1,
      ...projectData,
      progress: 0,
      spent: 0,
      managerId: currentUser.id,
      teamMembers: [currentUser.id],
      category: 'General'
    };
    mockData.projects.push(newProject);
  }
  
  closeProjectModal();
  renderProjects();
}

function editProject(projectId) {
  openProjectModal(projectId);
}

function deleteProject(projectId) {
  if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') return;
  
  if (confirm('Are you sure you want to delete this project?')) {
    const index = mockData.projects.findIndex(p => p.id === projectId);
    if (index !== -1) {
      mockData.projects.splice(index, 1);
      renderProjects();
    }
  }
}

// Tasks
function renderTasks() {
  const container = document.getElementById('tasksList');
  const projectFilter = document.getElementById('taskProjectFilter');
  
  // Populate project filter
  projectFilter.innerHTML = '<option value="">All Projects</option>' +
    mockData.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  
  const selectedProjectId = projectFilter.value;
  const filteredTasks = selectedProjectId ? 
    mockData.tasks.filter(t => t.projectId == selectedProjectId) : 
    mockData.tasks;
  
  const canEdit = currentUser.role !== 'Viewer';
  
  container.innerHTML = `
    <table class="tasks-table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Project</th>
          <th>Assignee</th>
          <th>Priority</th>
          <th>Status</th>
          <th>Progress</th>
          <th>Due Date</th>
          ${canEdit ? '<th>Actions</th>' : ''}
        </tr>
      </thead>
      <tbody>
        ${filteredTasks.map(task => {
          const project = mockData.projects.find(p => p.id === task.projectId);
          const assignee = mockData.users.find(u => u.id === task.assigneeId);
          const priorityClass = `priority-${task.priority.toLowerCase()}`;
          
          return `
            <tr>
              <td>
                <div class="task-title">${task.title}</div>
                <div class="task-description">${task.description}</div>
              </td>
              <td>${project ? project.name : 'Unknown'}</td>
              <td>
                ${assignee ? `
                  <div class="task-assignee">
                    <div class="task-avatar">${assignee.name.charAt(0)}</div>
                    <span>${assignee.name}</span>
                  </div>
                ` : 'Unassigned'}
              </td>
              <td class="${priorityClass}">${task.priority}</td>
              <td><span class="status status--${getStatusClass(task.status)}">${task.status}</span></td>
              <td>
                <div class="progress-bar" style="width: 100px; height: 4px;">
                  <div class="progress-fill" style="width: ${task.progress}%"></div>
                </div>
                <small>${task.progress}%</small>
              </td>
              <td>${task.endDate}</td>
              ${canEdit ? `
                <td>
                  <button class="btn btn--sm btn--outline" onclick="editTask(${task.id})">
                    <i class="fas fa-edit"></i>
                  </button>
                  ${currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? `
                    <button class="btn btn--sm btn--outline text-error" onclick="deleteTask(${task.id})">
                      <i class="fas fa-trash"></i>
                    </button>
                  ` : ''}
                </td>
              ` : ''}
            </tr>
          `;
        }).join('')}
      </tbody>
    </table>
  `;
}

function filterTasks() {
  renderTasks();
}

function openTaskModal(taskId = null) {
  const canEdit = currentUser.role !== 'Viewer';
  if (!canEdit) return;
  
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  const title = document.getElementById('taskModalTitle');
  
  // Populate project and assignee dropdowns
  const projectSelect = document.getElementById('taskProject');
  const assigneeSelect = document.getElementById('taskAssignee');
  
  projectSelect.innerHTML = '<option value="">Select Project</option>' +
    mockData.projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
  
  assigneeSelect.innerHTML = '<option value="">Select Assignee</option>' +
    mockData.users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
  
  if (taskId) {
    const task = mockData.tasks.find(t => t.id === taskId);
    if (task) {
      title.textContent = 'Edit Task';
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskDescription').value = task.description;
      document.getElementById('taskProject').value = task.projectId;
      document.getElementById('taskAssignee').value = task.assigneeId;
      document.getElementById('taskPriority').value = task.priority;
      document.getElementById('taskStatus').value = task.status;
      document.getElementById('taskStartDate').value = task.startDate;
      document.getElementById('taskEndDate').value = task.endDate;
      document.getElementById('taskEstimatedHours').value = task.estimatedHours;
      document.getElementById('taskActualHours').value = task.actualHours;
    }
  } else {
    title.textContent = 'Create Task';
    form.reset();
  }
  
  modal.classList.remove('hidden');
  form.onsubmit = handleTaskSubmit;
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.add('hidden');
}

function handleTaskSubmit(e) {
  e.preventDefault();
  
  const taskData = {
    title: document.getElementById('taskTitle').value,
    description: document.getElementById('taskDescription').value,
    projectId: parseInt(document.getElementById('taskProject').value),
    assigneeId: parseInt(document.getElementById('taskAssignee').value) || null,
    priority: document.getElementById('taskPriority').value,
    status: document.getElementById('taskStatus').value,
    startDate: document.getElementById('taskStartDate').value,
    endDate: document.getElementById('taskEndDate').value,
    estimatedHours: parseInt(document.getElementById('taskEstimatedHours').value) || 0,
    actualHours: parseInt(document.getElementById('taskActualHours').value) || 0
  };
  
  const taskId = document.getElementById('taskId').value;
  
  if (taskId) {
    // Update existing task
    const index = mockData.tasks.findIndex(t => t.id == taskId);
    if (index !== -1) {
      mockData.tasks[index] = { ...mockData.tasks[index], ...taskData };
    }
  } else {
    // Create new task
    const newTask = {
      id: Math.max(...mockData.tasks.map(t => t.id)) + 1,
      ...taskData,
      progress: 0,
      dependencies: []
    };
    mockData.tasks.push(newTask);
  }
  
  closeTaskModal();
  renderTasks();
}

function editTask(taskId) {
  openTaskModal(taskId);
}

function deleteTask(taskId) {
  if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') return;
  
  if (confirm('Are you sure you want to delete this task?')) {
    const index = mockData.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      mockData.tasks.splice(index, 1);
      renderTasks();
    }
  }
}

// Resources
function renderResources() {
  const container = document.getElementById('resourcesGrid');
  const canEdit = currentUser.role !== 'Viewer';
  
  container.innerHTML = mockData.resources.map(resource => `
    <div class="resource-card">
      <div class="resource-header">
        <div class="resource-icon">
          <i class="fas fa-${resource.type === 'Human Resource' ? 'users' : 'server'}"></i>
        </div>
        <div>
          <h3 class="resource-name">${resource.name}</h3>
          <p class="resource-type">${resource.type}</p>
        </div>
      </div>
      
      <div class="resource-availability">
        <div class="availability-label">
          Availability: ${resource.availability}%
        </div>
        <div class="availability-bar">
          <div class="availability-fill" style="width: ${resource.availability}%"></div>
        </div>
      </div>
      
      <div class="resource-details">
        ${resource.hourlyRate ? `<p><strong>Rate:</strong> $${resource.hourlyRate}/hour</p>` : ''}
        ${resource.monthlyCost ? `<p><strong>Monthly Cost:</strong> $${resource.monthlyCost}</p>` : ''}
        ${resource.skills ? `<p><strong>Skills:</strong> ${resource.skills.join(', ')}</p>` : ''}
        ${resource.description ? `<p>${resource.description}</p>` : ''}
      </div>
      
      ${canEdit ? `
        <div class="resource-actions mt-16">
          <button class="btn btn--sm btn--outline" onclick="editResource(${resource.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? `
            <button class="btn btn--sm btn--outline text-error" onclick="deleteResource(${resource.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function openResourceModal() {
  // Placeholder for resource modal
  alert('Resource creation/editing functionality would be implemented here');
}

function editResource(resourceId) {
  openResourceModal();
}

function deleteResource(resourceId) {
  if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') return;
  
  if (confirm('Are you sure you want to delete this resource?')) {
    const index = mockData.resources.findIndex(r => r.id === resourceId);
    if (index !== -1) {
      mockData.resources.splice(index, 1);
      renderResources();
    }
  }
}

// Custom Fields
function renderCustomFields() {
  const container = document.getElementById('customFieldsList');
  const canEdit = currentUser.role !== 'Viewer';
  
  container.innerHTML = mockData.customFields.map(field => `
    <div class="custom-field-item">
      <div class="custom-field-info">
        <h4>${field.name}</h4>
        <div class="custom-field-details">
          <span><strong>Type:</strong> ${field.type}</span>
          <span><strong>Required:</strong> ${field.required ? 'Yes' : 'No'}</span>
          <span><strong>Applies To:</strong> ${field.appliesTo.join(', ')}</span>
          ${field.options.length > 0 ? `<span><strong>Options:</strong> ${field.options.join(', ')}</span>` : ''}
        </div>
      </div>
      ${canEdit ? `
        <div class="custom-field-actions">
          <button class="btn btn--sm btn--outline" onclick="editCustomField(${field.id})">
            <i class="fas fa-edit"></i> Edit
          </button>
          ${currentUser.role === 'Super Admin' || currentUser.role === 'Admin' ? `
            <button class="btn btn--sm btn--outline text-error" onclick="deleteCustomField(${field.id})">
              <i class="fas fa-trash"></i> Delete
            </button>
          ` : ''}
        </div>
      ` : ''}
    </div>
  `).join('');
}

function openCustomFieldModal() {
  alert('Custom field creation/editing functionality would be implemented here');
}

function editCustomField(fieldId) {
  openCustomFieldModal();
}

function deleteCustomField(fieldId) {
  if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') return;
  
  if (confirm('Are you sure you want to delete this custom field?')) {
    const index = mockData.customFields.findIndex(f => f.id === fieldId);
    if (index !== -1) {
      mockData.customFields.splice(index, 1);
      renderCustomFields();
    }
  }
}

// Reports
function renderReports() {
  // Team Utilization Chart
  const utilizationCtx = document.getElementById('utilizationChart');
  if (utilizationCtx && Chart.getChart(utilizationCtx)) {
    Chart.getChart(utilizationCtx).destroy();
  }
  
  if (utilizationCtx) {
    new Chart(utilizationCtx, {
      type: 'radar',
      data: {
        labels: mockData.users.map(u => u.name),
        datasets: [{
          label: 'Utilization %',
          data: [85, 75, 90, 60],
          backgroundColor: 'rgba(31, 184, 205, 0.2)',
          borderColor: '#1FB8CD',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true,
            max: 100
          }
        }
      }
    });
  }
  
  // Status Distribution Chart
  const statusCtx = document.getElementById('statusChart');
  if (statusCtx && Chart.getChart(statusCtx)) {
    Chart.getChart(statusCtx).destroy();
  }
  
  if (statusCtx) {
    const statusCounts = {};
    mockData.projects.forEach(p => {
      statusCounts[p.status] = (statusCounts[p.status] || 0) + 1;
    });
    
    new Chart(statusCtx, {
      type: 'pie',
      data: {
        labels: Object.keys(statusCounts),
        datasets: [{
          data: Object.values(statusCounts),
          backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
}

// Users
function renderUsers() {
  if (currentUser.role !== 'Super Admin' && currentUser.role !== 'Admin') return;
  
  const container = document.getElementById('usersTable');
  
  container.innerHTML = `
    <table>
      <thead>
        <tr>
          <th>User</th>
          <th>Email</th>
          <th>Role</th>
          <th>Status</th>
          <th>Last Login</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        ${mockData.users.map(user => `
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
            <td>${new Date(user.lastLogin).toLocaleDateString()}</td>
            <td>
              <button class="btn btn--sm btn--outline" onclick="editUser(${user.id})">
                <i class="fas fa-edit"></i> Edit
              </button>
              ${currentUser.role === 'Super Admin' && user.id !== currentUser.id ? `
                <button class="btn btn--sm btn--outline text-error" onclick="deleteUser(${user.id})">
                  <i class="fas fa-trash"></i> Delete
                </button>
              ` : ''}
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function openUserModal() {
  alert('User creation/editing functionality would be implemented here');
}

function editUser(userId) {
  openUserModal();
}

function deleteUser(userId) {
  if (currentUser.role !== 'Super Admin') return;
  
  if (confirm('Are you sure you want to delete this user?')) {
    const index = mockData.users.findIndex(u => u.id === userId);
    if (index !== -1) {
      mockData.users.splice(index, 1);
      renderUsers();
    }
  }
}

// Integrations
function renderIntegrations() {
  const jiraStatus = document.getElementById('jiraStatus');
  const integration = mockData.jiraIntegration;
  
  if (integration.isConnected) {
    jiraStatus.innerHTML = '<span class="status status--success">Connected</span>';
  } else {
    jiraStatus.innerHTML = '<span class="status status--error">Disconnected</span>';
  }
}

function openJiraModal() {
  const modal = document.getElementById('jiraModal');
  const form = document.getElementById('jiraForm');
  const integration = mockData.jiraIntegration;
  
  // Populate form with existing data
  document.getElementById('jiraServerUrl').value = integration.serverUrl;
  document.getElementById('jiraUsername').value = integration.username;
  document.getElementById('jiraApiToken').value = integration.apiToken;
  document.getElementById('jiraDefaultProject').value = integration.defaultProject;
  document.getElementById('jiraSyncEnabled').checked = integration.syncEnabled;
  
  modal.classList.remove('hidden');
  form.onsubmit = handleJiraSubmit;
}

function closeJiraModal() {
  document.getElementById('jiraModal').classList.add('hidden');
}

function handleJiraSubmit(e) {
  e.preventDefault();
  
  // Update JIRA integration settings
  mockData.jiraIntegration = {
    isConnected: true,
    serverUrl: document.getElementById('jiraServerUrl').value,
    username: document.getElementById('jiraUsername').value,
    apiToken: document.getElementById('jiraApiToken').value,
    defaultProject: document.getElementById('jiraDefaultProject').value,
    syncEnabled: document.getElementById('jiraSyncEnabled').checked,
    webhookUrl: `${window.location.origin}/webhook/jira`,
    lastSync: new Date().toISOString()
  };
  
  closeJiraModal();
  renderIntegrations();
  alert('JIRA integration configured successfully!');
}
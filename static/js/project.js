// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

const csrftoken = getCookie('csrftoken');
// Fetch and display project data as full-width cards
async function fetchProjectData() {
    try {
        const response = await fetch('/api/project/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}` // Include token for authentication
            }
        });
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const userDataDiv = document.getElementById('user-data');
        const loadingDiv = document.getElementById('loading');

        if (data.length > 0) {
            let formattedData = `<div class="card-container">`; // Card container for full-width cards
            data.forEach(project => {
                formattedData += `
                    <div class="project-card" id="project-${project.id}">
                        <h3>${project.name}</h3>
                        <p>${project.description}</p>
                        <a href="/projects/${project.id}/">Go to Project</a>
                        <div class="card-actions">
                            <button class="edit-btn" onclick="loadProjectForUpdate(${project.id})">Edit</button>
                            <button class="delete-btn" onclick="deleteProject(${project.id})">Delete</button>
                        </div>
                    </div>
                `;
            });
            formattedData += `</div>`;
            userDataDiv.innerHTML = formattedData;
        } else {
            userDataDiv.innerHTML = `<p>No projects found.</p>`;
        }

        loadingDiv.style.display = 'none';
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        document.getElementById('loading').textContent = 'Failed to load project data.';
    }
}

fetchProjectData();




// Create a new project
async function createProject(event) {
    event.preventDefault();

    const name = document.getElementById('name').value;
    const description = document.getElementById('description').value;

    const projectData = {
        name: name,
        description: description,
    };

    try {
        const response = await fetch('/api/project/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,  // Include CSRF token
                'Authorization': `Token ${localStorage.getItem('token')}` // Include token for authentication
            },
            body: JSON.stringify(projectData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Project created:', data);
            fetchProjectData();
            document.getElementById('create-project-form').reset();
            document.getElementById('createProjectModal').style.display = 'none';
        } else {
            const errorData = await response.json();
            console.error('Error creating project:', errorData);
            alert('Failed to create project: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Error with create operation:', error);
        alert('An error occurred while creating the project.');
    }
}

document.getElementById('create-project-form').addEventListener('submit', createProject);

// Update an existing project
async function updateProject(event) {
    event.preventDefault();

    const projectId = document.getElementById('update-project-id').value;
    const name = document.getElementById('update-name').value;
    const description = document.getElementById('update-description').value;

    const projectData = {
        name: name,
        description: description,
    };

    try {
        const response = await fetch(`/api/project/${projectId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,  // Include CSRF token
                'Authorization': `Token ${localStorage.getItem('token')}` // Include token for authentication
            },
            body: JSON.stringify(projectData),
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Project updated:', data);
            fetchProjectData();
            document.getElementById('update-project-form').reset();
            document.getElementById('updateProjectModal').style.display = 'none';
        } else {
            const errorData = await response.json();
            console.error('Error updating project:', errorData);
            alert('Failed to update project: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Error with update operation:', error);
        alert('An error occurred while updating the project.');
    }
}

document.getElementById('update-project-form').addEventListener('submit', updateProject);

// Delete a project
async function deleteProject(projectId) {
    const confirmDelete = confirm("Are you sure you want to delete this project?");
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/project/${projectId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,  // Include CSRF token
                    'Authorization': `Token ${localStorage.getItem('token')}` // Include token for authentication
                },
            });

            if (response.ok) {
                console.log(`Project with ID ${projectId} deleted.`);
                fetchProjectData();
            } else {
                const errorData = await response.json();
                console.error('Error deleting project:', errorData);
                alert('Failed to delete project: ' + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error('Error with delete operation:', error);
            alert('An error occurred while deleting the project.');
        }
    }
}

// Open and close modals
document.getElementById('openCreateModalBtn').addEventListener('click', () => {
    document.getElementById('createProjectModal').style.display = 'flex';
});

document.getElementById('closeCreateModal').addEventListener('click', () => {
    document.getElementById('createProjectModal').style.display = 'none';
});

document.getElementById('closeUpdateModal').addEventListener('click', () => {
    document.getElementById('updateProjectModal').style.display = 'none';
});

// Load project data into update form
function loadProjectForUpdate(projectId) {
    const projectDiv = document.getElementById(`project-${projectId}`);
    if (projectDiv) {
        // Access the content directly from the project card elements
        const name = projectDiv.querySelector('h3').textContent.trim(); // Get the name from the <h3> element
        const description = projectDiv.querySelector('p').textContent.trim(); // Get the description from the <p> element

        // Set the values in the update modal form
        document.getElementById('update-project-id').value = projectId;
        document.getElementById('update-name').value = name;
        document.getElementById('update-description').value = description;

        // Display the update modal
        document.getElementById('updateProjectModal').style.display = 'flex';
    }
}


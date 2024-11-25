// Fetch CSRF token helper
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


const fetchUsers = async () => {
    try {
        const response = await fetch('/api/user/', {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch users');
        }

        const users = await response.json();
        const userSelect = document.getElementById('todo-assigned-to');

        // Clear existing options
        userSelect.innerHTML = '<option value="">Select a user</option>';

        users.forEach(user => {
            const option = document.createElement('option');
            option.value = user.id;
            option.textContent = `${user.first_name} ${user.last_name}`;
            userSelect.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching users:', error);
    }
};

fetchUsers();

// Render ToDos and their Sub-Todos
function renderToDos(data) {
    document.querySelectorAll('.kanban-items').forEach(column => {
        column.innerHTML = ''; // Clear existing content
    });

    // Recursive function to render ToDo hierarchy
    function renderHierarchy(todo, container) {
        const todoItem = document.createElement('div');
        todoItem.className = 'kanban-item';
        todoItem.dataset.todoId = todo.id;
    
        const todoContent = document.createElement('span');
        todoContent.textContent = todo.title;
        todoItem.appendChild(todoContent);
    
        // Add edit button
        const editButton = document.createElement('button');
        editButton.className = 'edit-btn';
        editButton.innerHTML = `<i class="fas fa-pen"></i>`;
        editButton.addEventListener('click', () => loadTodoForUpdate(todo.id));
        todoItem.appendChild(editButton);
    
        container.appendChild(todoItem);
    
        // Render sub-todos recursively
        if (todo.sub_todos && todo.sub_todos.length > 0) {
            const subTodosContainer = document.createElement('div');
            subTodosContainer.style.marginLeft = '20px'; // Indentation for hierarchy
    
            todo.sub_todos.forEach(subTodo => {
                renderHierarchy(subTodo, subTodosContainer);
            });
    
            container.appendChild(subTodosContainer);
        }
    }
    
    

    data.forEach(todo => {
        if (!todo.parent_id) {
            const column = document.getElementById(`${todo.status}-items`);
            if (column) {
                renderHierarchy(todo, column);
            }
        }
    });
}

async function fetchToDos(projectId, statuses = []) {

    try {
        const url = new URL(`/api/todo/`, window.location.origin);
        url.searchParams.append('project', projectId);
        if (statuses.length > 0) {
            statuses.forEach(status => url.searchParams.append('statuses', status));
        }

        const response = await fetch(url, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch ToDos: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();

        renderToDos(data);

        // Populate Parent ToDo dropdown
        const parentDropdown = document.getElementById('todo-parent');
        parentDropdown.innerHTML = '<option value="">None</option>';
        data.forEach(todo => {
            const option = document.createElement('option');
            option.value = todo.id;
            option.textContent = todo.title;
            parentDropdown.appendChild(option);
        });
    } catch (error) {
        console.error('Error fetching ToDos:', error);
    }
}


// Create a new ToDo
async function createToDo(event) {
    event.preventDefault();

    const projectId = document.getElementById('todo-project-id').value;
    const title = document.getElementById('todo-title').value;
    const description = document.getElementById('todo-description').value;
    const assignedTo = document.getElementById('todo-assigned-to').value;
    const critical = document.getElementById('todo-critical').value;
    const points = document.getElementById('todo-points').value;
    const parent = document.getElementById('todo-parent').value || null;
    const dateEnd = document.getElementById('todo-date-end').value || null;

    const todoData = {
        project: projectId,
        title: title,
        description: description,
        assigned_to_id: assignedTo,
        critical: critical,
        points: points,
        parent_id: parent,
        date_end: dateEnd,
    };


    try {
        const response = await fetch('/api/todo/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'Authorization': `Token ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(todoData)
        });

        if (response.ok) {
            const data = await response.json();
            fetchToDos(projectId);
            document.getElementById('create-todo-form').reset();
            document.getElementById('createTodoModal').style.display = 'none';
        } else {
            const errorData = await response.json();
            alert('Failed to create ToDo: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        alert('An error occurred while creating the ToDo.');
    }
}



document.getElementById('create-todo-form').addEventListener('submit', createToDo);

// Delete a ToDo
async function deleteToDo(todoId) {
    const confirmDelete = confirm("Are you sure you want to delete this ToDo?");
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/todo/${todoId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken,
                    'Authorization': `Token ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const projectId = document.getElementById('todo-project-id').value;
                fetchToDos(projectId);
            } else {
                const errorData = await response.json();
                alert('Failed to delete ToDo: ' + JSON.stringify(errorData));
            }
        } catch (error) {
            alert('An error occurred while deleting the ToDo.');
        }
    }
}

// Open the Update ToDo modal
function openUpdateTodoModal(todo) {
    document.getElementById('update-todo-id').value = todo.id;
    document.getElementById('update-todo-title').value = todo.title;
    document.getElementById('update-todo-description').value = todo.description;
    document.getElementById('update-todo-assigned-to').value = todo.assigned_to.id;
    document.getElementById('update-todo-critical').value = todo.critical;
    document.getElementById('update-todo-points').value = todo.points;
    document.getElementById('updateTodoModal').style.display = 'flex';
}

// Fetch a specific ToDo and open the modal
async function loadTodoForUpdate(todoId) {
    try {
        const response = await fetch(`/api/todo/${todoId}/`, {
            headers: {
                'Authorization': `Token ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch ToDo');
        }

        const todo = await response.json();

        // Populate the update modal with ToDo data
        document.getElementById('update-todo-id').value = todo.id;
        document.getElementById('update-todo-title').value = todo.title;
        document.getElementById('update-todo-description').value = todo.description;
        document.getElementById('update-todo-assigned-to').value = todo.assigned_to.id;
        document.getElementById('update-todo-critical').value = todo.critical;
        document.getElementById('update-todo-points').value = todo.points;
        document.getElementById('update-todo-date-end').value = todo.date_end || '';

        // Open the modal
        document.getElementById('updateTodoModal').style.display = 'flex';
    } catch (error) {
        console.error('Error fetching ToDo:', error);
    }
}



// Update a ToDo
async function updateToDo(event) {
    event.preventDefault();

    const todoId = document.getElementById('update-todo-id').value;
    const title = document.getElementById('update-todo-title').value;
    const description = document.getElementById('update-todo-description').value;
    const assignedTo = document.getElementById('update-todo-assigned-to').value;
    const critical = document.getElementById('update-todo-critical').value;
    const points = document.getElementById('update-todo-points').value;
    const projectId = document.getElementById('todo-project-id').value;
    const dateEnd = document.getElementById('update-todo-date-end').value || null;

    const todoData = {
        project: projectId,
        title: title,
        description: description,
        assigned_to_id: assignedTo,
        critical: critical,
        points: points,
        date_end: dateEnd,
    };

    try {
        const response = await fetch(`/api/todo/${todoId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
                'Authorization': `Token ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(todoData)
        });

        if (response.ok) {
            const data = await response.json();
            fetchToDos(projectId);
            document.getElementById('updateTodoModal').style.display = 'none';
        } else {
            const errorData = await response.json();
            alert('Failed to update ToDo: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        alert('An error occurred while updating the ToDo.');
    }
}


document.getElementById('update-todo-form').addEventListener('submit', updateToDo);

// Close the Update modal
document.getElementById('closeUpdateTodoModal').addEventListener('click', () => {
    document.getElementById('updateTodoModal').style.display = 'none';
});


// Open and close modals
document.getElementById('openCreateTodoModalBtn').addEventListener('click', () => {
    document.getElementById('createTodoModal').style.display = 'flex';
    const projectId = document.getElementById('todo-project-id').value; // Get current project ID
    fetchToDos(projectId);
});

document.getElementById('closeCreateTodoModal').addEventListener('click', () => {
    document.getElementById('createTodoModal').style.display = 'none';
});

// Initial load
const projectId = document.getElementById('todo-project-id').value;
fetchToDos(projectId);

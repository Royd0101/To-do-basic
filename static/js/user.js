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

// Fetch user data and display it
async function fetchUserData() {
    try {
        const response = await fetch('/api/user/');
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const userDataDiv = document.getElementById('user-data');
        const loadingDiv = document.getElementById('loading');

        if (data.length > 0) {
            // Create a table structure
            let formattedData = `
                <h3>User Information</h3>
                <table class="user-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>First Name</th>
                            <th>Last Name</th>
                            <th>Email</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            data.forEach(user => {
                formattedData += `
                    <tr id="user-${user.id}">
                        <td>${user.id}</td>
                        <td>${user.first_name}</td>
                        <td>${user.last_name}</td>
                        <td>${user.email}</td>
                        <td>
                            <i class="fas fa-edit update-icon" onclick="loadUserForUpdate(${user.id})" title="Update"></i>
                            <i class="fas fa-trash delete-icon" onclick="deleteUser(${user.id})" title="Delete"></i>
                        </td>
                    </tr>
                `;
            });
            formattedData += `
                    </tbody>
                </table>
            `;

            userDataDiv.innerHTML = formattedData;
        } else {
            userDataDiv.innerHTML = `<p>No users found.</p>`;
        }

        loadingDiv.style.display = 'none'; // Hide loading message when data is fetched
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        const loadingDiv = document.getElementById('loading');
        loadingDiv.textContent = 'Failed to load user data.';
    }
}


fetchUserData(); // Fetch user data on page load

// Function to load user data for updating
function loadUserForUpdate(userId) {
    const userDiv = document.getElementById(`user-${userId}`);
    if (userDiv) {
        document.getElementById('update-user-id').value = userId;
        document.getElementById('update-first_name').value = userDiv.querySelector('p:nth-child(1)').textContent.replace('First Name:', '').trim();
        document.getElementById('update-last_name').value = userDiv.querySelector('p:nth-child(2)').textContent.replace('Last Name:', '').trim();
        document.getElementById('update-email').value = userDiv.querySelector('p:nth-child(3)').textContent.replace('Email:', '').trim();
    }

    // Open the Update Modal
    document.getElementById('updateUserModal').style.display = 'flex';
}

// Function to update user data
async function updateUser(event) {
    event.preventDefault();

    const userId = document.getElementById('update-user-id').value;
    const firstName = document.getElementById('update-first_name').value;
    const lastName = document.getElementById('update-last_name').value;
    const email = document.getElementById('update-email').value;
    const password = document.getElementById('update-password').value;

    const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password ? password : undefined, // Only send password if entered
    };

    try {
        const response = await fetch(`/api/user/${userId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User updated:', data);
            fetchUserData(); // Re-fetch user data to update the list
            document.getElementById('update-user-form').reset(); // Reset the update form
            document.getElementById('updateUserModal').style.display = 'none'; // Close the modal
        } else {
            const errorData = await response.json();
            console.error('Error updating user:', errorData);
            alert('Failed to update user: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Error with update operation:', error);
        alert('An error occurred while updating the user.');
    }
}

// Function to create a new user
async function createUser(event) {
    event.preventDefault();

    const firstName = document.getElementById('first_name').value;
    const lastName = document.getElementById('last_name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const userData = {
        first_name: firstName,
        last_name: lastName,
        email: email,
        password: password,
    };

    try {
        const response = await fetch('/api/user/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken,
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User created:', data);
            fetchUserData(); // Re-fetch user data to update the list
            document.getElementById('create-user-form').reset(); // Reset the create form
            document.getElementById('createUserModal').style.display = 'none'; // Close the modal
        } else {
            const errorData = await response.json();
            console.error('Error creating user:', errorData);
            alert('Failed to create user: ' + JSON.stringify(errorData));
        }
    } catch (error) {
        console.error('Error with create operation:', error);
        alert('An error occurred while creating the user.');
    }
}

// Function to delete a user
async function deleteUser(userId) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/user/${userId}/`, {
                method: 'DELETE',
                headers: {
                    'X-CSRFToken': csrftoken, // Include CSRF token
                },
            });

            if (response.ok) {
                console.log(`User with ID ${userId} deleted.`);
                fetchUserData(); // Re-fetch user data to update the list
            } else {
                const errorData = await response.json();
                console.error('Error deleting user:', errorData);
                alert('Failed to delete user: ' + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error('Error with delete operation:', error);
            alert('An error occurred while deleting the user.');
        }
    }
}

// Attach event listeners for form submissions
document.getElementById('create-user-form').addEventListener('submit', createUser);
document.getElementById('update-user-form').addEventListener('submit', updateUser);

// Open the create user modal
document.getElementById('openCreateModalBtn').addEventListener('click', () => {
    const createModal = document.getElementById('createUserModal');
    createModal.style.display = 'flex';
});

// Close the create user modal
document.getElementById('closeCreateModal').addEventListener('click', () => {
    const createModal = document.getElementById('createUserModal');
    createModal.style.display = 'none';
});

// Open the update user modal
function loadUserForUpdate(userId) {
    const userDiv = document.getElementById(`user-${userId}`);
    if (userDiv) {
        document.getElementById('update-user-id').value = userId;
        document.getElementById('update-first_name').value = userDiv.querySelector('td:nth-child(2)').textContent.trim();
        document.getElementById('update-last_name').value = userDiv.querySelector('td:nth-child(3)').textContent.trim();
        document.getElementById('update-email').value = userDiv.querySelector('td:nth-child(4)').textContent.trim();

        const updateModal = document.getElementById('updateUserModal');
        updateModal.style.display = 'flex';
    }
}

document.getElementById('closeUpdateModal').addEventListener('click', () => {
    const updateModal = document.getElementById('updateUserModal');
    updateModal.style.display = 'none';
});


window.addEventListener('click', (event) => {
    const createModal = document.getElementById('createUserModal');
    const updateModal = document.getElementById('updateUserModal');

    if (event.target === createModal) {
        createModal.style.display = 'none';
    }
    if (event.target === updateModal) {
        updateModal.style.display = 'none';
    }
});



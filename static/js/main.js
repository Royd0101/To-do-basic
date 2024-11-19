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
            let formattedData = `<h3>User Information</h3>`;
            data.forEach(user => {
                formattedData += `
                    <div id="user-${user.id}">
                        <p><strong>First Name:</strong> ${user.first_name}</p>
                        <p><strong>Last Name:</strong> ${user.last_name}</p>
                        <p><strong>Email:</strong> ${user.email}</p>
                        <button onclick="loadUserForUpdate(${user.id})">Update</button>
                        <button onclick="deleteUser(${user.id})">Delete</button>
                        <hr>
                    </div>
                `;
            });
            userDataDiv.innerHTML = formattedData;
        } else {
            userDataDiv.innerHTML = `<p>No users found.</p>`;
        }

        loadingDiv.style.display = 'none';  // Hide loading message when data is fetched
    } catch (error) {
        console.error('There was a problem with the fetch operation:', error);
        const loadingDiv = document.getElementById('loading');
        loadingDiv.textContent = 'Failed to load user data.';
    }
}

fetchUserData();

// Function to load user data for updating
function loadUserForUpdate(userId) {
    const userDiv = document.getElementById(`user-${userId}`);
    if (userDiv) {
        document.getElementById('update-user-id').value = userId;
        document.getElementById('update-first_name').value = userDiv.querySelector('p:nth-child(1)').textContent.replace('First Name:', '').trim();
        document.getElementById('update-last_name').value = userDiv.querySelector('p:nth-child(2)').textContent.replace('Last Name:', '').trim();
        document.getElementById('update-email').value = userDiv.querySelector('p:nth-child(3)').textContent.replace('Email:', '').trim();
    }
}

// Function to update user data
async function updateUser(event) {
    event.preventDefault();

    const userId = document.getElementById('update-user-id').value;
    const firstName = document.getElementById('update-first_name').value;
    const lastName = document.getElementById('update-last_name').value;
    const email = document.getElementById('update-email').value;
    const password = document.getElementById('update-password').value; // Handle password

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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(userData)
        });

        if (response.ok) {
            const data = await response.json();
            console.log('User updated:', data);
            fetchUserData(); // Re-fetch user data to update the list
            document.getElementById('update-user-form').reset();  // Reset the update form
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

// Attach event listeners
document.getElementById('create-user-form').addEventListener('submit', async (event) => {
    await createUser(event);
});
document.getElementById('update-user-form').addEventListener('submit', async (event) => {
    await updateUser(event);
});

async function deleteUser(userId) {
    const confirmDelete = confirm("Are you sure you want to delete this user?");
    if (confirmDelete) {
        try {
            const response = await fetch(`/api/user/${userId}/delete/`, {
                method: 'DELETE',
            });

            if (response.ok) {
                alert('User deleted successfully');
                document.getElementById(`user-${userId}`).remove(); // Remove user from the UI
            } else {
                const errorData = await response.json();
                alert('Failed to delete user: ' + JSON.stringify(errorData));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('An error occurred while deleting the user.');
        }
    }
}

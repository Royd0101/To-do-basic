// app.js

// Helper function to get CSRF token from cookies
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Get the CSRF token
const csrftoken = getCookie('csrftoken');


// Function to handle login
async function login(event) {
    event.preventDefault(); // Prevent form submission

    // Get the values from the form
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    const loginData = {
        email: email,
        password: password
    };

    // Clear any previous error message
    document.getElementById('error-message').innerText = '';

    // Make an API call to the Django backend
    try {
        const response = await fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken  // Include CSRF token
            },
            body: JSON.stringify(loginData)
        });
    
        const data = await response.json();
    
        if (response.ok) {
            localStorage.setItem('token', data.token);
            alert('Login successful');
            window.location.href = '/project';
        } else {
            document.getElementById('error-message').innerText = data.detail || 'Invalid credentials';
        }
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('error-message').innerText = 'Something went wrong. Please try again.';
    }
}    

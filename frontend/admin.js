let authToken = localStorage.getItem('authToken');

document.addEventListener('DOMContentLoaded', () => {
    checkAuthStatus();
});

async function checkAuthStatus() {
    if (authToken) {
        showInquiries();
    } else {
        showLoginForm();
    }
}

async function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    if (!username || !password) {
        alert('Please enter username and password');
        return;
    }

    try {
        const response = await fetch('/backend/admin/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const result = await response.json();

        if (!response.ok) {
            alert(result.message || 'Login failed');
            return;
        }

        authToken = result.token;
        localStorage.setItem('authToken', authToken);
        document.getElementById('adminUsername').value = '';
        document.getElementById('adminPassword').value = '';
        showInquiries();
    } catch (error) {
        console.error('Login error:', error);
        alert('Error logging in');
    }
}

async function showInquiries() {
    if (!authToken) {
        showLoginForm();
        return;
    }

    try {
        const response = await fetch('/backend/admin/inquiries', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch inquiries');
        }

        const inquiries = await response.json();
        displayInquiries(inquiries);
        
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('inquiriesView').style.display = 'block';
    } catch (error) {
        console.error('Error fetching inquiries:', error);
        alert('Error loading inquiries');
        adminLogout();
    }
}

function displayInquiries(inquiries) {
    const list = document.getElementById('inquiriesList');
    
    if (inquiries.length === 0) {
        list.innerHTML = '<p>No inquiries yet.</p>';
        return;
    }

    list.innerHTML = inquiries.map(inquiry => `
        <div class="inquiry-card">
            <h4>${inquiry.name}</h4>
            <p><strong>Email:</strong> ${inquiry.email}</p>
            <p><strong>Phone:</strong> ${inquiry.phone || 'N/A'}</p>
            <p><strong>Issues:</strong> ${inquiry.issues}</p>
            <p><strong>Date:</strong> ${new Date(inquiry.timestamp).toLocaleString()}</p>
            <p><strong>Status:</strong> ${inquiry.status}</p>
        </div>
    `).join('');
}

function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('inquiriesView').style.display = 'none';
}

async function adminLogout() {
    // Clear the token from localStorage
    authToken = null;
    localStorage.removeItem('authToken');
    
    // Reset form
    document.getElementById('adminUsername').value = '';
    document.getElementById('adminPassword').value = '';
    
    // Show login form
    showLoginForm();
}
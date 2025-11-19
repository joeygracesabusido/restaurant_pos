import { apiCall } from './api.js';
import { fetchUserProfile } from './user.js';
import { fetchOrders } from './orders.js';
import { appState, renderApp } from '../app.js';
import { showError, showSuccess } from '../utils/errors.js';

export async function login(email, password) {
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
        const response = await fetch(`/api/auth/token`, {
            method: 'POST',
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            showError(error.detail || 'Login failed');
            return;
        }

        const data = await response.json();
        appState.token = data.access_token;
        localStorage.setItem('token', data.access_token);
        
        await fetchUserProfile();
        await fetchOrders();
        appState.currentView = 'dashboard';
        renderApp();
        document.getElementById('menu-button-container').classList.add('hidden');
        document.getElementById('public-menu-view').classList.add('hidden');
        document.getElementById('content').classList.remove('hidden');
    } catch (error) {
        showError('Login failed: ' + error.message);
    }
}

export async function register(email, fullName, password, role = 'staff') {
    const data = {
        email,
        full_name: fullName,
        password,
        role
    };

    const result = await apiCall('/auth/register', 'POST', data);
    if (result) {
        showSuccess('Registration successful! Please login.');
        setTimeout(() => {
            appState.currentView = 'login';
            renderApp();
        }, 2000);
    }
}
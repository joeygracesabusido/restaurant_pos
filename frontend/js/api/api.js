import { appState, renderApp } from '../app.js';
import { showError } from '../utils/errors.js';

export function logout() {
    appState.user = null;
    appState.token = null;
    appState.currentView = 'login';
    localStorage.removeItem('token');
    renderApp();
    document.getElementById('menu-button-container').classList.remove('hidden');
}

export async function apiCall(endpoint, method = 'GET', body = null) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json',
        }
    };

    if (appState.token) {
        options.headers['Authorization'] = `Bearer ${appState.token}`;
    }

    if (body) {
        options.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(`/api${endpoint}`, options);
        
        if (!response.ok) {
            if (response.status === 401) {
                logout();
                return null;
            }
            const error = await response.json();
            throw new Error(error.detail || 'API Error');
        }

        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        showError(error.message);
        return null;
    }
}
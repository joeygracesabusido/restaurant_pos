import { apiCall } from './api.js';
import { appState } from '../app.js';

export async function fetchUserProfile() {
    const user = await apiCall('/users/me');
    if (user) {
        appState.user = user;
    }
}

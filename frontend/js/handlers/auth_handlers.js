import { login, register } from '../api/auth.js';
import { showError } from '../utils/errors.js';

export function handleLogin() {
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }

    login(email, password);
}

export function handleRegister() {
    const name = document.getElementById('regName').value;
    const email = document.getElementById('regEmail').value;
    const password = document.getElementById('regPassword').value;

    if (!name || !email || !password) {
        showError('Please fill in all fields');
        return;
    }

    if (password.length < 8) {
        showError('Password must be at least 8 characters');
        return;
    }

    register(email, name, password);
}

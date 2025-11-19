import { loadHTML } from '../utils/dom.js';
import { handleRegister } from '../handlers/auth_handlers.js';
import { showLoginView } from './login.js';

export async function showRegisterView() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('register');

    document.getElementById('register-button').addEventListener('click', handleRegister);
    document.getElementById('back-to-login-button').addEventListener('click', showLoginView);
}

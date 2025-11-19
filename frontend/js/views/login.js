import { loadHTML } from '../utils/dom.js';
import { handleLogin } from '../handlers/auth_handlers.js';
import { showRegisterView } from './register.js';

export async function showLoginView() {
    const content = document.getElementById('content');
    content.innerHTML = await loadHTML('login');

    document.getElementById('login-button').addEventListener('click', handleLogin);
    document.getElementById('show-register-button').addEventListener('click', showRegisterView);

    document.getElementById('content').classList.remove('hidden');
    document.getElementById('public-menu-view').classList.add('hidden');
    document.getElementById('menu-button-container').classList.remove('hidden');
}

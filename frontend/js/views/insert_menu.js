import { loadHTML } from '../utils/dom.js';
import { appState } from '../app.js';
import { fetchCategories, createMenuItem } from '../api/menu.js';
import { returnToDashboard } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

export async function renderInsertMenuView(content) {
    if (appState.categories.length === 0) {
        await fetchCategories();
    }

    try {
        content.innerHTML = await loadHTML('insert_menu');
    } catch (error) {
        console.error("Error loading insert_menu.html:", error);
        content.innerHTML = `<p class="text-red-500">Failed to load insert menu form. Please try again.</p>`;
        return;
    }

    document.getElementById('back-to-dashboard').addEventListener('click', returnToDashboard);
    document.getElementById('logout-button').addEventListener('click', logout);

    const categorySelect = document.getElementById('itemCategory');
    categorySelect.innerHTML += appState.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

    document.getElementById('createMenuItemForm').addEventListener('submit', (event) => {
        event.preventDefault();
        createMenuItem();
    });
}
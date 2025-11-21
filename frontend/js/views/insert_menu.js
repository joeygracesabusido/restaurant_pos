import { loadHTML } from '../utils/dom.js';
import { appState } from '../app.js';
import { fetchCategories, createMenuItem } from '../api/menu.js';
import { returnToDashboard } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

function addSizeField() {
    const container = document.getElementById('sizes-container');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" placeholder="Size Name (e.g., Small)" class="size-name w-full px-2 py-1 border rounded">
        <input type="number" step="0.01" placeholder="Price Modifier" class="size-modifier w-full px-2 py-1 border rounded">
        <button type="button" class="remove-size-button text-red-500">Remove</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-size-button').addEventListener('click', () => div.remove());
}

function addAddonField() {
    const container = document.getElementById('addons-container');
    const index = container.children.length;
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" placeholder="Add-on Name (e.g., Extra Cheese)" class="addon-name w-full px-2 py-1 border rounded">
        <input type="number" step="0.01" min="0" placeholder="Price" class="addon-price w-full px-2 py-1 border rounded">
        <button type="button" class="remove-addon-button text-red-500">Remove</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-addon-button').addEventListener('click', () => div.remove());
}

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
    document.getElementById('add-size-button').addEventListener('click', addSizeField);
    document.getElementById('add-addon-button').addEventListener('click', addAddonField);

    const categorySelect = document.getElementById('itemCategory');
    categorySelect.innerHTML += appState.categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');

    document.getElementById('createMenuItemForm').addEventListener('submit', (event) => {
        event.preventDefault();
        createMenuItem();
    });
}
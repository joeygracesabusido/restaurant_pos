import { loadHTML } from '../utils/dom.js';
import { appState } from '../app.js';
import { fetchCategories, fetchMenuItems } from '../api/menu.js';
import { renderCart } from '../components/cart.js';
import { renderCategories } from '../components/categories.js';
import { renderMenuItems } from '../components/menu_items.js';
import { returnToDashboard } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

export async function renderMenuView(content) {
    // Fetch categories and menu items if they haven't been loaded yet
    if (appState.categories.length === 0 || appState.menuItems.length === 0) {
        await fetchCategories();
        await fetchMenuItems();
    }

    content.innerHTML = await loadHTML('menu');

    document.getElementById('back-to-dashboard').addEventListener('click', returnToDashboard);
    document.getElementById('logout-button').addEventListener('click', logout);

    renderCategories(document.getElementById('categories-list'));
    renderMenuItems(document.getElementById('menu-items-grid'));
    renderCart(document.getElementById('cart-sidebar'));
}
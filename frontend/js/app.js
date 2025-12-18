import { showLoginView } from './views/login.js';
import { renderDashboard } from './views/dashboard.js';
import { renderMenuView } from './views/menu.js';
import { renderOrdersView } from './views/orders.js';
import { renderManageMenuView } from './views/manage_menu.js';
import { renderInsertMenuView } from './views/insert_menu.js';
import { renderInsertCategoryView } from './views/insert_category.js';
import { renderPublicMenuView, togglePublicMenuView } from './views/public_menu.js';
import { fetchUserProfile } from './api/user.js';
import { fetchOrders } from './api/orders.js';
import { showRegisterView } from './views/register.js';

export let appState = {
    user: null,
    token: null,
    categories: [],
    menuItems: [],
    cart: [],
    orders: [],
    currentView: 'login',
    selectedCategory: null
};

export function renderApp() {
    const content = document.getElementById('content');
    
    if (appState.currentView === 'login') {
        showLoginView();
    } else if (appState.currentView === 'register') {
        showRegisterView();
    } else if (appState.currentView === 'dashboard') {
        renderDashboard(content);
    } else if (appState.currentView === 'menu') {
        renderMenuView(content);
    } else if (appState.currentView === 'orders') {
        renderOrdersView(content);
    } else if (appState.currentView === 'manage-menu') {
        renderManageMenuView(content);
    } else if (appState.currentView === 'insert-menu') {
        renderInsertMenuView(content);
    } else if (appState.currentView === 'insert-category') {
        renderInsertCategoryView(content);
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    const token = localStorage.getItem('token');
    if (token) {
        appState.token = token;
        await fetchUserProfile();
        await fetchOrders();
        appState.currentView = 'dashboard';
        renderApp();
        document.getElementById('menu-button-container').classList.add('hidden');
    } else {
        renderPublicMenuView();
    }
    document.getElementById('menu-button').addEventListener('click', togglePublicMenuView);
});

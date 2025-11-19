import { loadHTML } from '../utils/dom.js';
import { appState, renderApp } from '../app.js';
import { fetchCategories, fetchMenuItems } from '../api/menu.js';
import { formatCurrency } from '../utils/formatters.js';
import { selectCategory } from '../handlers/menu_handlers.js';

export async function renderPublicMenuView() {
    const menuView = document.getElementById('public-menu-view');
    menuView.classList.remove('hidden');
    const content = document.getElementById('content');
    content.classList.add('hidden');

    if (appState.categories.length === 0) {
        await fetchCategories();
        await fetchMenuItems();
    }

    menuView.innerHTML = await loadHTML('public_menu');

    const categoriesList = document.getElementById('public-categories-list');
    categoriesList.innerHTML = `
        <button class="w-full text-left px-4 py-3 rounded-lg transition ${appState.selectedCategory === null ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}">
            All Items
        </button>
        ${appState.categories.map(cat => `
            <button class="w-full text-left px-4 py-3 rounded-lg transition ${appState.selectedCategory === cat.id ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}">
                ${cat.name}
            </button>
        `).join('')}
    `;

    categoriesList.querySelectorAll('button').forEach((button, index) => {
        const categoryId = index === 0 ? null : appState.categories[index - 1].id;
        button.addEventListener('click', () => selectCategory(categoryId, true));
    });

    const menuItemsContainer = document.getElementById('public-menu-items');
    if (appState.menuItems.length === 0) {
        menuItemsContainer.innerHTML = `
            <div class="col-span-full bg-white rounded-lg shadow-md p-12 text-center">
                <p class="text-gray-500 text-lg">No menu items available</p>
            </div>
        `;
    } else {
        menuItemsContainer.innerHTML = appState.menuItems.map(item => `
            <div class="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden border-2 border-transparent hover:border-blue-300">
                <div class="bg-gradient-to-br from-blue-400 to-blue-600 h-40 flex items-center justify-center overflow-hidden">
                    ${item.image_url ?
                        `<img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover">` :
                        `<span class="text-7xl">${item.emoji || '🍽️'}</span>`
                    }
                </div>
                <div class="p-5">
                    <h4 class="font-bold text-gray-800 text-lg mb-1">${item.name}</h4>
                    <p class="text-gray-600 text-sm mb-3 line-clamp-2">${item.description || 'Delicious item'}</p>
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs text-gray-500 mb-1">Price</p>
                            <span class="text-3xl font-bold text-green-600">${formatCurrency(item.price)}</span>
                        </div>
                        ${item.available ?
                            '<span class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">✓ Available</span>' :
                            '<span class="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">✗ Out</span>'
                        }
                    </div>
                </div>
            </div>
        `).join('');
    }
}

export function togglePublicMenuView() {
    const menuView = document.getElementById('public-menu-view');
    const content = document.getElementById('content');
    const menuButton = document.getElementById('menu-button');

    if (menuView.classList.contains('hidden')) {
        menuView.classList.remove('hidden');
        content.classList.add('hidden');
        menuButton.textContent = 'Back to Login';
    } else {
        menuView.classList.add('hidden');
        content.classList.remove('hidden');
        menuButton.textContent = 'Menu';
        appState.currentView = 'login';
        renderApp();
    }
}
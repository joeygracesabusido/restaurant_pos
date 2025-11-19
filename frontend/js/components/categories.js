import { appState } from '../app.js';
import { selectCategory } from '../handlers/menu_handlers.js';

export function renderCategories(container) {
    container.innerHTML = `
        <button class="w-full text-left px-4 py-3 rounded-lg transition ${appState.selectedCategory === null ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}">
            All Items
        </button>
        ${appState.categories.map(cat => `
            <button class="w-full text-left px-4 py-3 rounded-lg transition ${appState.selectedCategory === cat.id ? 'bg-blue-600 text-white font-semibold' : 'bg-gray-100 hover:bg-gray-200 text-gray-800'}">
                ${cat.name}
            </button>
        `).join('')}
    `;

    container.querySelectorAll('button').forEach((button, index) => {
        const categoryId = index === 0 ? null : appState.categories[index - 1].id;
        button.addEventListener('click', () => selectCategory(categoryId));
    });
}

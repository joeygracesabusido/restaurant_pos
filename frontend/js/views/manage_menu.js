import { loadHTML } from '../utils/dom.js';
import { appState } from '../app.js';
import { fetchMenuItems, uploadMenuImage, updateMenuItem } from '../api/menu.js';
import { returnToDashboard } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

export async function renderManageMenuView(content) {
    if (appState.menuItems.length === 0) {
        await fetchMenuItems();
    }

    content.innerHTML = await loadHTML('manage_menu');

    document.getElementById('back-to-dashboard').addEventListener('click', returnToDashboard);
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('upload-image-button').addEventListener('click', uploadMenuImage);

    const menuItemsList = document.getElementById('menu-items-list');
    if (appState.menuItems.length === 0) {
        menuItemsList.innerHTML = '<p class="text-gray-500 text-center py-8">No menu items found</p>';
    } else {
        menuItemsList.innerHTML = appState.menuItems.map(item => `
            <div class="border-2 border-gray-200 rounded-lg p-4 hover:border-blue-400 transition">
                <div class="mb-4 bg-gray-100 h-40 rounded-lg flex items-center justify-center overflow-hidden">
                    ${item.image_url ?
                        `<img src="${item.image_url}" alt="${item.name}" class="w-full h-full object-cover">` :
                        `<div class="text-center"><p class="text-6xl mb-2">${item.emoji || '🍽️'}</p><p class="text-gray-500 text-sm">No image</p></div>`
                    }
                </div>

                <h4 class="font-bold text-gray-800 mb-1">${item.name}</h4>
                <p class="text-sm text-gray-600 mb-2">${item.description || 'No description'}</p>
                <p class="text-lg font-bold text-green-600 mb-3">${item.price.toFixed(2)}</p>

                <div class="mb-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Assign Image URL</label>
                    <div class="flex items-center gap-2">
                        <input type="text" class="w-full px-2 py-2 border border-gray-300 rounded text-xs" id="imageUrl_${item.id}" value="${item.image_url || ''}" placeholder="Image URL or /api/uploads/images/filename.jpg">
                        <button class="use-last-image-button hidden bg-purple-500 text-white px-2 py-1 rounded text-xs" data-item-id="${item.id}">Use Last Upload</button>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Assign Emoji</label>
                    <input type="text" class="w-full px-2 py-2 border border-gray-300 rounded text-xs" id="emoji_${item.id}" value="${item.emoji || ''}" placeholder="e.g., 🍔">
                </div>

                <button data-item-id="${item.id}" class="update-menu-item-button w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold text-sm">💾 Save</button>
            </div>
        `).join('');
    }

    menuItemsList.querySelectorAll('.update-menu-item-button').forEach(button => {
        const itemId = button.dataset.itemId;
        button.addEventListener('click', () => {
            const imageUrl = document.getElementById(`imageUrl_${itemId}`).value;
            const emoji = document.getElementById(`emoji_${itemId}`).value;
            updateMenuItem(itemId, imageUrl, emoji);
        });
    });
}
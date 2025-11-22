import { loadHTML } from '../utils/dom.js';
import { appState } from '../app.js';
import { fetchCategories, fetchMenuItems, updateMenuItem, uploadMenuImage } from '../api/menu.js';
import { returnToDashboard } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

let currentEditItemId = null;

function addEditSizeField(size = { name: '', price_modifier: 0 }) {
    const container = document.getElementById('edit-sizes-container');
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" placeholder="Size Name (e.g., Small)" class="edit-size-name w-full px-2 py-1 border rounded" value="${size.name}">
        <input type="number" step="0.01" placeholder="Price Modifier" class="edit-size-modifier w-full px-2 py-1 border rounded" value="${size.price_modifier}">
        <button type="button" class="remove-edit-size-button text-red-500">Remove</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-edit-size-button').addEventListener('click', () => div.remove());
}

function addEditAddonField(addon = { name: '', price: 0 }) {
    const container = document.getElementById('edit-addons-container');
    const div = document.createElement('div');
    div.className = 'flex items-center space-x-2';
    div.innerHTML = `
        <input type="text" placeholder="Add-on Name (e.g., Extra Cheese)" class="edit-addon-name w-full px-2 py-1 border rounded" value="${addon.name}">
        <input type="number" step="0.01" min="0" placeholder="Price" class="edit-addon-price w-full px-2 py-1 border rounded" value="${addon.price}">
        <button type="button" class="remove-edit-addon-button text-red-500">Remove</button>
    `;
    container.appendChild(div);
    div.querySelector('.remove-edit-addon-button').addEventListener('click', () => div.remove());
}

export async function renderManageMenuView(content) {
    console.log("Entering renderManageMenuView");
    if (appState.menuItems.length === 0) {
        console.log("Fetching menu items in manage view...");
        await fetchMenuItems();
        console.log("Fetched menu items in manage view:", appState.menuItems);
    }
    if (appState.categories.length === 0) {
        await fetchCategories();
    }

    content.innerHTML = await loadHTML('manage_menu');
    console.log("manage_menu.html loaded.");

    document.getElementById('back-to-dashboard').addEventListener('click', returnToDashboard);
    document.getElementById('logout-button').addEventListener('click', logout);
    document.getElementById('upload-image-button').addEventListener('click', uploadMenuImage);

    // Edit modal event listeners
    document.getElementById('add-edit-size-button').addEventListener('click', () => addEditSizeField());
    document.getElementById('add-edit-addon-button').addEventListener('click', () => addEditAddonField());
    document.getElementById('cancelEditItem').addEventListener('click', () => document.getElementById('editItemModal').classList.add('hidden'));

    document.getElementById('editMenuItemForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const itemId = document.getElementById('editItemId').value;
        const name = document.getElementById('editItemName').value;
        const description = document.getElementById('editItemDescription').value;
        const price = parseFloat(document.getElementById('editItemPrice').value);
        const category_id = document.getElementById('editItemCategory').value;
        const available = document.getElementById('editItemAvailable').checked;
        const image_url = document.getElementById('editItemImageUrl').value;
        const emoji = document.getElementById('editItemEmoji').value;

        const sizes = [];
        document.querySelectorAll('#edit-sizes-container > div').forEach(row => {
            const name = row.querySelector('.edit-size-name').value;
            const price_modifier = parseFloat(row.querySelector('.edit-size-modifier').value);
            if (name && !isNaN(price_modifier)) {
                sizes.push({ name, price_modifier });
            }
        });

        const addons = [];
        document.querySelectorAll('#edit-addons-container > div').forEach(row => {
            const name = row.querySelector('.edit-addon-name').value;
            const price = parseFloat(row.querySelector('.edit-addon-price').value);
            if (name && !isNaN(price)) {
                addons.push({ name, price });
            }
        });

        const updateData = {
            name,
            description: description || null,
            price,
            category_id,
            available,
            image_url: image_url || null,
            emoji: emoji || null,
            sizes,
            addons
        };
        await updateMenuItem(itemId, updateData);
        document.getElementById('editItemModal').classList.add('hidden');
    });

    const menuItemsList = document.getElementById('menu-items-list');
    console.log("appState.menuItems before rendering list:", appState.menuItems);
    if (appState.menuItems.length === 0) {
        menuItemsList.innerHTML = '<p class="text-gray-500 text-center py-8">No menu items found</p>';
    } else {
        console.log("Rendering items:", appState.menuItems);
        const itemsHTML = appState.menuItems.map(item => `
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
                        <button type="button" class="use-last-image-button hidden bg-purple-500 text-white px-2 py-1 rounded text-xs" data-item-id="${item.id}">Use Last Upload</button>
                    </div>
                </div>

                <div class="mb-3">
                    <label class="block text-xs font-medium text-gray-600 mb-1">Assign Emoji</label>
                    <input type="text" class="w-full px-2 py-2 border border-gray-300 rounded text-xs" id="emoji_${item.id}" value="${item.emoji || ''}" placeholder="e.g., 🍔">
                </div>

                <button data-item-id="${item.id}" class="edit-menu-item-button w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 font-semibold text-sm">✏️ Edit Details</button>
            </div>
        `).join('');
        menuItemsList.innerHTML = itemsHTML;
        console.log("Rendered items HTML:", itemsHTML);
    }

    menuItemsList.querySelectorAll('.edit-menu-item-button').forEach(button => {
        button.addEventListener('click', (event) => {
            currentEditItemId = event.target.dataset.itemId;
            const item = appState.menuItems.find(i => i.id === currentEditItemId);
            if (item) {
                document.getElementById('editItemId').value = item.id;
                document.getElementById('editItemName').value = item.name;
                document.getElementById('editItemDescription').value = item.description || '';
                document.getElementById('editItemPrice').value = item.price;
                document.getElementById('editItemAvailable').checked = item.available;
                document.getElementById('editItemImageUrl').value = item.image_url || '';
                document.getElementById('editItemEmoji').value = item.emoji || '';

                // Set category
                const categorySelect = document.getElementById('editItemCategory');
                categorySelect.innerHTML = appState.categories.map(cat => 
                    `<option value="${cat.id}" ${cat.id === item.category_id ? 'selected' : ''}>${cat.name}</option>`
                ).join('');

                // Clear and populate sizes
                const sizesContainer = document.getElementById('edit-sizes-container');
                sizesContainer.innerHTML = '';
                item.sizes?.forEach(size => addEditSizeField(size));

                // Clear and populate add-ons
                const addonsContainer = document.getElementById('edit-addons-container');
                addonsContainer.innerHTML = '';
                item.addons?.forEach(addon => addEditAddonField(addon));

                document.getElementById('editItemModal').classList.remove('hidden');
            }
        });
    });
    console.log("Exiting renderManageMenuView");
}
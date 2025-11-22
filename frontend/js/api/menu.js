import { apiCall } from './api.js';
import { appState } from '../app.js';
import { showError, showSuccess } from '../utils/errors.js';
import { renderApp } from '../app.js';

export async function fetchCategories() {
    const categories = await apiCall('/menu/categories/public');
    if (categories) {
        appState.categories = categories;
    }
}

export async function fetchMenuItems(categoryId = null) {
    let endpoint = '/menu/items';
    if (categoryId) {
        endpoint += `?category_id=${categoryId}`;
    }
    const items = await apiCall(endpoint);
    console.log("Received items from API:", items);
    if (items) {
        appState.menuItems = items;
    }
}

export async function uploadMenuImage() {
    const fileInput = document.getElementById('imageFileInput');
    const file = fileInput.files[0];

    if (!file) {
        showError('Please select a file');
        return;
    }

    document.getElementById('uploadProgress').classList.remove('hidden');
    document.getElementById('uploadPreview').classList.add('hidden');

    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/menu/upload-image', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${appState.token}`
            },
            body: formData
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Upload failed');
        }

        const data = await response.json();
        
        document.getElementById('uploadProgress').classList.add('hidden');
        document.getElementById('uploadPreview').classList.remove('hidden');
        document.getElementById('uploadedImageUrl').textContent = data.url;
        
        appState.lastUploadedImageUrl = data.url;
        
        fileInput.value = '';
        
        showSuccess(`Image uploaded successfully: ${data.url}`);

        // Show "Use Last Upload" buttons and add event listeners
        document.querySelectorAll('.use-last-image-button').forEach(button => {
            button.classList.remove('hidden');
            button.addEventListener('click', () => {
                const itemId = button.dataset.itemId;
                const imageUrlInput = document.getElementById(`imageUrl_${itemId}`);
                if (imageUrlInput) {
                    imageUrlInput.value = appState.lastUploadedImageUrl;
                }
            });
        });

    } catch (error) {
        document.getElementById('uploadProgress').classList.add('hidden');
        showError(error.message || 'Failed to upload image');
    }
}

export async function updateMenuItem(itemId, updateData) {
    try {
        const response = await apiCall(`/menu/items/${itemId}`, 'PUT', updateData);
        if (response) {
            showSuccess('Menu item updated!');
            // Update the item in appState
            const index = appState.menuItems.findIndex(item => item.id === itemId);
            if (index !== -1) {
                appState.menuItems[index] = { ...appState.menuItems[index], ...updateData };
            }
            renderApp();
        }
    } catch (error) {
        showError('Failed to update menu item: ' + error.message);
    }
}

export async function createMenuItem() {
    const name = document.getElementById('itemName').value;
    const description = document.getElementById('itemDescription').value;
    const price = parseFloat(document.getElementById('itemPrice').value);
    const category_id = document.getElementById('itemCategory').value;
    const available = document.getElementById('itemAvailable').checked;
    const image_url = document.getElementById('itemImageUrl').value;
    const emoji = document.getElementById('itemEmoji').value;

    if (!name || !price || !category_id) {
        showError('Please fill in all required fields (Name, Price, Category)');
        return;
    }
    if (isNaN(price) || price <= 0) {
        showError('Price must be a positive number');
        return;
    }

    const sizes = [];
    const sizeRows = document.querySelectorAll('#sizes-container > div');
    for (const row of sizeRows) {
        const name = row.querySelector('.size-name').value;
        const price_modifier = parseFloat(row.querySelector('.size-modifier').value);
        if (name && !isNaN(price_modifier)) {
            sizes.push({ name, price_modifier });
        }
    }

    const addons = [];
    const addonRows = document.querySelectorAll('#addons-container > div');
    for (const row of addonRows) {
        const name = row.querySelector('.addon-name').value;
        const price = parseFloat(row.querySelector('.addon-price').value);
        if (name && !isNaN(price)) {
            addons.push({ name, price });
        }
    }

    const newItem = {
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

    const result = await apiCall('/menu/items', 'POST', newItem);
    if (result) {
        showSuccess('Menu item created successfully!');
        await fetchMenuItems();
        appState.currentView = 'manage-menu';
        renderApp();
    }
}

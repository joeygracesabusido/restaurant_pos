import { appState } from '../app.js';
import { formatCurrency } from '../utils/formatters.js';
import { addToCart } from './cart.js';

function openOptionsModal(itemId) {
    const item = appState.menuItems.find(i => i.id === itemId);
    if (!item) return;

    const modal = document.getElementById('optionsModal');
    const modalContent = document.getElementById('optionsModalContent');

    let optionsHTML = `
        <h3 class="text-xl font-bold mb-4">${item.name}</h3>
        <p class="text-gray-600 mb-4">${item.description}</p>
        <div id="options-price" class="text-2xl font-bold text-green-600 mb-4">${formatCurrency(item.price)}</div>
    `;

    if (item.sizes && item.sizes.length > 0) {
        optionsHTML += '<h4 class="font-bold mb-2">Size</h4>';
        item.sizes.forEach((size, index) => {
            optionsHTML += `
                <label class="flex items-center mb-2">
                    <input type="radio" name="size" value="${index}" ${index === 0 ? 'checked' : ''} class="mr-2">
                    <span>${size.name} (+${formatCurrency(size.price_modifier)})</span>
                </label>
            `;
        });
    }

    if (item.addons && item.addons.length > 0) {
        optionsHTML += '<h4 class="font-bold mt-4 mb-2">Add-ons</h4>';
        item.addons.forEach((addon, index) => {
            optionsHTML += `
                <label class="flex items-center mb-2">
                    <input type="checkbox" name="addon" value="${index}" class="mr-2">
                    <span>${addon.name} (+${formatCurrency(addon.price)})</span>
                </label>
            `;
        });
    }

    optionsHTML += `
        <button id="confirm-add-to-cart" class="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition mt-4">Add to Cart</button>
    `;

    modalContent.innerHTML = optionsHTML;
    modal.classList.remove('hidden');

    const updatePrice = () => {
        let currentPrice = item.price;
        const selectedSizeInput = document.querySelector('input[name="size"]:checked');
        if (selectedSizeInput) {
            const size = item.sizes[selectedSizeInput.value];
            currentPrice += size.price_modifier;
        }

        document.querySelectorAll('input[name="addon"]:checked').forEach(input => {
            const addon = item.addons[input.value];
            currentPrice += addon.price;
        });

        document.getElementById('options-price').textContent = formatCurrency(currentPrice);
    };

    document.querySelectorAll('input[name="size"], input[name="addon"]').forEach(input => {
        input.addEventListener('change', updatePrice);
    });

    document.getElementById('confirm-add-to-cart').onclick = () => {
        const selectedSizeInput = document.querySelector('input[name="size"]:checked');
        const selectedSize = selectedSizeInput ? item.sizes[selectedSizeInput.value] : null;

        const selectedAddons = Array.from(document.querySelectorAll('input[name="addon"]:checked'))
            .map(input => item.addons[input.value]);
            
        addToCart(item.id, selectedSize, selectedAddons);
        modal.classList.add('hidden');
    };
    
    // Initial price update
    updatePrice();
}

export function renderMenuItems(container) {
    if (appState.menuItems.length === 0) {
        container.innerHTML = `
            <div class="col-span-2 bg-white rounded-lg shadow-md p-12 text-center">
                <p class="text-gray-500 text-lg">No menu items available</p>
            </div>
        `;
        return;
    }

    container.innerHTML = appState.menuItems.map(item => `
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
                <div class="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Price</p>
                        <span class="text-3xl font-bold text-green-600">${formatCurrency(item.price)}</span>
                    </div>
                    ${item.available ?
                        '<span class="text-xs bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold">✓ Available</span>' :
                        '<span class="text-xs bg-red-100 text-red-800 px-3 py-1 rounded-full font-semibold">✗ Out of Stock</span>'
                    }
                </div>
                <button data-item-id="${item.id}"
                    class="add-to-cart-button w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition flex items-center justify-center gap-2 ${!item.available ? 'opacity-50 cursor-not-allowed bg-gray-400' : ''}"
                    ${!item.available ? 'disabled' : ''}>
                    <span>${item.available ? '➕ Add to Cart' : 'Out of Stock'}</span>
                </button>
            </div>
        </div>
    `).join('');

    container.querySelectorAll('.add-to-cart-button').forEach(button => {
        button.addEventListener('click', () => {
            const itemId = button.dataset.itemId;
            const item = appState.menuItems.find(i => i.id === itemId);
            if (item && (item.sizes?.length > 0 || item.addons?.length > 0)) {
                openOptionsModal(itemId);
            } else {
                addToCart(itemId);
            }
        });
    });
}

import { appState } from '../app.js';
import { formatCurrency } from '../utils/formatters.js';
import { addToCart } from './cart.js';

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
        button.addEventListener('click', () => addToCart(button.dataset.itemId));
    });
}

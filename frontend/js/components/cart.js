import { appState, renderApp } from '../app.js';
import { formatCurrency } from '../utils/formatters.js';
import { createOrder } from '../api/orders.js';
import { switchView } from '../handlers/view_handlers.js';
import { showError } from '../utils/errors.js';

function generateCartItemId(itemId, size, addons) {
    const sizeId = size ? size.name : 'default';
    const addonIds = addons.map(a => a.name).sort().join('-');
    return `${itemId}-${sizeId}-${addonIds}`;
}

export function addToCart(itemId, size = null, addons = []) {
    const itemToAdd = appState.menuItems.find(item => String(item.id) === String(itemId));
    if (!itemToAdd) {
        showError('Item not found!');
        return;
    }

    const cartItemId = generateCartItemId(itemId, size, addons);
    const existingItem = appState.cart.find(item => item.cartItemId === cartItemId);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        let price = itemToAdd.price;
        if (size) {
            price += size.price_modifier;
        }
        addons.forEach(addon => {
            price += addon.price;
        });

        appState.cart.push({
            cartItemId,
            id: itemToAdd.id,
            name: itemToAdd.name,
            price,
            quantity: 1,
            instructions: '',
            size,
            addons
        });
    }
    renderApp();
}


function removeFromCart(index) {
    appState.cart.splice(index, 1);
    renderApp();
}

function updateQuantity(index, change) {
    appState.cart[index].quantity += change;
    if (appState.cart[index].quantity <= 0) {
        appState.cart.splice(index, 1);
    }
    renderApp();
}

function clearCart() {
    appState.cart = [];
    renderApp();
}

async function placeOrder() {
    await createOrder(appState.cart);
}

export function renderCart(container) {
    const cartTotal = appState.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const cartCount = appState.cart.reduce((sum, item) => sum + item.quantity, 0);

    container.innerHTML = `
        <h3 class="text-lg font-bold mb-4 text-gray-800 flex items-center">
            🛒 Cart <span class="ml-2 bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">${cartCount}</span>
        </h3>
        
        <div class="max-h-96 overflow-y-auto bg-gray-50 rounded-lg p-3 mb-4 border border-gray-200">
            ${appState.cart.length === 0 ? '<p class="text-gray-500 text-center py-8 text-sm">Your cart is empty</p>' : ''}
            ${appState.cart.map((item, idx) => `
                <div class="mb-3 pb-3 border-b border-gray-300 last:border-b-0 bg-white p-2 rounded">
                    <div class="flex justify-between items-start mb-2">
                        <div class="flex-1">
                            <p class="font-semibold text-gray-800 text-sm">${item.name}</p>
                            ${item.size ? `<p class="text-xs text-gray-500">Size: ${item.size.name}</p>` : ''}
                            ${item.addons.length > 0 ? `<p class="text-xs text-gray-500">Add-ons: ${item.addons.map(a => a.name).join(', ')}</p>` : ''}
                            <p class="text-blue-600 font-bold text-sm">${formatCurrency(item.price)}</p>
                        </div>
                        <button data-idx="${idx}" class="remove-from-cart-button text-red-600 hover:text-red-800 font-bold text-lg leading-none">✕</button>
                    </div>
                    <div class="flex items-center space-x-2">
                        <button data-idx="${idx}" data-change="-1" class="update-quantity-button bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 text-xs font-bold">−</button>
                        <span class="flex-1 text-center font-bold text-gray-800">${item.quantity}</span>
                        <button data-idx="${idx}" data-change="1" class="update-quantity-button bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 text-xs font-bold">+</button>
                    </div>
                    <p class="text-gray-700 font-bold mt-2 text-sm">Subtotal: ${formatCurrency(item.price * item.quantity)}</p>
                </div>
            `).join('')}
        </div>

        <div class="space-y-3">
            <input type="text" id="customerName" placeholder="👤 Customer Name" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <input type="number" id="tableNumber" placeholder="🪑 Table #" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" min="1">
            <input type="text" id="orderNotes" placeholder="📝 Special Notes" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            
            <div class="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-lg border-2 border-blue-300">
                <p class="text-gray-700 text-xs mb-1 font-semibold">TOTAL ORDER:</p>
                <p class="text-3xl font-bold text-blue-600">${formatCurrency(cartTotal)}</p>
            </div>

            <button id="place-order-button" class="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 font-bold transition ${appState.cart.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${appState.cart.length === 0 ? 'disabled' : ''}>
                ✓ Place Order
            </button>
            <button id="clear-cart-button" class="w-full bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-bold transition">
                🗑️ Clear Cart
            </button>
            <button id="view-orders-button" class="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 font-bold transition">
                📦 View Orders
            </button>
        </div>
    `;

    container.querySelector('#place-order-button').addEventListener('click', placeOrder);
    container.querySelector('#clear-cart-button').addEventListener('click', clearCart);
    container.querySelector('#view-orders-button').addEventListener('click', () => switchView('orders'));

    container.querySelectorAll('.remove-from-cart-button').forEach(button => {
        button.addEventListener('click', () => removeFromCart(parseInt(button.dataset.idx)));
    });

    container.querySelectorAll('.update-quantity-button').forEach(button => {
        button.addEventListener('click', () => updateQuantity(parseInt(button.dataset.idx), parseInt(button.dataset.change)));
    });
}
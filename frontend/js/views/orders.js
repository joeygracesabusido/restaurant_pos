import { loadHTML } from '../utils/dom.js';
import { appState } from '../app.js';
import { fetchOrders, updateOrderStatus } from '../api/orders.js';
import { fetchMenuItems } from '../api/menu.js';
import { returnToDashboard, switchView } from '../handlers/view_handlers.js';
import { showPaymentForm } from '../components/payment_form.js';
import { logout } from '../api/api.js';
import { formatCurrency } from '../utils/formatters.js';

export async function renderOrdersView(content) {
    content.innerHTML = await loadHTML('orders');

    document.getElementById('back-to-dashboard').addEventListener('click', returnToDashboard);
    document.getElementById('browse-menu').addEventListener('click', () => switchView('menu'));
    document.getElementById('logout-button').addEventListener('click', logout);

    const statusFilter = document.getElementById('status-filter');
    statusFilter.addEventListener('change', () => {
        renderOrderList(statusFilter.value || null);
    });

    // Initial render
    await renderOrderList();
}

async function renderOrderList(status = null) {
    await fetchOrders(status);
    if (appState.menuItems.length === 0) {
        await fetchMenuItems();
    }

    const menuItemMap = appState.menuItems.reduce((map, item) => {
        map[item.id] = item.name;
        return map;
    }, {});

    const statusColors = {
        'pending': 'bg-yellow-100 text-yellow-800',
        'preparing': 'bg-blue-100 text-blue-800',
        'ready': 'bg-green-100 text-green-800',
        'completed': 'bg-gray-100 text-gray-800',
        'cancelled': 'bg-red-100 text-red-800'
    };

    const ordersList = document.getElementById('orders-list');
    if (appState.orders.length === 0) {
        ordersList.innerHTML = '<p class="text-gray-500 text-center py-8">No orders found for this filter.</p>';
    } else {
        ordersList.innerHTML = appState.orders.map(order => `
            <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
                <div class="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                    <div>
                        <p class="text-gray-600 text-sm">Order ID</p>
                        <p class="font-mono font-bold text-gray-800">${order.id.substring(0, 8)}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 text-sm">Status</p>
                        <span class="inline-block px-3 py-1 rounded-full text-sm font-semibold ${statusColors[order.status]}">${order.status.toUpperCase()}</span>
                    </div>
                    <div>
                        <p class="text-gray-600 text-sm">Customer</p>
                        <p class="font-semibold text-gray-800">${order.customer_name || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 text-sm">Table</p>
                        <p class="font-semibold text-gray-800">${order.table_number || 'N/A'}</p>
                    </div>
                    <div>
                        <p class="text-gray-600 text-sm">Total</p>
                        <p class="text-xl font-bold text-green-600">${formatCurrency(order.total_amount)}</p>
                    </div>
                </div>

                <div class="bg-gray-50 rounded p-4 mb-4">
                    <h4 class="font-bold text-gray-800 mb-2">Items:</h4>
                    <ul class="space-y-1 text-gray-700">
                        ${order.items.map(item => {
                            const sizeInfo = item.size ? ` (${item.size.name})` : '';
                            return `
                                <li class="flex justify-between">
                                    <span>• ${menuItemMap[item.menu_item_id] || 'Unknown Item'}${sizeInfo} x${item.quantity}</span>
                                    <span>${formatCurrency(item.subtotal)}</span>
                                </li>
                            `;
                        }).join('')}
                    </ul>
                </div>

                ${order.notes ? `
                <div class="bg-yellow-50 rounded p-4 mb-4 border-l-4 border-yellow-400">
                    <h4 class="font-bold text-gray-800 mb-2">Special Notes:</h4>
                    <p class="text-gray-700">${order.notes}</p>
                </div>
                ` : ''}

                <div class="flex gap-2 flex-wrap">
                    ${order.status === 'pending' ? `
                        <button data-order-id="${order.id}" data-status="preparing" class="update-status-button bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold text-sm">Mark Preparing</button>
                    ` : ''}
                    ${order.status === 'preparing' ? `
                        <button data-order-id="${order.id}" data-status="ready" class="update-status-button bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 font-semibold text-sm">Mark Ready</button>
                    ` : ''}
                    ${order.status !== 'completed' && order.status !== 'cancelled' && !order.payment ? `
                        <button data-order-id="${order.id}" data-amount="${order.total_amount}" class="payment-button bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 font-semibold text-sm">Pay</button>
                    ` : ''}
                    ${order.status !== 'completed' && order.status !== 'cancelled' ? `
                        <button data-order-id="${order.id}" data-status="cancelled" class="update-status-button bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 font-semibold text-sm">Cancel</button>
                    ` : ''}
                </div>

                ${order.payment ? `
                    <div class="mt-4 bg-green-50 p-3 rounded border border-green-200">
                        <p class="text-green-800"><strong>✓ Paid:</strong> ${formatCurrency(order.payment.amount)} via ${order.payment.method.toUpperCase()}</p>
                    </div>
                ` : ''}
            </div>
        `).join('');
    }

    ordersList.querySelectorAll('.update-status-button').forEach(button => {
        button.addEventListener('click', () => updateOrderStatus(button.dataset.orderId, button.dataset.status));
    });

    ordersList.querySelectorAll('.payment-button').forEach(button => {
        button.addEventListener('click', () => showPaymentForm(button.dataset.orderId, button.dataset.amount));
    });
}
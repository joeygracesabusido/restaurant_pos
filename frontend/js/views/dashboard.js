import { loadHTML } from '../utils/dom.js';
import { appState, renderApp } from '../app.js';
import { formatCurrency } from '../utils/formatters.js';
import { switchView } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

export async function renderDashboard(content) {
    const welcomeName = appState.user?.full_name || 'User';
    
    content.innerHTML = await loadHTML('dashboard');
    document.getElementById('welcome-message').innerHTML = `Welcome, <strong>${welcomeName}</strong>`;

    document.getElementById('logout-button').addEventListener('click', logout);
    document.querySelectorAll('.quick-action-button').forEach(button => {
        button.addEventListener('click', () => switchView(button.dataset.view));
    });

    // TEMPORARY: For debugging, always display admin-only buttons
    const insertMenuButton = document.querySelector('[data-view="insert-menu"]');
    const manageMenuButton = document.querySelector('[data-view="manage-menu"]');

    if (insertMenuButton) {
        insertMenuButton.style.display = 'block';
        insertMenuButton.classList.remove('opacity-50', 'cursor-not-allowed');
        // Ensure text color is white as per dashboard.html's original intention1
        insertMenuButton.classList.add('text-white');
        insertMenuButton.classList.remove('text-black'); // Remove black if it was there
    }
    if (manageMenuButton) {
        manageMenuButton.style.display = 'block';
        manageMenuButton.classList.remove('opacity-50', 'cursor-not-allowed');
        // Ensure text color is white as per dashboard.html's original intention
        manageMenuButton.classList.add('text-white');
        manageMenuButton.classList.remove('text-black'); // Remove black if it was there
    }
    // END TEMPORARY

    const statsGrid = document.getElementById('stats-grid');
    statsGrid.innerHTML = `
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-blue-600">
            <h3 class="text-gray-600 text-sm font-semibold mb-2">Total Orders</h3>
            <p class="text-4xl font-bold text-blue-600">${appState.orders.length}</p>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-green-600">
            <h3 class="text-gray-600 text-sm font-semibold mb-2">Completed</h3>
            <p class="text-4xl font-bold text-green-600">${appState.orders.filter(o => o.status === 'completed').length}</p>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-yellow-600">
            <h3 class="text-gray-600 text-sm font-semibold mb-2">In Progress</h3>
            <p class="text-4xl font-bold text-yellow-600">${appState.orders.filter(o => ['pending', 'preparing', 'ready'].includes(o.status)).length}</p>
        </div>
        <div class="bg-white rounded-lg shadow-lg p-6 border-l-4 border-purple-600">
            <h3 class="text-gray-600 text-sm font-semibold mb-2">Revenue</h3>
            <p class="text-4xl font-bold text-purple-600">${formatCurrency(appState.orders.filter(o => o.status === 'completed' && o.payment).reduce((sum, o) => sum + (o.payment?.amount || 0), 0))}</p>
        </div>
    `;

    const recentOrdersContainer = document.getElementById('recent-orders-container');
    if (appState.orders.length === 0) {
        recentOrdersContainer.innerHTML = `
            <div class="text-center py-8">
                <p class="text-gray-500 text-lg">No orders yet. Start by creating one!</p>
            </div>
        `;
    } else {
        recentOrdersContainer.innerHTML = `
            <div class="overflow-x-auto">
                <table class="w-full">
                    <thead class="bg-gray-50 border-b-2 border-gray-200">
                        <tr>
                            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Order ID</th>
                            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Total</th>
                            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Payment</th>
                            <th class="px-6 py-3 text-left text-sm font-semibold text-gray-700">Time</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-200">
                        ${appState.orders.slice(-5).reverse().map(order => {
                            const statusColors = {
                                'pending': 'bg-yellow-100 text-yellow-800',
                                'preparing': 'bg-blue-100 text-blue-800',
                                'ready': 'bg-green-100 text-green-800',
                                'completed': 'bg-gray-100 text-gray-800',
                                'cancelled': 'bg-red-100 text-red-800'
                            };
                            return `
                                <tr class="hover:bg-gray-50">
                                    <td class="px-6 py-3 text-sm font-mono text-gray-800">${order.id.substring(0, 8)}...</td>
                                    <td class="px-6 py-3 text-sm font-bold text-green-600">${formatCurrency(order.total_amount)}</td>
                                    <td class="px-6 py-3 text-sm">
                                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColors[order.status]}">
                                            ${order.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td class="px-6 py-3 text-sm">
                                        ${order.payment ? `<span class="text-green-600 font-semibold">✓ Paid</span>` : '<span class="text-gray-500">Pending</span>'}
                                    </td>
                                    <td class="px-6 py-3 text-sm text-gray-600">${new Date(order.created_at).toLocaleString()}</td>
                                </tr>
                            `;
                        }).join('')}
                    </tbody>
                </table>
            </div>
        `;
    }
}
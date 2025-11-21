import { apiCall } from './api.js';
import { appState } from '../app.js';
import { showError, showSuccess } from '../utils/errors.js';
import { renderApp } from '../app.js';

export async function fetchOrders(status = null) {
    let endpoint = '/orders';
    if (status) {
        endpoint += `?status_filter=${status}`;
    }
    const orders = await apiCall(endpoint);
    if (orders) {
        appState.orders = orders;
    }
}

export async function createOrder(cartItems) {
    if (cartItems.length === 0) {
        showError('Cart is empty');
        return;
    }

    const orderData = {
        items: cartItems.map(item => ({
            menu_item_id: item.id,
            quantity: item.quantity,
            special_instructions: item.instructions || null,
            size: item.size,
            addons: item.addons
        })),
        table_number: parseInt(document.getElementById('tableNumber')?.value) || null,
        customer_name: document.getElementById('customerName')?.value || null,
        notes: document.getElementById('orderNotes')?.value || null
    };

    const order = await apiCall('/orders', 'POST', orderData);
    if (order) {
        appState.cart = [];
        showSuccess('Order created successfully!');
        setTimeout(() => {
            appState.currentView = 'orders';
            renderApp();
        }, 1500);
    }
}

export async function updateOrderStatus(orderId, newStatus) {
    const order = await apiCall(`/orders/${orderId}/status/${newStatus}`, 'PUT');
    if (order) {
        showSuccess(`Order status updated to ${newStatus}`);
        await fetchOrders();
        renderApp();
    }
}

export async function payOrder(orderId, paymentMethod, amount) {
    const payment = {
        method: paymentMethod,
        amount: parseFloat(amount)
    };

    const order = await apiCall(`/orders/${orderId}/payment`, 'POST', payment);
    if (order) {
        showSuccess('Payment processed successfully!');
        await fetchOrders();
        renderApp();
    }
}

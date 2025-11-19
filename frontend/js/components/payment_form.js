import { payOrder } from '../api/orders.js';
import { showError } from '../utils/errors.js';

export function showPaymentForm(orderId, amount) {
    const methods = ['cash', 'card', 'digital'];
    let html = `
        <div id="payment-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
                <h3 class="text-xl font-bold mb-4 text-gray-800">Process Payment</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                        <input type="number" id="paymentAmount" value="${amount}" class="w-full px-4 py-2 border border-gray-300 rounded-lg" step="0.01">
                    </div>
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">Payment Method</label>
                        <select id="paymentMethod" class="w-full px-4 py-2 border border-gray-300 rounded-lg">
                            ${methods.map(m => `<option value="${m}">${m.toUpperCase()}</option>`).join('')}
                        </select>
                    </div>
                    <div class="flex gap-3">
                        <button id="process-payment-button" class="flex-1 bg-green-600 text-white py-2 rounded-lg hover:bg-green-700 font-semibold">Pay</button>
                        <button id="cancel-payment-button" class="flex-1 bg-gray-400 text-white py-2 rounded-lg hover:bg-gray-500 font-semibold">Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);

    document.getElementById('process-payment-button').addEventListener('click', () => processPayment(orderId));
    document.getElementById('cancel-payment-button').addEventListener('click', closePaymentForm);
}

function closePaymentForm() {
    document.getElementById('payment-modal').remove();
}

async function processPayment(orderId) {
    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const method = document.getElementById('paymentMethod').value;

    if (!amount || amount <= 0) {
        showError('Please enter a valid amount');
        return;
    }

    await payOrder(orderId, method, amount);
    closePaymentForm();
}

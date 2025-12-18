import { loadHTML } from '../utils/dom.js';
import { createCategory } from '../api/menu.js';
import { returnToDashboard } from '../handlers/view_handlers.js';
import { logout } from '../api/api.js';

export async function renderInsertCategoryView(content) {
    try {
        content.innerHTML = await loadHTML('insert_category');
    } catch (error) {
        console.error("Error loading insert_category.html:", error);
        content.innerHTML = `<p class="text-red-500">Failed to load insert category form. Please try again.</p>`;
        return;
    }

    document.getElementById('back-to-dashboard').addEventListener('click', returnToDashboard);
    document.getElementById('logout-button').addEventListener('click', logout);

    document.getElementById('createCategoryForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const categoryName = document.getElementById('categoryName').value;
        if (categoryName) {
            try {
                await createCategory({ name: categoryName });
                alert('Category created successfully!');
                returnToDashboard();
            } catch (error) {
                alert('Failed to create category. Please try again.');
                console.error('Error creating category:', error);
            }
        }
    });
}

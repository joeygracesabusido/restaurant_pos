import { appState, renderApp } from '../app.js';
import { fetchMenuItems } from '../api/menu.js';
import { renderPublicMenuView } from '../views/public_menu.js';

export async function selectCategory(categoryId, isPublic = false) {
    appState.selectedCategory = categoryId;
    if (categoryId) {
        await fetchMenuItems(categoryId);
    } else {
        await fetchMenuItems();
    }

    if (isPublic) {
        renderPublicMenuView();
    } else {
        renderApp();
    }
}

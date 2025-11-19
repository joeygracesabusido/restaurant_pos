import { appState, renderApp } from '../app.js';

export function switchView(view) {
    appState.currentView = view;
    renderApp();
}

export function returnToDashboard() {
    appState.currentView = 'dashboard';
    renderApp();
}

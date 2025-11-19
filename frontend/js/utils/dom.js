export async function loadHTML(view) {
    const timestamp = new Date().getTime(); // Generate a unique timestamp
    const response = await fetch(`pages/${view}.html?_=${timestamp}`);
    if (!response.ok) {
        throw new Error(`Failed to load HTML for ${view}`);
    }
    return response.text();
}

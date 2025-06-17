const API_KEY = "8f49841c2f904cc9806fce70482c654a";
const searchBtn = document.getElementById("searchBtn");
const ingredientInput = document.getElementById("ingredientInput");
const recipesContainer = document.getElementById("recipesContainer");
const favoritesContainer = document.getElementById("favoritesContainer");

searchBtn.addEventListener("click", () => {
    const ingredients = ingredientInput.value.trim();
    if (!ingredients) return;
    fetchRecipes(ingredients);
});

async function fetchRecipes(ingredients) {
    const url = `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${ingredients}&number=5&apiKey=${API_KEY}`;
    try {
        const res = await fetch(url);
        const recipes = await res.json();
        displayRecipes(recipes);
    } catch (err) {
        console.error("Error fetching recipes:", err);
    }
}

function displayRecipes(recipes) {
    recipesContainer.innerHTML = "";

    recipes.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";

        // Initial basic layout
        card.innerHTML = `
            <h3>${recipe.title}</h3>
            <img src="${recipe.image}" alt="${recipe.title}" />
            <div class="details">
                <p>Loading details...</p>
            </div>
            <button class="save-btn">Save to Favorites</button>
        `;

        // Save button
        const saveBtn = card.querySelector(".save-btn");
        saveBtn.addEventListener("click", () => saveToFavorites(recipe));

        // Fetch and display full details inline
        fetchRecipeDetails(recipe.id, card.querySelector(".details"));

        recipesContainer.appendChild(card);
    });
}


function saveToFavorites(recipe) {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    if (!favorites.some(r => r.id === recipe.id)) {
        favorites.push(recipe);
        localStorage.setItem("favorites", JSON.stringify(favorites));
        showFavorites();
    }
}

function showFavorites() {
    const favorites = JSON.parse(localStorage.getItem("favorites")) || [];
    favoritesContainer.innerHTML = "";
    favorites.forEach(recipe => {
        const card = document.createElement("div");
        card.className = "recipe-card";
        card.innerHTML = `
      <h3>${recipe.title}</h3>
      <img src="${recipe.image}" alt="${recipe.title}" />
    `;
        favoritesContainer.appendChild(card);
    });
}

// Show saved favorites on load
// showFavorites();





async function fetchRecipeDetails(id, detailsContainer) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${API_KEY}`);
        if (!res.ok) throw new Error("Failed to fetch details");

        const data = await res.json();

        const calories = data.nutrition?.nutrients?.find(n => n.name === "Calories");

        detailsContainer.innerHTML = `
            <p><strong>Servings:</strong> ${data.servings}</p>
            <p><strong>Time:</strong> ${data.readyInMinutes} mins</p>
            <p><strong>Calories:</strong> ${calories ? Math.round(calories.amount) + " kcal" : "N/A"}</p>
            <p>${data.summary.replace(/<[^>]*>?/gm, '').slice(0, 180)}...</p>
        `;
    } catch (err) {
        detailsContainer.innerHTML = `<p style="color:red;">Error loading details.</p>`;
        console.error(err);
    }
}




function showRecipeModal(data) {
    document.getElementById("modalTitle").textContent = data.title;
    document.getElementById("modalServings").textContent = data.servings;
    document.getElementById("modalTime").textContent = data.readyInMinutes;

    // Approx calories from nutrition object if available
    const calories = data.nutrition?.nutrients?.find(n => n.name === "Calories");
    document.getElementById("modalCalories").textContent = calories ? Math.round(calories.amount) + " kcal" : "N/A";

    document.getElementById("modalInstructions").textContent = data.instructions || "No instructions provided.";

    document.getElementById("recipeModal").style.display = "flex";
}


document.querySelector(".close-btn").addEventListener("click", () => {
    document.getElementById("recipeModal").style.display = "none";
});

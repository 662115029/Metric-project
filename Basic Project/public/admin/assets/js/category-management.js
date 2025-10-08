document.addEventListener("DOMContentLoaded", function () {
    let categoriesData = [];
    let allGamesData = [];
    let currentCategoryGames = [];
    let inCategoryView = false;

    function normalizeText(text) {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    }

    function displayCategories(categories) {
        const categoriesContainer = document.getElementById("categories");
        categoriesContainer.innerHTML = ""; 

        if (categories.length === 0) {
            categoriesContainer.innerHTML = `<p class="no-results">No categories found.</p>`;
            return;
        }

        categories.forEach(category => {
            const categoryElement = document.createElement("div");
            categoryElement.classList.add("category");
            categoryElement.innerHTML = `
                <img src="../${category.thumbnail}" alt="${category.name}">
                <div class="game-info">
                    <h3>${category.name}</h3>
                    <button class="delete-category-btn" data-category-id="${category.id}">Delete</button>
                </div>
            `;
            categoriesContainer.appendChild(categoryElement);
        });

        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-category-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const categoryId = this.getAttribute('data-category-id');
                if (confirm('Are you sure you want to delete this category?')) {
                    await deleteCategory(categoryId);
                }
            });
        });
    }

    async function deleteCategory(categoryId) {
        // Get admin token from localStorage
        const token = localStorage.getItem("adminToken");

        if (!token) {
            alert("You must be logged in as an admin to delete categories");
            return;
        }

        try {
            const response = await fetch(`http://localhost:3000/api/categories/${categoryId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchCategories(); // Refresh the category list after deletion
            } else {
                alert(data.message || 'Failed to delete the category.');
            }
        } catch (error) {
            console.error('Error deleting category:', error);
            alert('An error occurred while deleting the category.');
        }
    }

    function showGamesForCategory(category_id) {
        fetch(`http://localhost:3000/api/games?category_id=${category_id}`)
            .then(response => response.json())
            .then(games => {
                currentCategoryGames = games;
                inCategoryView = true;
                displayGames(games);
                
                document.getElementById("categories").style.display = "none";
                document.getElementById("games-container").style.display = "block";
            })
            .catch(error => console.error("Error fetching games:", error));
    }

    function displayGames(games) {
        const gamesList = document.getElementById("games-list");
        gamesList.innerHTML = "";

        if (games.length === 0) {
            gamesList.innerHTML = `<p class="no-results">No games match your search.</p>`;
            return;
        }

        games.forEach(game => {
            const gameElement = document.createElement("div");
            gameElement.classList.add("game-card");
            gameElement.innerHTML = `
                <img class="game-image" src="${game.thumbnail}" alt="${game.title}">
                <div class="game-title">${game.title}</div>
                <div class="game-price">
                    <del>$${game.price}</del> <span class="promo-price">$${game.promo_price}</span>
                </div>
            `;

            gameElement.addEventListener("click", () => {
                window.location.href = `gamepage.html?id=${game.game_id}`;
            });

            gamesList.appendChild(gameElement);
        });
    }

    function searchHandler(searchTerm) {
        const normalizedSearchTerm = normalizeText(searchTerm);

        if (!inCategoryView) {
            // If no category is selected, search for categories
            const filteredCategories = categoriesData.filter(category =>
                normalizeText(category.name).includes(normalizedSearchTerm)
            );
            displayCategories(filteredCategories);
        } else {
            // If inside a category, search for games within that category
            const filteredGames = currentCategoryGames.filter(game =>
                normalizeText(game.title).includes(normalizedSearchTerm)
            );
            displayGames(filteredGames);
        }
    }

    function fetchCategories() {
        fetch('http://localhost:3000/api/categories')
            .then(response => response.json())
            .then(data => {
                categoriesData = data;
                displayCategories(categoriesData);
            })
            .catch(error => console.error("Error fetching categories:", error));
    }

    function fetchAllGames() {
        fetch('http://localhost:3000/api/games')
            .then(response => response.json())
            .then(games => {
                allGamesData = games;
            })
            .catch(error => console.error("Error fetching all games:", error));
    }

    document.getElementById("search-bar").addEventListener("input", function () {
        searchHandler(this.value);
    });

    document.getElementById("back-to-categories").addEventListener("click", function () {
        document.getElementById("games-container").style.display = "none";
        document.getElementById("categories").style.display = "grid";
        document.getElementById("search-bar").value = "";
        inCategoryView = false;
        displayCategories(categoriesData);
    });

    fetchCategories();
    fetchAllGames();
});

document.addEventListener('DOMContentLoaded', async function () {
    const categoryFilter = document.getElementById('category-filter');
    
    async function fetchCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            const categories = await response.json();

            // Clear existing options except "All Categories"
            categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

            // Populate dropdown with available categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id; // Assuming category has an `id`
                option.textContent = category.name; // Assuming category has a `name`
                categoryFilter.appendChild(option);
            });

        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    await fetchCategories(); // Load categories on page load
});

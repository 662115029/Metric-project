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
                <img src="${category.thumbnail}" alt="${category.name}">
                <div class="game-info">
                    <h3>${category.name}</h3>
                </div>
            `;

            categoryElement.addEventListener("click", function () {
                showGamesForCategory(category.id);
            });

            categoriesContainer.appendChild(categoryElement);
        });
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


document.addEventListener('DOMContentLoaded', async function () {
    const categoriesContainer = document.getElementById('categories');
    const gamesContainer = document.getElementById('games-container');
    const gamesList = document.getElementById('games-list');
    const searchBar = document.getElementById('search-bar');
    
    let allGames = [];
    let currentCategory = null;

    // Fetch and display categories
    async function fetchCategories() {
        try {
            console.log("📂 Fetching categories...");
            const response = await fetch('http://localhost:3000/api/categories');
            
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            
            const categories = await response.json();
            console.log("✅ Categories loaded:", categories);
            
            displayCategories(categories);
        } catch (error) {
            console.error("❌ Error fetching categories:", error);
            categoriesContainer.innerHTML = '<p style="color: white; text-align: center;">Error loading categories. Please try again.</p>';
        }
    }

    // Display categories
    function displayCategories(categories) {
        categoriesContainer.innerHTML = '';
        
        if (categories.length === 0) {
            categoriesContainer.innerHTML = '<p style="color: white; text-align: center;">No categories available.</p>';
            return;
        }

        categories.forEach(category => {
            const categoryElement = document.createElement('div');
            categoryElement.classList.add('category-item');
            categoryElement.innerHTML = `
                <img src="${category.thumbnail || 'assets/images/default-category.jpg'}" alt="${category.name}">
                <h3>${category.name}</h3>
            `;
            
            categoryElement.addEventListener('click', () => {
                currentCategory = category.id;
                fetchGamesByCategory(category.id);
            });
            
            categoriesContainer.appendChild(categoryElement);
        });
    }

    // Fetch games by category
    async function fetchGamesByCategory(categoryId) {
        try {
            console.log(`🎮 Fetching games for category ${categoryId}...`);
            const response = await fetch(`http://localhost:3000/api/games?category_id=${categoryId}`);
            
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            
            const games = await response.json();
            console.log("✅ Games loaded:", games);
            
            allGames = games;
            displayGames(games);
            showGamesView();
        } catch (error) {
            console.error("❌ Error fetching games:", error);
            gamesList.innerHTML = '<p style="color: white; text-align: center;">Error loading games. Please try again.</p>';
        }
    }

    // Display games
    function displayGames(games) {
        gamesList.innerHTML = '';
        
        if (games.length === 0) {
            gamesList.innerHTML = '<p style="color: white; text-align: center; padding: 50px;">No games found in this category.</p>';
            return;
        }

        games.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('game-item');
            
            // Parse prices
            const originalPrice = parseFloat(game.price) || 0;
            const promoPrice = game.promo_price && parseFloat(game.promo_price) > 0 ? parseFloat(game.promo_price) : null;
            
            // Build price HTML
            let priceHTML = '';
            if (promoPrice !== null && promoPrice < originalPrice) {
                const discount = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
                priceHTML = `
                    <div class="game-price">
                        <del style="color: #ff6b6b;">$${originalPrice.toFixed(2)}</del>
                        <span class="promo-price">$${promoPrice.toFixed(2)}</span>
                        <span style="color: #ffa500; font-size: 12px; display: block;">-${discount}%</span>
                    </div>
                `;
            } else {
                priceHTML = `
                    <div class="game-price">
                        <span class="normal-price">$${originalPrice.toFixed(2)}</span>
                    </div>
                `;
            }
            
            gameElement.innerHTML = `
                <img src="${game.thumbnail || 'assets/images/default-game.jpg'}" alt="${game.title}" class="game-image">
                <div class="game-title">${game.title}</div>
                ${priceHTML}
            `;
            
            // Add click handler to view game details
            gameElement.addEventListener('click', () => {
                window.location.href = `gamepage.html?id=${game.game_id}`;
            });
            
            gamesList.appendChild(gameElement);
        });
    }

    // Show games view, hide categories
    function showGamesView() {
        categoriesContainer.style.display = 'none';
        gamesContainer.style.display = 'block';
    }

    // Show categories view, hide games
    function showCategories() {
        categoriesContainer.style.display = 'grid';
        gamesContainer.style.display = 'none';
        searchBar.value = '';
        currentCategory = null;
        allGames = [];
    }

    // Search functionality
    if (searchBar) {
        searchBar.addEventListener('input', function () {
            const searchTerm = searchBar.value.toLowerCase().trim();
            
            if (searchTerm === '') {
                if (currentCategory) {
                    fetchGamesByCategory(currentCategory);
                } else {
                    fetchAllGames();
                }
                return;
            }
            
            // Filter games by search term
            const filteredGames = allGames.filter(game => 
                game.title.toLowerCase().includes(searchTerm) ||
                (game.developer && game.developer.toLowerCase().includes(searchTerm))
            );
            
            displayGames(filteredGames);
            
            if (filteredGames.length === 0) {
                gamesList.innerHTML = `<p style="color: white; text-align: center; padding: 50px;">No games found matching "${searchTerm}"</p>`;
            }
        });
    }

    // Fetch all games for search
    async function fetchAllGames() {
        try {
            console.log("🎮 Fetching all games...");
            const response = await fetch('http://localhost:3000/api/games');
            
            if (!response.ok) {
                throw new Error('Failed to fetch games');
            }
            
            const games = await response.json();
            console.log("✅ All games loaded:", games);
            
            allGames = games;
            displayGames(games);
            showGamesView();
        } catch (error) {
            console.error("❌ Error fetching games:", error);
            gamesList.innerHTML = '<p style="color: white; text-align: center;">Error loading games. Please try again.</p>';
        }
    }

    // Make showCategories globally available
    window.showCategories = showCategories;

    // Initial load
    fetchCategories();
});
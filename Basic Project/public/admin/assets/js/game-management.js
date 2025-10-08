document.addEventListener('DOMContentLoaded', async function () {
    const gameListContainer = document.querySelector('.game-list');
    const categoryFilter = document.getElementById('category-filter');
    const searchBar = document.getElementById('search-bar');

    let allGames = []; // Stores all games from database
    let filteredGames = []; // Stores search results
    let currentCategory = 'all'; // Default to all categories

    async function fetchGames() {
        try {
            const response = await fetch('http://localhost:3000/api/games');
            allGames = await response.json();
            applyFilters();
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    }

    function applyFilters() {
        console.log("Selected Category:", currentCategory); // Debugging line

        // Filter games based on category
        if (currentCategory === 'all') {
            filteredGames = [...allGames];
        } else {
            filteredGames = allGames.filter(game => String(game.category_id) === currentCategory);
        }

        console.log("Filtered Games:", filteredGames); // Debugging line
        showPage();
    }

    function showPage() {
        gameListContainer.innerHTML = ""; // Clear previous content

        if (filteredGames.length === 0) {
            const message = document.createElement('div');
            message.textContent = 'No games found.';
            message.style.textAlign = 'center';
            message.style.padding = '20px';
            message.style.color = 'rgba(255, 255, 255, 0.7)';
            gameListContainer.appendChild(message);
            return;
        }

        filteredGames.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('game-item');

            gameElement.innerHTML = `
                <img src="../${game.thumbnail || 'default-thumbnail.jpg'}" alt="${game.title || 'Untitled'}" class="game-image">
                <div class="game-title">${game.title || 'Untitled'}</div>
                <button class="delete-game-btn" data-game-id="${game.game_id}">Delete</button>
            `;
            gameListContainer.appendChild(gameElement);
        });

        document.querySelectorAll('.delete-game-btn').forEach(button => {
            button.addEventListener('click', async function () {
                const gameId = this.getAttribute('data-game-id');
                if (confirm('Are you sure you want to delete this game?')) {
                    await deleteGame(gameId);
                }
            });
        });
    }

    async function deleteGame(gameId) {
        try {
            const response = await fetch(`http://localhost:3000/api/games/${gameId}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (response.ok) {
                alert(data.message);
                fetchGames(); // Refresh games
            } else {
                alert(data.message || 'Failed to delete the game.');
            }
        } catch (error) {
            console.error('Error deleting game:', error);
            alert('An error occurred while deleting the game.');
        }
    }

    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase().trim();
        applyFilters();
        if (searchTerm) {
            filteredGames = filteredGames.filter(game =>
                game.title && game.title.toLowerCase().includes(searchTerm)
            );
        }
        showPage();
    });

    categoryFilter.addEventListener('change', function () {
        currentCategory = categoryFilter.value; // Update selected category
        applyFilters(); // Apply category filter
    });

    async function fetchCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/categories');
            const categories = await response.json();

            categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id; // Ensure this matches game.category_id
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });

        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    await fetchCategories();
    await fetchGames(); // Load all games initially
});


document.addEventListener('DOMContentLoaded', async function () {
    const categoryFilter = document.getElementById('category-filter');
    
    async function fetchCategories() {
        try {
            const response = await fetch('http://localhost:3000/api/categories'); // Adjust URL as needed
            const categories = await response.json();

            // Clear existing options except "All Categories"
            categoryFilter.innerHTML = `<option value="all">All Categories</option>`;

            // Populate dropdown with available categories
            categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.id; // Use category ID or name based on your database structure
                option.textContent = category.name;
                categoryFilter.appendChild(option);
            });

        } catch (error) {
            console.error("Error fetching categories:", error);
        }
    }

    await fetchCategories(); // Load categories on page load
});


document.addEventListener('DOMContentLoaded', async function () {
    const gameListContainer = document.querySelector('.game-list');

    async function fetchGames() {
        try {
            const response = await fetch('http://localhost:3000/api/games');
            const games = await response.json();
            renderGames(games);
        } catch (error) {
            console.error("Error fetching games:", error);
        }
    }

    function renderGames(games) {
        gameListContainer.innerHTML = ""; // Clear existing content

        games.forEach(game => {
            const gameElement = document.createElement('div');
            gameElement.classList.add('game-item');
            gameElement.innerHTML = `
                <img src="${game.thumbnail}" alt="${game.title}" class="game-image">
                <div class="game-title">${game.title}</div>
            `;
            gameListContainer.appendChild(gameElement);
        });
    }

    fetchGames(); // Fetch and display games on page load
});



    document.addEventListener('DOMContentLoaded', function () {
        let allGames = []; // Stores all games from database
        let filteredGames = []; // Stores search results
        let currentPage = 1;
        const gamesPerPage = 7;  // Change this line to 7 instead of 8

        const prevButton = document.getElementById("prev-page");
        const nextButton = document.getElementById("next-page");
        const pageInfo = document.getElementById("page-info");
        const searchBar = document.getElementById('search-bar');
        const gameListContainer = document.querySelector('.game-list');

        // Fetch games from backend
        async function fetchGames() {
            try {
                const response = await fetch('http://localhost:3000/api/games'); // Adjust API route as needed
                allGames = await response.json();
                filteredGames = [...allGames]; // Initialize filteredGames
                showPage(currentPage);
            } catch (error) {
                console.error("Error fetching games:", error);
            }
        }

        // Function to show a specific page

        function showPage(page) {
const startIndex = (page - 1) * gamesPerPage;
const endIndex = startIndex + gamesPerPage;

gameListContainer.innerHTML = ""; // Clear previous content

filteredGames.slice(startIndex, endIndex).forEach(game => {
const gameElement = document.createElement('div');
gameElement.classList.add('game-item');

// Check if the game has a promotional price
const priceHTML = game.promo_price
    ? `
        <span class="original-price">$${game.price}</span>
        <span class="promo-price">$${game.promo_price}</span>
      `
    : `<span class="normal-price">$${game.price}</span>`;

gameElement.innerHTML = `
    <img src="${game.thumbnail || 'default-thumbnail.jpg'}" alt="${game.title || 'Untitled'}" class="game-image">
    <div class="game-title">${game.title || 'Untitled'}</div>
    <div class="game-price">
        ${priceHTML}
    </div>
    <a href="gamepage.html?id=${game.game_id}" class="game-detail-btn" data-game-id="${game.game_id}">Game Detail</a>
`;
gameListContainer.appendChild(gameElement);
});

prevButton.disabled = (page === 1);
nextButton.disabled = (page >= Math.ceil(filteredGames.length / gamesPerPage));

pageInfo.textContent = `Page ${page} of ${Math.max(1, Math.ceil(filteredGames.length / gamesPerPage))}`;
}

        



    // Search function
    searchBar.addEventListener('input', function () {
        const searchTerm = searchBar.value.toLowerCase();
        filteredGames = allGames.filter(game => 
            game.title.toLowerCase().includes(searchTerm)
        );

        currentPage = 1; // Reset to first page when searching
        showPage(currentPage);

        // Show "No results" message if no games match
        const noResultsMessage = document.getElementById('no-results-message');
        if (filteredGames.length === 0 && searchTerm !== '') {
            if (!noResultsMessage) {
                const message = document.createElement('div');
                message.id = 'no-results-message';
                message.textContent = 'No games found matching your search.';
                message.style.textAlign = 'center';
                message.style.padding = '20px';
                message.style.color = 'rgba(255, 255, 255, 0.7)';
                searchBar.insertAdjacentElement('afterend', message);
            }
        } else if (noResultsMessage) {
            noResultsMessage.remove();
        }
    });

    // Pagination buttons
    prevButton.addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            showPage(currentPage);
        }
    });

    nextButton.addEventListener("click", function () {
        if (currentPage < Math.ceil(filteredGames.length / gamesPerPage)) {
            currentPage++;
            showPage(currentPage);
        }
    });

    // Load games on page load
    fetchGames();
});
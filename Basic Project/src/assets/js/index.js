document.addEventListener('DOMContentLoaded', function () {
    fetch('http://localhost:3000/api/games')
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to load game data");
            }
            return response.json();
        })
        .then(games => {
            const saleGames = games.filter(game => {
                return (
                    game.promo_price !== undefined &&
                    game.price !== undefined &&
                    game.promo_price !== null &&
                    game.price !== null &&
                    parseFloat(game.promo_price) < parseFloat(game.price)
                );
            });

            if (saleGames.length === 0) {
                document.getElementById('saleBanner').innerHTML = '<div class="carousel-item active"><div class="text-center p-5 text-white">No games on sale at the moment.</div></div>';
            } else {
                renderEnhancedCarousel(saleGames); // Call the updated function
            }

            renderGames(games); // Render the full game list
        })
        .catch(error => {
            console.error("Error fetching game data:", error);
        });
});

    // carousel that doesn't look horendous
    function renderEnhancedCarousel(saleGames) {
        const saleBanner = document.getElementById('saleBanner');
        saleBanner.innerHTML = ''; // Clear existing content
    
        // Calculate discount percentage and sort games by the highest discount
        const topSaleGames = saleGames
            .map(game => {
                const discountPercentage = Math.round(((parseFloat(game.price) - parseFloat(game.promo_price)) / parseFloat(game.price)) * 100);
                return { ...game, discountPercentage };
            })
            .sort((a, b) => b.discountPercentage - a.discountPercentage) // Sort by discount percentage (descending)
            .slice(0, 4); // Select the top 4 games
    
        // Render the top 4 games in the sales banner
        topSaleGames.forEach((game, index) => {
            const slideItem = document.createElement('div');
            slideItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
    
            slideItem.innerHTML = `
                <div class="sale-game-container">
                    <div class="game-cover">
                        <img src="${game.thumbnail}" alt="${game.title}" class="d-block w-100">
                    </div>
                    <div class="game-info">
                        <h5 class="game-title">${game.title}</h5>
                        <p class="price-container">
                            <del class="original-price text-danger">$${parseFloat(game.price).toFixed(2)}</del>
                            <span class="sale-price text-success">$${parseFloat(game.promo_price).toFixed(2)}</span>
                        </p>
                        <div class="discount-label">Save ${game.discountPercentage}%</div>
                        <a href="gamepage.html?id=${game.game_id}" class="btn btn-danger btn-lg mt-4">View Game</a>
                    </div>
                </div>
            `;
    
            saleBanner.appendChild(slideItem);
        });
    }
    // Your existing game list renderer
    function renderGames(games) {
        const gameList = document.getElementById("gameList");
        gameList.innerHTML = '';

        console.log("All games:", games);

        const discountedGames = games.filter(game => {
            return (
                game.promo_price !== undefined &&
                game.price !== undefined &&
                game.promo_price !== null &&
                game.price !== null &&
                parseFloat(game.promo_price) < parseFloat(game.price)
            );
        });

        console.log("Discounted games:", discountedGames);

        if (discountedGames.length === 0) {
            gameList.innerHTML = '<div class="text-center text-white">No discounted games available at the moment.</div>';
            return;
        }

        discountedGames.forEach(game => {
            const gameElement = document.createElement("div");
            gameElement.classList.add("col-md-4", "mb-4");

            gameElement.innerHTML = `
                <div class="card h-100 bg-secondary text-white game-card" data-game-id="${game.game_id}">
                    <img src="${game.thumbnail}" class="card-img-top" alt="${game.title}">
                    <div class="card-body">
                        <h5 class="card-title">${game.title}</h5>
                        <p class="card-text">Release Date: ${game.release_date}</p>
                        <p class="card-text">
                            <del class="text-danger">$${parseFloat(game.price).toFixed(2)}</del> 
                            <span class="text-success">$${parseFloat(game.promo_price).toFixed(2)}</span>
                        </p>
                        <p class="card-text">Developer: ${game.developer}</p>
                    </div>
                </div>
            `;

            // Add event listener to redirect to gamepage.html with the correct game ID
            gameElement.addEventListener('click', () => {
                window.location.href = `gamepage.html?id=${game.game_id}`;
            });

            gameList.appendChild(gameElement);
        });
    }
document.addEventListener("DOMContentLoaded", function () {
    loadCartItems();
});

async function loadCartItems() {
    const token = localStorage.getItem("token"); // Get user token for authentication

    if (!token) {
        document.getElementById("cart-items").innerHTML = "<p>Please log in to view your cart.</p>";
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/cart", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to load cart items.");
        }

        const cartItems = await response.json();
        displayCartItems(cartItems);
    } catch (error) {
        console.error("Error fetching cart:", error);
        document.getElementById("cart-items").innerHTML = "<p>Error loading cart.</p>";
    }
}

function displayCartItems(cartItems) {
    const cartContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total-price");
    cartContainer.innerHTML = "";

    let totalPrice = 0;

    cartItems.forEach(item => {
        // Ensure price is a number
        const originalPrice = parseFloat(item.price) || 0;
        const promoPrice = item.promo_price && item.promo_price > 0 ? parseFloat(item.promo_price) : null;
        const finalPrice = promoPrice ?? originalPrice; // Use promo price if available
        const totalItemPrice = finalPrice * item.quantity;
        totalPrice += totalItemPrice;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        let priceDisplay = `<p>$${originalPrice.toFixed(2)} x ${item.quantity} = $${totalItemPrice.toFixed(2)}</p>`;
        if (promoPrice) {
            priceDisplay = `
                <p>
                    <span style="text-decoration: line-through;">$${originalPrice.toFixed(2)}</span>
                    <span style="color: #e63946;">$${promoPrice.toFixed(2)}</span>
                    x ${item.quantity} = <strong>$${totalItemPrice.toFixed(2)}</strong>
                </p>`;
        }

        cartItem.innerHTML = `<p>${item.title}</p> ${priceDisplay}`;
        cartContainer.appendChild(cartItem);
    });

    // Update total price display
    cartTotalElement.textContent = totalPrice.toFixed(2);
}



// Clear cart function
async function clearCart() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to clear your cart.");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/api/cart/clear", {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to clear cart.");
        }

        alert("Cart cleared successfully.");
        loadCartItems(); // Refresh cart
    } catch (error) {
        console.error("Error clearing cart:", error);
    }
}



async function proceedToPayment() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to proceed to payment.");
        return;
    }

    try {
        console.log("🛒 Processing payment and adding to library...");
        
        // First, get cart items
        const cartResponse = await fetch("http://localhost:3000/api/cart", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const cartItems = await cartResponse.json();
        console.log("Cart items:", cartItems);
        
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Process the purchase and add to library
        const response = await fetch("http://localhost:3000/api/purchased_games/add", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ games: cartItems })
        });

        const data = await response.json();
        console.log("Purchase response:", data);
        
        if (!response.ok || !data.success) {
            throw new Error(data.message || "Failed to process purchase");
        }

        // Clear the cart after successful purchase
        await fetch("http://localhost:3000/api/cart/clear", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        alert("✅ Payment successful! Games added to your library.");
        window.location.href = "/library.html"; // Redirect to library page
    } catch (error) {
        console.error("❌ Error during payment:", error);
        alert("An error occurred during purchase. Please try again.");
    }
}

async function loadLibrary() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to view your library.");
        return;
    }

    try {
        console.log("📢 Requesting purchased games from server..."); // Debugging log

        const response = await fetch("http://localhost:3000/api/purchased-games", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to load purchased games.");
        }

        const purchasedGames = await response.json();
        console.log("✅ Purchased games received:", purchasedGames); // Debugging log
        displayLibrary(purchasedGames);
    } catch (error) {
        console.error("❌ Error fetching library:", error);
        document.getElementById("library-items").innerHTML = "<p>Error loading library.</p>";
    }
}

const userId = getUserIdFromToken();
if (userId) {
    fetch(`/api/purchased-games/${userId}`)
        .then(response => response.json())
        .then(games => {
            console.log("Purchased games:", games); // ✅ Debugging
        })
        .catch(error => console.error("Error fetching purchased games:", error));
} else {
    console.error("User ID not found in token.");
}

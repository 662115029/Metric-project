document.addEventListener("DOMContentLoaded", function () {
    loadCartItems();
});

async function loadCartItems() {
    const token = localStorage.getItem("token");

    if (!token) {
        document.getElementById("cart-items").innerHTML = "<p style='color: white; text-align: center;'>Please log in to view your cart.</p>";
        return;
    }

    try {
        console.log("🛒 Fetching cart items...");
        
        const response = await fetch("http://localhost:3000/api/cart", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.removeItem("token");
                window.location.href = "login.html";
                return;
            }
            throw new Error("Failed to load cart items.");
        }

        const cartItems = await response.json();
        console.log("✅ Cart items loaded:", cartItems);
        
        displayCartItems(cartItems);
    } catch (error) {
        console.error("❌ Error fetching cart:", error);
        document.getElementById("cart-items").innerHTML = "<p style='color: white; text-align: center;'>Error loading cart. Please try again.</p>";
    }
}

function displayCartItems(cartItems) {
    const cartContainer = document.getElementById("cart-items");
    const cartTotalElement = document.getElementById("cart-total-price");
    cartContainer.innerHTML = "";

    if (cartItems.length === 0) {
        cartContainer.innerHTML = "<p style='color: white; text-align: center; font-size: 18px;'>Your cart is empty.</p>";
        cartTotalElement.textContent = "0.00";
        return;
    }

    let totalPrice = 0;

    cartItems.forEach(item => {
        const originalPrice = parseFloat(item.price) || 0;
        const promoPrice = item.promo_price && parseFloat(item.promo_price) > 0 ? parseFloat(item.promo_price) : null;
        const finalPrice = promoPrice !== null ? promoPrice : originalPrice;
        const totalItemPrice = finalPrice * item.quantity;
        totalPrice += totalItemPrice;

        const cartItem = document.createElement("div");
        cartItem.classList.add("cart-item");

        // Build price display HTML
        let priceDisplay = '';
        if (promoPrice !== null && promoPrice < originalPrice) {
            const discount = Math.round(((originalPrice - promoPrice) / originalPrice) * 100);
            priceDisplay = `
                <div class="item-price">
                    <div style="color: #ff6b6b; text-decoration: line-through;">$${originalPrice.toFixed(2)}</div>
                    <div style="color: #45a049; font-size: 28px;">$${promoPrice.toFixed(2)}</div>
                    <div style="color: #ffa500; font-size: 14px;">Save ${discount}%</div>
                    <div style="color: #aaa; margin-top: 10px;">Quantity: ${item.quantity}</div>
                    <div style="color: white; margin-top: 5px; font-size: 20px;">Total: $${totalItemPrice.toFixed(2)}</div>
                </div>
            `;
        } else {
            priceDisplay = `
                <div class="item-price">
                    <div style="color: white; font-size: 28px;">$${originalPrice.toFixed(2)}</div>
                    <div style="color: #aaa; margin-top: 10px;">Quantity: ${item.quantity}</div>
                    <div style="color: white; margin-top: 5px; font-size: 20px;">Total: $${totalItemPrice.toFixed(2)}</div>
                </div>
            `;
        }

        cartItem.innerHTML = `
            ${item.thumbnail ? `<img src="${item.thumbnail}" alt="${item.title}" class="item-image">` : ''}
            <div class="item-details">
                <h3 style="color: white; margin: 0 0 10px 0;">${item.title}</h3>
                <div class="item-actions">
                    <a class="action-link" onclick="removeFromCart(${item.cart_id})">Remove</a>
                </div>
            </div>
            ${priceDisplay}
        `;
        
        cartContainer.appendChild(cartItem);
    });

    // Update total price display
    cartTotalElement.textContent = totalPrice.toFixed(2);
}

// Remove single item from cart
async function removeFromCart(cartId) {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to remove items from cart.");
        return;
    }

    if (!confirm("Are you sure you want to remove this item?")) {
        return;
    }

    try {
        const response = await fetch(`http://localhost:3000/api/cart/${cartId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error("Failed to remove item from cart.");
        }

        alert("Item removed from cart.");
        loadCartItems(); // Refresh cart
    } catch (error) {
        console.error("Error removing item:", error);
        alert("Error removing item from cart.");
    }
}

// Clear entire cart
async function clearCart() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to clear your cart.");
        return;
    }

    if (!confirm("Are you sure you want to remove all items from your cart?")) {
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
        alert("Error clearing cart.");
    }
}

// Proceed to payment / checkout
async function proceedToPayment() {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("Please log in to proceed to payment.");
        window.location.href = "login.html";
        return;
    }

    try {
        console.log("💳 Processing payment...");
        
        // Get cart items first
        const cartResponse = await fetch("http://localhost:3000/api/cart", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!cartResponse.ok) {
            throw new Error("Failed to fetch cart");
        }

        const cartItems = await cartResponse.json();
        console.log("Cart items to purchase:", cartItems);
        
        if (cartItems.length === 0) {
            alert("Your cart is empty!");
            return;
        }

        // Process the purchase
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

        alert("✅ Payment successful! Games added to your library.");
        
        // Redirect to library page
        window.location.href = "library.html";
    } catch (error) {
        console.error("❌ Error during payment:", error);
        alert("An error occurred during purchase: " + error.message);
    }
}
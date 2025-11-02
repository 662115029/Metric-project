require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require("path");
const fileUpload = require('express-fileupload');

const app = express();
app.use(fileUpload());
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// PostgreSQL Database Connection Pool
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'gamestore',
    port: process.env.DB_PORT || 5432
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        console.error("❌ Database connection failed. Ensure PostgreSQL is running and database exists.");
        console.error(err);
        process.exit(1);
    }
    console.log("✅ Connected to PostgreSQL Database");
    release();
});

// Secret Key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

/* --- USER REGISTRATION --- */
app.post('/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

/* --- USER LOGIN --- */
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (users.rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = users.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ 
            message: "Login successful", 
            token, 
            userId: user.id, 
            username: user.username,
            role: user.role 
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

// Middleware to authenticate user
function authenticateUser(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) {
        console.log("❌ No token provided");
        return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    try {
        const tokenValue = token.split(" ")[1];
        jwt.verify(tokenValue, JWT_SECRET, (err, user) => {
            if (err) {
                console.log("❌ Invalid token:", err.message);
                return res.status(403).json({ message: "Invalid token" });
            }
            console.log("✅ User authenticated:", user.id, user.username);
            req.user = user;
            next();
        });
    } catch (error) {
        console.error("❌ Token verification error:", error);
        return res.status(403).json({ message: "Token verification failed" });
    }
}

/* --- GET ALL GAMES --- */
app.get("/api/games", async (req, res) => {
    const categoryId = req.query.category_id;

    let query = "SELECT * FROM games ORDER BY game_id";
    let params = [];

    if (categoryId) {
        query = "SELECT * FROM games WHERE category_id = $1 ORDER BY game_id";
        params.push(categoryId);
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching games:", err);
        return res.status(500).json({ error: err.message });
    }
});

/* --- GET SINGLE GAME --- */
app.get("/api/games/:id", async (req, res) => {
    const gameId = req.params.id;
    
    try {
        const gameResult = await pool.query("SELECT * FROM games WHERE game_id = $1", [gameId]);
        
        if (gameResult.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        const game = gameResult.rows[0];
        
        // Fetch category name if category_id exists
        if (game.category_id) {
            const categoryResult = await pool.query(
                "SELECT category_name FROM categories WHERE category_id = $1",
                [game.category_id]
            );
            if (categoryResult.rows.length > 0) {
                game.category = categoryResult.rows[0].category_name;
            }
        }
        
        res.json(game);
    } catch (err) {
        console.error("Error fetching game:", err);
        return res.status(500).json({ error: err.message });
    }
});

/* --- GET CATEGORIES --- */
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query('SELECT category_id AS id, category_name AS name, icon AS thumbnail FROM categories ORDER BY category_id');

        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No categories found' });
            return;
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
});

/* --- CART ROUTES --- */

// Add item to cart - WITH DETAILED ERROR LOGGING
app.post("/api/cart/add", authenticateUser, async (req, res) => {
    const { game_id, quantity } = req.body;
    const user_id = req.user.id;

    console.log("\n🛒 ============ ADD TO CART REQUEST ============");
    console.log("User ID:", user_id);
    console.log("Game ID:", game_id);
    console.log("Quantity:", quantity);
    console.log("Body:", req.body);

    // Validation
    if (!game_id) {
        console.log("❌ Validation failed: Missing game_id");
        return res.status(400).json({ message: "Game ID is required" });
    }

    if (!quantity || quantity < 1) {
        console.log("❌ Validation failed: Invalid quantity");
        return res.status(400).json({ message: "Valid quantity is required" });
    }

    try {
        // Step 1: Check if game exists
        console.log("🔍 Step 1: Checking if game exists...");
        const gameCheck = await pool.query("SELECT game_id, title FROM games WHERE game_id = $1", [game_id]);
        
        if (gameCheck.rows.length === 0) {
            console.log("❌ Game not found in database");
            return res.status(404).json({ message: "Game not found" });
        }
        console.log("✅ Game found:", gameCheck.rows[0].title);

        // Step 2: Check if item already in cart
        console.log("🔍 Step 2: Checking if item already in cart...");
        const existing = await pool.query(
            "SELECT id, quantity FROM cart WHERE user_id = $1 AND game_id = $2 AND is_purchased = FALSE",
            [user_id, game_id]
        );

        if (existing.rows.length > 0) {
            // Update quantity
            console.log("📝 Item exists in cart, updating quantity...");
            const newQuantity = existing.rows[0].quantity + parseInt(quantity);
            
            await pool.query(
                "UPDATE cart SET quantity = $1 WHERE user_id = $2 AND game_id = $3 AND is_purchased = FALSE",
                [newQuantity, user_id, game_id]
            );
            
            console.log("✅ Cart item updated successfully");
            console.log("   Old quantity:", existing.rows[0].quantity);
            console.log("   New quantity:", newQuantity);
            console.log("============================================\n");
            
            return res.status(201).json({ 
                message: "Item quantity updated in cart",
                quantity: newQuantity
            });
        } else {
            // Insert new item
            console.log("📝 Adding new item to cart...");
            
            const result = await pool.query(
                "INSERT INTO cart (user_id, game_id, quantity, is_purchased) VALUES ($1, $2, $3, FALSE) RETURNING id",
                [user_id, game_id, quantity]
            );
            
            console.log("✅ New item added to cart successfully");
            console.log("   Cart ID:", result.rows[0].id);
            console.log("============================================\n");
            
            return res.status(201).json({ 
                message: "Item added to cart successfully",
                cart_id: result.rows[0].id
            });
        }
    } catch (error) {
        console.error("❌ DATABASE ERROR:");
        console.error("   Error code:", error.code);
        console.error("   Error message:", error.message);
        console.error("   Error detail:", error.detail);
        console.error("   Full error:", error);
        console.log("============================================\n");
        
        // Check for specific PostgreSQL errors
        if (error.code === '23505') {
            // Unique constraint violation
            return res.status(409).json({ 
                message: "Item already in cart",
                error: "Duplicate entry"
            });
        }
        
        if (error.code === '23503') {
            // Foreign key violation
            return res.status(400).json({ 
                message: "Invalid game or user reference",
                error: "Foreign key constraint"
            });
        }
        
        res.status(500).json({ 
            message: "Error adding item to cart", 
            error: error.message,
            code: error.code
        });
    }
});

// Get user cart
app.get("/api/cart", authenticateUser, async (req, res) => {
    const user_id = req.user.id;

    try {
        console.log("🛒 Fetching cart for user ID:", user_id);

        const cartItems = await pool.query(
            `SELECT 
                c.id as cart_id,
                g.game_id,
                g.title, 
                g.price, 
                g.promo_price,
                g.thumbnail,
                c.quantity,
                CASE 
                    WHEN g.promo_price IS NOT NULL AND g.promo_price > 0 
                    THEN g.promo_price 
                    ELSE g.price 
                END AS final_price,
                CASE 
                    WHEN g.promo_price IS NOT NULL AND g.promo_price > 0 
                    THEN g.promo_price * c.quantity 
                    ELSE g.price * c.quantity 
                END AS total_price 
            FROM cart c 
            JOIN games g ON c.game_id = g.game_id 
            WHERE c.user_id = $1 AND c.is_purchased = FALSE
            ORDER BY c.added_at DESC`,
            [user_id]
        );

        console.log(`✅ Found ${cartItems.rows.length} cart items`);
        res.json(cartItems.rows);
    } catch (error) {
        console.error("❌ Error retrieving cart items:", error);
        res.status(500).json({ message: "Error retrieving cart items", error: error.message });
    }
});

// Remove single item from cart
app.delete("/api/cart/:cart_id", authenticateUser, async (req, res) => {
    const { cart_id } = req.params;
    const user_id = req.user.id;

    try {
        const result = await pool.query(
            "DELETE FROM cart WHERE id = $1 AND user_id = $2",
            [cart_id, user_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Cart item not found" });
        }

        res.json({ message: "Item removed from cart" });
    } catch (error) {
        console.error("Error removing cart item:", error);
        res.status(500).json({ message: "Error removing item from cart" });
    }
});

// Clear entire cart
app.delete("/api/cart/clear", authenticateUser, async (req, res) => {
    const user_id = req.user.id;

    try {
        await pool.query(
            "DELETE FROM cart WHERE user_id = $1 AND is_purchased = FALSE",
            [user_id]
        );
        console.log("🗑️ Cart cleared for user:", user_id);
        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Error clearing cart" });
    }
});

/* --- PURCHASE / CHECKOUT --- */
app.post("/api/purchased_games/add", authenticateUser, async (req, res) => {
    const user_id = req.user.id;
    const { games } = req.body;

    if (!games || games.length === 0) {
        return res.status(400).json({ success: false, message: "No games to purchase" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('💳 Processing purchase for user:', user_id);

        for (const game of games) {
            const existing = await client.query(
                'SELECT id FROM purchased_games WHERE user_id = $1 AND game_id = $2',
                [user_id, game.game_id]
            );

            if (existing.rows.length === 0) {
                const priceResult = await client.query(
                    'SELECT COALESCE(promo_price, price) as purchase_price FROM games WHERE game_id = $1',
                    [game.game_id]
                );

                const purchasePrice = priceResult.rows[0]?.purchase_price || game.final_price;

                await client.query(
                    `INSERT INTO purchased_games (user_id, game_id, purchase_date, purchase_price) 
                     VALUES ($1, $2, NOW(), $3)`,
                    [user_id, game.game_id, purchasePrice]
                );
                console.log(`✅ Added game ${game.game_id} to library`);
            } else {
                console.log(`⚠️ Game ${game.game_id} already in library, skipping`);
            }
        }

        await client.query(
            `DELETE FROM cart WHERE user_id = $1 AND is_purchased = FALSE`,
            [user_id]
        );

        await client.query('COMMIT');
        console.log('✅ Purchase completed successfully');

        res.json({ 
            success: true,
            message: "Games successfully added to library",
            user_id: user_id,
            games: games.map(g => g.title)
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("❌ Error processing purchase:", error);
        res.status(500).json({ 
            success: false,
            message: "Error processing purchase",
            error: error.message 
        });
    } finally {
        client.release();
    }
});

/* --- GET PURCHASED GAMES / LIBRARY --- */
app.get('/api/purchased-games/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const games = await pool.query(
            `SELECT g.game_id, g.title, g.thumbnail, g.developer, p.purchase_date
             FROM purchased_games p
             JOIN games g ON p.game_id = g.game_id
             WHERE p.user_id = $1
             ORDER BY p.purchase_date DESC`, 
            [userId]
        );

        console.log(`📚 Found ${games.rows.length} purchased games for user ${userId}`);
        res.json(games.rows);
    } catch (error) {
        console.error("Error fetching purchased games:", error);
        res.status(500).json({ message: "Error fetching purchased games." });
    }
});

/* --- ADMIN ROUTES --- */

function authenticateAdmin(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token.split(" ")[1], JWT_SECRET, (err, user) => {
        if (err || user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }
        req.user = user;
        next();
    });
}

app.post("/api/admin-login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const users = await pool.query("SELECT * FROM users WHERE username = $1", [username]);
        if (users.rows.length === 0) {
            return res.status(401).json({ message: "User not found" });
        }

        const user = users.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Access denied" });
        }

        const token = jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: "1h" });

        res.json({ message: "Login successful", token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error" });
    }
});

app.post("/api/add-game", authenticateAdmin, async (req, res) => {
    const { title, price, release_date, developer, description, category_id } = req.body;
    const thumbnail = req.files?.thumbnail;
    
    let promo_price = null;
    if (req.body.promo_price !== undefined && req.body.promo_price !== null && req.body.promo_price !== '') {
        promo_price = Number(req.body.promo_price);
        if (isNaN(promo_price)) {
            promo_price = null;
        }
    }

    if (!title || !price || !release_date || !developer || !description || !thumbnail || !category_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const thumbnailPath = `assets/images/${Date.now()}_${thumbnail.name}`;
        await thumbnail.mv(path.join(__dirname, "public", thumbnailPath));
        
        const query = "INSERT INTO games (title, release_date, price, developer, description, thumbnail, category_id, promo_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING game_id";
        const params = [title, release_date, price, developer, description, thumbnailPath, category_id, promo_price];
        
        const result = await pool.query(query, params);

        console.log("✅ Game Added Successfully:", result.rows[0]);
        res.status(201).json({ message: "Game added successfully", gameId: result.rows[0].game_id });
    } catch (error) {
        console.error("❌ Database Insert Error:", error);
        res.status(500).json({ message: "Error adding game", error: error.message });
    }
});

app.put('/api/games/:game_id', authenticateAdmin, async (req, res) => {
    const { game_id } = req.params;
    const { title, release_date, price, promo_price, developer, description, category_id } = req.body;
    const thumbnail = req.files ? req.files.thumbnail : null;

    try {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (title) {
            updates.push(`title = $${paramCount++}`);
            params.push(title);
        }
        if (release_date) {
            updates.push(`release_date = $${paramCount++}`);
            params.push(release_date);
        }
        if (price) {
            updates.push(`price = $${paramCount++}`);
            params.push(price);
        }
        if (promo_price !== undefined) {
            updates.push(`promo_price = $${paramCount++}`);
            params.push(promo_price);
        }
        if (developer) {
            updates.push(`developer = $${paramCount++}`);
            params.push(developer);
        }
        if (description) {
            updates.push(`description = $${paramCount++}`);
            params.push(description);
        }
        if (category_id) {
            updates.push(`category_id = $${paramCount++}`);
            params.push(category_id);
        }
        if (thumbnail) {
            const thumbnailPath = `assets/images/${Date.now()}_${thumbnail.name}`;
            await thumbnail.mv(path.join(__dirname, "public", thumbnailPath));
            updates.push(`thumbnail = $${paramCount++}`);
            params.push(thumbnailPath);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        params.push(game_id);
        const query = `UPDATE games SET ${updates.join(', ')} WHERE game_id = $${paramCount}`;

        const result = await pool.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Game not found" });
        }

        res.status(200).json({ message: "Game updated successfully" });
    } catch (error) {
        console.error("Error updating game:", error);
        res.status(500).json({ message: "Error updating game", error: error.message });
    }
});

app.delete('/api/games/:game_id', authenticateAdmin, async (req, res) => {
    const { game_id } = req.params;

    try {
        const result = await pool.query('DELETE FROM games WHERE game_id = $1', [game_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Game not found or already deleted.' });
        }

        res.json({ message: 'Game deleted successfully!' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ message: 'Error deleting game from the database.' });
    }
});

app.post("/api/add-category", authenticateAdmin, async (req, res) => {
    const { category_name } = req.body;
    const icon = req.files?.icon;

    if (!category_name || !icon) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const iconPath = `assets/images/${icon.name}`;
        await icon.mv(path.join(__dirname, "public", iconPath));

        const result = await pool.query(
            "INSERT INTO categories (category_name, icon) VALUES ($1, $2) RETURNING category_id", 
            [category_name, iconPath]
        );

        res.status(201).json({ message: "Category added successfully", categoryId: result.rows[0].category_id });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
});

app.put('/api/categories/:category_id', authenticateAdmin, async (req, res) => {
    const { category_id } = req.params;
    const { category_name } = req.body;
    const icon = req.files ? req.files.icon : null;

    try {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (category_name) {
            updates.push(`category_name = $${paramCount++}`);
            params.push(category_name);
        }
        if (icon) {
            const iconPath = `assets/images/${icon.name}`;
            await icon.mv(path.join(__dirname, "public", iconPath));
            updates.push(`icon = $${paramCount++}`);
            params.push(iconPath);
        }

        if (updates.length === 0) {
            return res.status(400).json({ message: "No fields to update" });
        }

        params.push(category_id);
        const query = `UPDATE categories SET ${updates.join(', ')} WHERE category_id = $${paramCount}`;

        const result = await pool.query(query, params);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Category not found or no changes made.' });
        }

        res.status(200).json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
});

app.delete('/api/categories/:category_id', authenticateAdmin, async (req, res) => {
    const { category_id } = req.params;

    try {
        const result = await pool.query('DELETE FROM categories WHERE category_id = $1', [category_id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Category not found or already deleted.' });
        }

        res.json({ message: 'Category deleted successfully!' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category from the database.' });
    }
});

app.post('/api/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

app.use(express.static(path.join(__dirname, "public")));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
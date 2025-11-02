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
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(fileUpload());

// CORS Configuration (consolidated)
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Vue default dev port
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
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
        console.error("❌ Database connection failed:", err.message);
        process.exit(1);
    }
    console.log("✅ Connected to PostgreSQL Database");
    release();
});

// Secret Key for JWT
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// =============================================
// AUTHENTICATION MIDDLEWARE
// =============================================

function authenticateUser(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        req.user = user;
        next();
    });
}

function authenticateAdmin(req, res, next) {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
        return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        return res.status(401).json({ message: "Invalid token format" });
    }

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: "Invalid or expired token" });
        }
        if (user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }
        req.user = user;
        next();
    });
}

// =============================================
// USER AUTHENTICATION ROUTES
// =============================================

// User Registration
app.post('/api/register', async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    try {
        const existingUser = await pool.query(
            "SELECT * FROM users WHERE username = $1", 
            [username]
        );

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await pool.query(
            "INSERT INTO users (username, password, role) VALUES ($1, $2, $3)", 
            [username, hashedPassword, 'user']
        );

        res.status(201).json({ message: "User registered successfully" });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
});

// User Login
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1", 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "24h" }
        );

        res.json({ 
            message: "Login successful", 
            token, 
            userId: user.id, 
            username: user.username,
            role: user.role
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
});

// Admin Login
app.post("/api/admin-login", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password required" });
    }

    try {
        const result = await pool.query(
            "SELECT * FROM users WHERE username = $1", 
            [username]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const user = result.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (user.role !== "admin") {
            return res.status(403).json({ message: "Admin access required" });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role }, 
            JWT_SECRET, 
            { expiresIn: "24h" }
        );

        res.json({ message: "Admin login successful", token });
    } catch (error) {
        console.error("Admin login error:", error);
        res.status(500).json({ message: "Server error during admin login" });
    }
});

// Logout
app.post('/api/logout', (req, res) => {
    res.json({ message: 'Logged out successfully' });
});

// =============================================
// GAME ROUTES
// =============================================

// Get all games (with optional category filter)
app.get("/api/games", async (req, res) => {
    const categoryId = req.query.category_id;

    let query = "SELECT * FROM games ORDER BY created_at DESC";
    let params = [];

    if (categoryId) {
        query = "SELECT * FROM games WHERE category_id = $1 ORDER BY created_at DESC";
        params.push(categoryId);
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Error fetching games:", err);
        res.status(500).json({ error: err.message });
    }
});

// Get single game by ID
app.get("/api/games/:id", async (req, res) => {
    const gameId = req.params.id;
    
    try {
        const gameResult = await pool.query(
            "SELECT * FROM games WHERE game_id = $1", 
            [gameId]
        );
        
        if (gameResult.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        res.json(gameResult.rows[0]);
    } catch (err) {
        console.error("Error fetching game:", err);
        res.status(500).json({ error: err.message });
    }
});

// Add new game (Admin only)
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
        
        const query = `
            INSERT INTO games (title, release_date, price, developer, description, thumbnail, category_id, promo_price) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
            RETURNING game_id
        `;
        const params = [title, release_date, price, developer, description, thumbnailPath, category_id, promo_price];
        
        const result = await pool.query(query, params);

        res.status(201).json({ 
            message: "Game added successfully", 
            gameId: result.rows[0].game_id 
        });
    } catch (error) {
        console.error("Error adding game:", error);
        res.status(500).json({ message: "Error adding game", error: error.message });
    }
});

// Update game (Admin only)
app.put('/api/games/:game_id', authenticateAdmin, async (req, res) => {
    const { game_id } = req.params;
    const { title, release_date, price, promo_price, developer, description, category_id } = req.body;
    const thumbnail = req.files?.thumbnail;

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

        res.json({ message: "Game updated successfully" });
    } catch (error) {
        console.error("Error updating game:", error);
        res.status(500).json({ message: "Error updating game", error: error.message });
    }
});

// Delete game (Admin only)
app.delete('/api/games/:game_id', authenticateAdmin, async (req, res) => {
    const { game_id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM games WHERE game_id = $1',
            [game_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }

        res.json({ message: 'Game deleted successfully' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ message: 'Error deleting game' });
    }
});

// =============================================
// CATEGORY ROUTES
// =============================================

// Get all categories
app.get('/api/categories', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT category_id, category_name, icon FROM categories ORDER BY category_name'
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No categories found' });
        }

        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
});

// Add category (Admin only)
app.post("/api/add-category", authenticateAdmin, async (req, res) => {
    const { category_name } = req.body;
    const icon = req.files?.icon;

    if (!category_name || !icon) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const iconPath = `assets/images/${Date.now()}_${icon.name}`;
        await icon.mv(path.join(__dirname, "public", iconPath));

        const result = await pool.query(
            "INSERT INTO categories (category_name, icon) VALUES ($1, $2) RETURNING category_id", 
            [category_name, iconPath]
        );

        res.status(201).json({ 
            message: "Category added successfully", 
            categoryId: result.rows[0].category_id 
        });
    } catch (error) {
        console.error("Error adding category:", error);
        res.status(500).json({ message: "Error adding category", error: error.message });
    }
});

// Update category (Admin only)
app.put('/api/categories/:category_id', authenticateAdmin, async (req, res) => {
    const { category_id } = req.params;
    const { category_name } = req.body;
    const icon = req.files?.icon;

    try {
        const updates = [];
        const params = [];
        let paramCount = 1;

        if (category_name) {
            updates.push(`category_name = $${paramCount++}`);
            params.push(category_name);
        }

        if (icon) {
            const iconPath = `assets/images/${Date.now()}_${icon.name}`;
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
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: "Category updated successfully" });
    } catch (error) {
        console.error("Error updating category:", error);
        res.status(500).json({ message: "Error updating category", error: error.message });
    }
});

// Delete category (Admin only)
app.delete('/api/categories/:category_id', authenticateAdmin, async (req, res) => {
    const { category_id } = req.params;

    try {
        const result = await pool.query(
            'DELETE FROM categories WHERE category_id = $1',
            [category_id]
        );

        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }

        res.json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category' });
    }
});

// =============================================
// CART ROUTES
// =============================================

// Add to cart
app.post("/api/cart/add", authenticateUser, async (req, res) => {
    const { game_id, quantity = 1 } = req.body;
    const user_id = req.user.id;

    if (!game_id) {
        return res.status(400).json({ message: "Game ID required" });
    }

    try {
        await pool.query(
            `INSERT INTO cart (user_id, game_id, quantity) 
             VALUES ($1, $2, $3) 
             ON CONFLICT (user_id, game_id) 
             DO UPDATE SET quantity = cart.quantity + $3`,
            [user_id, game_id, quantity]
        );
        
        res.status(201).json({ message: "Item added to cart" });
    } catch (error) {
        console.error("Error adding to cart:", error);
        res.status(500).json({ message: "Error adding item to cart" });
    }
});

// Get user cart
app.get("/api/cart", authenticateUser, async (req, res) => {
    const user_id = req.user.id;

    try {
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
            WHERE c.user_id = $1 AND c.is_purchased = FALSE`,
            [user_id]
        );

        res.json(cartItems.rows);
    } catch (error) {
        console.error("Error retrieving cart:", error);
        res.status(500).json({ message: "Error retrieving cart items" });
    }
});

// Clear cart
app.delete("/api/cart/clear", authenticateUser, async (req, res) => {
    const user_id = req.user.id;

    try {
        await pool.query(
            "DELETE FROM cart WHERE user_id = $1 AND is_purchased = FALSE",
            [user_id]
        );
        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Error clearing cart" });
    }
});

// =============================================
// PURCHASE ROUTES
// =============================================

// Process purchase
app.post("/api/purchased_games/add", authenticateUser, async (req, res) => {
    const user_id = req.user.id;
    const { games } = req.body;

    if (!games || !Array.isArray(games) || games.length === 0) {
        return res.status(400).json({ message: "No games provided" });
    }

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const game of games) {
            const existing = await client.query(
                'SELECT id FROM purchased_games WHERE user_id = $1 AND game_id = $2',
                [user_id, game.game_id]
            );

            if (existing.rows.length === 0) {
                await client.query(
                    `INSERT INTO purchased_games (user_id, game_id, purchase_date, purchase_price) 
                     VALUES ($1, $2, NOW(), $3)`,
                    [user_id, game.game_id, game.final_price || game.price]
                );
            }
        }

        await client.query(
            `UPDATE cart 
             SET is_purchased = TRUE 
             WHERE user_id = $1 AND is_purchased = FALSE`,
            [user_id]
        );

        await client.query('COMMIT');

        res.json({ 
            success: true,
            message: "Purchase completed successfully"
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error processing purchase:", error);
        res.status(500).json({ 
            success: false,
            message: "Error processing purchase",
            error: error.message 
        });
    } finally {
        client.release();
    }
});

// Get purchased games
app.get('/api/purchased-games/:userId', authenticateUser, async (req, res) => {
    const userId = req.params.userId;

    // Verify user can only access their own purchases
    if (req.user.id !== parseInt(userId) && req.user.role !== 'admin') {
        return res.status(403).json({ message: "Access denied" });
    }

    try {
        const games = await pool.query(
            `SELECT g.game_id, g.title, g.thumbnail, g.price, p.purchase_date
             FROM purchased_games p
             JOIN games g ON p.game_id = g.game_id
             WHERE p.user_id = $1
             ORDER BY p.purchase_date DESC`, 
            [userId]
        );

        res.json(games.rows);
    } catch (error) {
        console.error("Error fetching purchased games:", error);
        res.status(500).json({ message: "Error fetching purchased games" });
    }
});

// =============================================
// STATIC FILES & DEFAULT ROUTE
// =============================================

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: "Route not found" });
});

// =============================================
// START SERVER
// =============================================

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
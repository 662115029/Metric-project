require('dotenv').config();
const express = require('express');
const { Pool } = require('pg'); // Changed from mysql2 to pg
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
app.use(cors());
// Update your CORS configuration if needed
app.use(cors({
    origin: '*', // In production, specify your frontend domain
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

// Check for existing DB
pool.connect((err, client, release) => {
    if (err) {
        console.error("Database connection failed. Ensure PostgreSQL is running and database exists.");
        console.error(err);
        process.exit(1);
    }
    console.log("Connected to PostgreSQL Database");
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
        // Check if user exists
        const existingUser = await pool.query("SELECT * FROM users WHERE username = $1", [username]);

        if (existingUser.rows.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into DB
        await pool.query("INSERT INTO users (username, password) VALUES ($1, $2)", [username, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// User Login Route
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

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

    res.json({ message: "Login successful", token, userId: user.id, username: user.username });
});

// Middleware to authenticate user
function authenticateUser(req, res, next) {
    const token = req.headers["authorization"];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    jwt.verify(token.split(" ")[1], JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

app.get("/api/games", async (req, res) => {
    const categoryId = req.query.category_id; // Get category ID from query params

    let query = "SELECT * FROM games";
    let params = [];

    if (categoryId) {
        query += " WHERE category_id = $1";
        params.push(categoryId);
    }

    try {
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

/* --- ADMIN LOGIN --- */
app.post("/api/admin-login", async (req, res) => {
    const { username, password } = req.body;

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
});

// Backend Route to Insert Games with Image Upload
app.post("/api/add-game", authenticateAdmin, async (req, res) => {
    // Log the entire request body for inspection
    console.log("📥 Full request body:", JSON.stringify(req.body));
    
    const { title, price, release_date, developer, description, category_id } = req.body;
    const thumbnail = req.files?.thumbnail; // Get the uploaded file
    
    // Handle promo_price explicitly to ensure it's not lost
    let promo_price = null;
    if (req.body.promo_price !== undefined && req.body.promo_price !== null && req.body.promo_price !== '') {
        // Convert to number and check if it's a valid number
        promo_price = Number(req.body.promo_price);
        if (isNaN(promo_price)) {
            promo_price = null;
        }
    }
    
    console.log("📥 Extracted promo_price:", promo_price);
    console.log("📥 Type of promo_price:", typeof promo_price);

    if (!title || !price || !release_date || !developer || !description || !thumbnail || !category_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Create a unique filename or use the original name
        const thumbnailPath = `assets/images/${Date.now()}_${thumbnail.name}`;
        
        // Save the uploaded file
        await thumbnail.mv(path.join(__dirname, "public", thumbnailPath));
        
        // PostgreSQL uses $1, $2, etc. for parameters
        const query = "INSERT INTO games (title, release_date, price, developer, description, thumbnail, category_id, promo_price) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING game_id";
        const params = [title, release_date, price, developer, description, thumbnailPath, category_id, promo_price];
        
        // Log the exact query and parameters
        console.log("📝 SQL Query:", query);
        console.log("📝 SQL Parameters:", JSON.stringify(params));
        
        const result = await pool.query(query, params);

        console.log("✅ Game Added Successfully:", result.rows[0]);
        res.status(201).json({ message: "Game added successfully", gameId: result.rows[0].game_id });
    } catch (error) {
        console.error("❌ Database Insert Error:", error);
        console.error("SQL Message:", error.message);
        res.status(500).json({ message: "Error adding game", error: error.message });
    }
});

// Backend Route to Insert Categories
app.post("/api/add-category", authenticateAdmin, async (req, res) => {
    const { category_name } = req.body;
    const icon = req.files.icon; // Assuming you're using a middleware like express-fileupload

    if (!category_name || !icon) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const iconPath = `assets/images/${icon.name}`;
        await icon.mv(path.join(__dirname, "public", iconPath)); // Save the uploaded file

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

// Backend Route to Delete Categories
app.delete('/api/categories/:category_id', authenticateAdmin, async (req, res) => {
    const { category_id } = req.params;
    console.log("Received DELETE request for category_id:", category_id); // Debugging

    if (!category_id) {
        return res.status(400).json({ message: "Invalid category ID." });
    }

    try {
        const result = await pool.query(
            `DELETE FROM categories WHERE category_id = $1`,
            [category_id]
        );

        console.log("SQL Delete Result:", result); // Debugging

        if (result.rowCount === 0) {
            console.log("Category not found in the database."); // Debugging
            return res.status(404).json({ message: 'Category not found or already deleted.' });
        }

        console.log("✅ Category deleted successfully!");
        res.json({ message: 'Category deleted successfully!' });
    } catch (error) {
        console.error('Error deleting category:', error);
        res.status(500).json({ message: 'Error deleting category from the database.' });
    }
});

// Backend Route to Update Games
app.put('/api/games/:game_id', authenticateAdmin, async (req, res) => {
    const { game_id } = req.params;
    const { title, release_date, price, promo_price, developer, description, category_id } = req.body;
    const thumbnail = req.files ? req.files.thumbnail : null;

    if (!title && !release_date && !price && !promo_price && !developer && !description && !thumbnail && !category_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

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

// Backend Route to Update Categories
app.put('/api/categories/:category_id', authenticateAdmin, async (req, res) => {
    const { category_id } = req.params;
    const { category_name } = req.body;
    const icon = req.files ? req.files.icon : null;

    if (!category_name && !icon) {
        return res.status(400).json({ message: "Missing required fields" });
    }

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

// Middleware to Verify Admin Token
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

// Default route to serve login.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "login.html"));
});

// Serve static files from "public" directory
app.use(express.static(path.join(__dirname, "public")));

// Start Server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

app.get('/api/categories', async (req, res) => {
    const query = 'SELECT category_id AS id, category_name AS name, icon AS thumbnail FROM categories';

    try {
        const result = await pool.query(query);

        // Check if categories exist
        if (result.rows.length === 0) {
            res.status(404).json({ message: 'No categories found' });
            return;
        }

        // Return the categories as JSON
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching categories:', err);
        res.status(500).json({ message: 'Server error while fetching categories' });
    }
});

app.get("/api/games/:id", async (req, res) => {
    const gameId = req.params.id;
    
    try {
        const gameResult = await pool.query("SELECT * FROM games WHERE game_id = $1", [gameId]);
        
        if (gameResult.rows.length === 0) {
            return res.status(404).json({ message: "Game not found" });
        }
        
        const game = gameResult.rows[0];
        
        // Fetch categories for the game
        const categoryResult = await pool.query(
            `SELECT c.category_name 
             FROM categories c
             JOIN game_categories gc ON c.category_id = gc.category_id
             WHERE gc.game_id = $1`, 
            [gameId]
        );
        
        // Add categories to the game object if any were found
        if (categoryResult.rows.length > 0) {
            game.categories = categoryResult.rows.map(cat => cat.category_name);
        }
        
        res.json(game);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/api/purchased-games/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const games = await pool.query(
            `SELECT g.game_id, g.title, g.thumbnail 
             FROM purchased_games p
             JOIN games g ON p.game_id = g.game_id
             WHERE p.user_id = $1`, 
            [userId]
        );

        res.json(games.rows);
    } catch (error) {
        console.error("Error fetching purchased games:", error);
        res.status(500).json({ message: "Error fetching purchased games." });
    }
});

// Add item to cart
app.post("/api/cart/add", authenticateUser, async (req, res) => {
    const { game_id, quantity } = req.body;
    const user_id = req.user.id;

    try {
        // PostgreSQL doesn't have ON DUPLICATE KEY UPDATE, use INSERT ... ON CONFLICT instead
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
        console.log("Fetching cart for user ID:", user_id);

        const cartItems = await pool.query(
            `SELECT 
                g.game_id,
                g.title, 
                g.price, 
                g.promo_price, 
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
            WHERE c.user_id = $1`,
            [user_id]
        );

        console.log("Cart Items Retrieved:", cartItems.rows);
        res.json(cartItems.rows);
    } catch (error) {
        console.error("❌ Error retrieving cart items:", error);
        res.status(500).json({ message: "Error retrieving cart items", error: error.message });
    }
});

app.delete("/api/cart/clear", authenticateUser, async (req, res) => {
    const user_id = req.user.id;

    try {
        await pool.query(
            "DELETE FROM cart WHERE user_id = $1",
            [user_id]
        );
        res.json({ message: "Cart cleared successfully" });
    } catch (error) {
        console.error("Error clearing cart:", error);
        res.status(500).json({ message: "Error clearing cart" });
    }
});

app.post("/api/purchased_games/add", authenticateUser, async (req, res) => {
    const user_id = req.user.id;
    const { games } = req.body;

    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log('Processing purchase for user:', user_id);

        // Insert each game into purchased_games
        for (const game of games) {
            // Check if game is already purchased
            const existing = await client.query(
                'SELECT id FROM purchased_games WHERE user_id = $1 AND game_id = $2',
                [user_id, game.game_id]
            );

            if (existing.rows.length === 0) {
                // Only insert if not already purchased
                await client.query(
                    `INSERT INTO purchased_games (user_id, game_id, purchase_date) 
                     VALUES ($1, $2, NOW())`,
                    [user_id, game.game_id]
                );
                console.log(`Added game ${game.game_id} to library for user ${user_id}`);
            }
        }

        // Update cart items to mark as purchased
        await client.query(
            `UPDATE cart 
             SET is_purchased = TRUE 
             WHERE user_id = $1 AND is_purchased = FALSE`,
            [user_id]
        );

        await client.query('COMMIT');
        console.log('Purchase completed successfully');

        res.json({ 
            success: true,
            message: "Games successfully added to library",
            user_id: user_id,
            games: games.map(g => g.title)
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

app.delete('/api/games/:game_id', async (req, res) => {
    const { game_id } = req.params;
    console.log("Received DELETE request for game_id:", game_id);

    if (!game_id) {
        return res.status(400).json({ message: "Invalid game ID." });
    }

    try {
        const result = await pool.query(
            `DELETE FROM games WHERE game_id = $1`,
            [game_id]
        );

        console.log("SQL Delete Result:", result);

        if (result.rowCount === 0) {
            console.log("Game not found in the database.");
            return res.status(404).json({ message: 'Game not found or already deleted.' });
        }

        console.log("✅ Game deleted successfully!");
        res.json({ message: 'Game deleted successfully!' });
    } catch (error) {
        console.error('Error deleting game:', error);
        res.status(500).json({ message: 'Error deleting game from the database.' });
    }
});

app.post('/api/logout', (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(400).json({ message: 'No token provided' });

    // Ideally, store blacklisted tokens in a database or memory
    res.json({ message: 'Logged out successfully' });
});

require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
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
// Database Connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'gamestore'
});

// Check for existing DB
db.connect(err => {
    if (err) {
        console.error("Database connection failed. Ensure MySQL is running and database exists.");
        process.exit(1); // Exit if DB isn't accessible
    }
    console.log("Connected to MySQL Database");
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
        const [existingUser] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);

        if (existingUser.length > 0) {
            return res.status(400).json({ message: "Username already exists" });
        }

        // Hash password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert into DB
        await db.promise().query("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword]);

        res.status(201).json({ message: "User registered successfully" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// User Login Route
app.post("/api/login", async (req, res) => {
    const { username, password } = req.body;

    const [users] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
        return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];
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

app.get("/api/games", (req, res) => {
    const categoryId = req.query.category_id; // Get category ID from query params

    let query = "SELECT * FROM games";
    let params = [];

    if (categoryId) {
        query += " WHERE category_id = ?";
        params.push(categoryId);
    }

    db.query(query, params, (err, results) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(results);
    });
});

/* --- ADMIN LOGIN --- */
app.post("/api/admin-login", async (req, res) => {
    const { username, password } = req.body;

    const [users] = await db.promise().query("SELECT * FROM users WHERE username = ?", [username]);
    if (users.length === 0) {
        return res.status(401).json({ message: "User not found" });
    }

    const user = users[0];
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
        
        // Construct query and parameters explicitly
        const query = "INSERT INTO games (title, release_date, price, developer, description, thumbnail, category_id, promo_price) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const params = [title, release_date, price, developer, description, thumbnailPath, category_id, promo_price];
        
        // Log the exact query and parameters
        console.log("📝 SQL Query:", query);
        console.log("📝 SQL Parameters:", JSON.stringify(params));
        
        const [result] = await db.promise().query(query, params);

        console.log("✅ Game Added Successfully:", result);
        res.status(201).json({ message: "Game added successfully", gameId: result.insertId });
    } catch (error) {
        console.error("❌ Database Insert Error:", error);
        console.error("SQL State:", error.sqlState);
        console.error("SQL Error Code:", error.code);
        console.error("SQL Message:", error.message);
        console.error("SQL Query:", error.sql); // This will show the actual query with parameters
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

        const [result] = await db.promise().query(
            "INSERT INTO categories (category_name, icon) VALUES (?, ?)", 
            [category_name, iconPath]
        );

        res.status(201).json({ message: "Category added successfully", categoryId: result.insertId });
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
        const [result] = await db.promise().query(
            `DELETE FROM categories WHERE category_id = ?`,
            [category_id]
        );

        console.log("SQL Delete Result:", result); // Debugging

        if (result.affectedRows === 0) {
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
    const thumbnail = req.files ? req.files.thumbnail : null; // Assuming you're using a middleware like express-fileupload

    if (!title && !release_date && !price && !promo_price && !developer && !description && !thumbnail && !category_id) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        let query = "UPDATE games SET ";
        const params = [];

        if (title) {
            query += "title = ?, ";
            params.push(title);
        }

        if (release_date) {
            query += "release_date = ?, ";
            params.push(release_date);
        }

        if (price) {
            query += "price = ?, ";
            params.push(price);
        }

        if (promo_price) {
            query += "promo_price = ?, ";
            params.push(promo_price);
        }

        if (developer) {
            query += "developer = ?, ";
            params.push(developer);
        }

        if (description) {
            query += "description = ?, ";
            params.push(description);
        }

        if (category_id) {
            query += "category_id = ?, ";
            params.push(category_id);
        }

        if (thumbnail) {
            const thumbnailPath = `assets/images/${Date.now()}_${thumbnail.name}`;
            await thumbnail.mv(path.join(__dirname, "public", thumbnailPath));
            query += "thumbnail = ?, ";
            params.push(thumbnailPath);
        }

        // Remove the last comma and space
        query = query.slice(0, -2);

        query += " WHERE game_id = ?";
        params.push(game_id);

        const [result] = await db.promise().query(query, params);

        if (result.affectedRows === 0) {
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
    const icon = req.files ? req.files.icon : null; // Assuming you're using a middleware like express-fileupload

    if (!category_name && !icon) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        let query = "UPDATE categories SET ";
        const params = [];

        if (category_name) {
            query += "category_name = ?";
            params.push(category_name);
        }

        if (icon) {
            const iconPath = `assets/images/${icon.name}`;
            await icon.mv(path.join(__dirname, "public", iconPath)); // Save the uploaded file
            if (category_name) query += ", ";
            query += "icon = ?";
            params.push(iconPath);
        }

        query += " WHERE category_id = ?";
        params.push(category_id);

        const [result] = await db.promise().query(query, params);

        if (result.affectedRows === 0) {
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



app.get('/api/categories', (req, res) => {
    const query = 'SELECT category_id AS id, category_name AS name, icon AS thumbnail FROM categories';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching categories:', err);
            res.status(500).json({ message: 'Server error while fetching categories' });
            return;
        }

        // Check if categories exist
        if (results.length === 0) {
            res.status(404).json({ message: 'No categories found' });
            return;
        }

        // Return the categories as JSON
        res.json(results);
    });
});

app.get("/api/games/:id", (req, res) => {
    const gameId = req.params.id;
    
    db.query("SELECT * FROM games WHERE game_id = ?", [gameId], (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      
      if (results.length === 0) {
        return res.status(404).json({ message: "Game not found" });
      }
      
      // If the game has categories, fetch them
      const game = results[0];
      
      // Option 1: If you have a separate categories table with a games_categories junction table
      db.query(
        `SELECT c.category_name 
         FROM categories c
         JOIN game_categories gc ON c.category_id = gc.category_id
         WHERE gc.game_id = ?`, 
        [gameId], 
        (err, categoryResults) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          
          // Add categories to the game object if any were found
          if (categoryResults.length > 0) {
            game.categories = categoryResults.map(cat => cat.category_name);
          }
          
          res.json(game);
        }
      );
      
      // Option 2: If you don't have a relationship table, just return the game
      // res.json(game);
    });
  });
  app.get('/api/purchased-games/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const [games] = await db.promise().query(
            `SELECT g.game_id, g.title, g.thumbnail 
             FROM purchased_games p
             JOIN games g ON p.game_id = g.game_id
             WHERE p.user_id = ?`, 
            [userId]
        );

        res.json(games);
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
        await db.promise().query(
            "INSERT INTO cart (user_id, game_id, quantity) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE quantity = quantity + ?",
            [user_id, game_id, quantity, quantity]
        );
        res.status(201).json({ message: "Item added to cart" });
    } catch (error) {
        res.status(500).json({ message: "Error adding item to cart" });
    }
});

// Get user cart
app.get("/api/cart", authenticateUser, async (req, res) => {
    const user_id = req.user.id;

    try {
        console.log("Fetching cart for user ID:", user_id); // Debugging log

        const [cartItems] = await db.promise().query(
            `SELECT 
                g.game_id,
                g.title, 
                g.price, 
                g.promo_price, 
                c.quantity, 
                IF(g.promo_price IS NOT NULL AND g.promo_price > 0, g.promo_price, g.price) AS final_price,
                (IF(g.promo_price IS NOT NULL AND g.promo_price > 0, g.promo_price, g.price) * c.quantity) AS total_price 
            FROM cart c 
            JOIN games g ON c.game_id = g.game_id 
            WHERE c.user_id = ?`,
            [user_id]
        );

        console.log("Cart Items Retrieved:", cartItems); // Debugging log
        res.json(cartItems);
    } catch (error) {
        console.error("❌ Error retrieving cart items:", error);
        res.status(500).json({ message: "Error retrieving cart items", error: error.message });
    }
});



app.delete("/api/cart/clear", authenticateUser, async (req, res) => {
    const user_id = req.user.id; // Get the authenticated user's ID from the authentication middleware

    try {
        // Delete all items in the cart for the authenticated user
        await db.promise().query(
            "DELETE FROM cart WHERE user_id = ?",
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

    try {
        // Start transaction
        await db.promise().query('START TRANSACTION');

        try {
            console.log('Processing purchase for user:', user_id);

            // Insert each game into purchased_games
            for (const game of games) {
                // Check if game is already purchased
                const [existing] = await db.promise().query(
                    'SELECT id FROM purchased_games WHERE user_id = ? AND game_id = ?',
                    [user_id, game.game_id]
                );

                if (existing.length === 0) {
                    // Only insert if not already purchased
                    await db.promise().query(
                        `INSERT INTO purchased_games (user_id, game_id, purchase_date) 
                         VALUES (?, ?, NOW())`,
                        [user_id, game.game_id]
                    );
                    console.log(`Added game ${game.game_id} to library for user ${user_id}`);
                }
            }

            // Update cart items to mark as purchased
            await db.promise().query(
                `UPDATE cart 
                 SET is_purchased = 1 
                 WHERE user_id = ? AND is_purchased = 0`,
                [user_id]
            );

            await db.promise().query('COMMIT');
            console.log('Purchase completed successfully');

            res.json({ 
                success: true,
                message: "Games successfully added to library",
                user_id: user_id,
                games: games.map(g => g.title)
            });
        } catch (error) {
            await db.promise().query('ROLLBACK');
            throw error;
        }
    } catch (error) {
        console.error("Error processing purchase:", error);
        res.status(500).json({ 
            success: false,
            message: "Error processing purchase",
            error: error.message 
        });
    }
});

app.delete('/api/games/:game_id', async (req, res) => {
    const { game_id } = req.params;
    console.log("Received DELETE request for game_id:", game_id); // Debugging

    if (!game_id) {
        return res.status(400).json({ message: "Invalid game ID." });
    }

    try {
        const [result] = await db.promise().query(
            `DELETE FROM games WHERE game_id = ?`,
            [game_id]
        );

        console.log("SQL Delete Result:", result); // Debugging

        if (result.affectedRows === 0) {
            console.log("Game not found in the database."); // Debugging
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

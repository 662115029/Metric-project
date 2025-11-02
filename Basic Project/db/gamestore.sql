-- PostgreSQL Database Dump for gamestore
-- Converted from MySQL dump
-- Database: gamestore

-- Note: Create the database manually in pgAdmin first, then run this script
-- Right-click Databases -> Create -> Database (name: gamestore)

-- Drop tables in correct order (respecting foreign keys)
DROP TABLE IF EXISTS cart CASCADE;
DROP TABLE IF EXISTS wishlist CASCADE;
DROP TABLE IF EXISTS purchased_games CASCADE;
DROP TABLE IF EXISTS game_categories CASCADE;
DROP TABLE IF EXISTS game_images CASCADE;
DROP TABLE IF EXISTS games CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS users CASCADE;

--
-- Table structure for table users
--

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  role VARCHAR(10) CHECK (role IN ('user', 'admin')) DEFAULT 'user'
);

--
-- Dumping data for table users
--

INSERT INTO users (id, username, password, created_at, role) VALUES 
(2,'Nick Jonas','$2b$10$8x2UVZTgW/OJyP7rpPqu0.f7c3ZyreIKmREOkFYVnSQnBMYlxh3Ji','2025-03-16 11:23:21','user'),
(3,'admin','$2b$10$8x2UVZTgW/OJyP7rpPqu0.f7c3ZyreIKmREOkFYVnSQnBMYlxh3Ji','2025-03-17 10:11:34','admin'),
(4,'jesus','$2b$10$VMNwZ70eRXY2m4PI8yAMB.HO6D7VnLz58rmBJ1yS6Xnh0weILARVG','2025-03-23 16:04:46','user'),
(5,'testing','$2b$10$1xUl2wh35s7yqwVEFi.ZQePSUnZY68GwpxVVoMsfk7UHcYg0yt9vy','2025-03-23 16:22:33','user'),
(6,'testing2','$2b$10$SIfXE4wG.DNG6SrkEm9W6.OOkrzKc.G5gkzEVkvxkUS/S4pZT2Qfi','2025-03-23 17:04:32','user'),
(7,'testing3','$2b$10$FaobqDsUsU09bcmSfDso6uEBaTbtECV/EFS8sf2vYURA74Z46VFwO','2025-03-23 17:33:08','user'),
(8,'Carlos Man','$2b$10$THz/Bhw1ZMRJACtNLwlPFeZfOAbnw/U3M2D5yShq5HZn2p1N.MF4y','2025-03-24 15:31:36','user'),
(9,'Carlos Davids','$2b$10$ZWeiTaIx1nyDIdhSqXO4jOq0e.f.2Ld079uOTF0aY8R5.SDLk/8si','2025-03-24 15:32:22','user'),
(10,'Carlos Jonas','$2b$10$ss3YIPqNY/7DuesVEEx0wuBtFAaKKkrV191AYaovrS6OT47Qrz2ge','2025-03-24 15:40:07','user'),
(11,'Dave Peppers','$2b$10$rS3ZCwwmZVFDKVc0QvRgP.ExSl2gYmkn5ht/UBA6/pi3E4ASu6cOG','2025-03-24 15:41:28','user'),
(12,'Jonah James','$2b$10$syfq7TaLeBN9EsNbCIawmecn4zKmONFIq.niV7HqyFVjwGIebn5sm','2025-03-24 15:42:32','user');

-- Reset the sequence for users table
SELECT setval('users_id_seq', (SELECT MAX(id) FROM users));

--
-- Table structure for table categories
--

CREATE TABLE categories (
  category_id SERIAL PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(255) NOT NULL
);

--
-- Dumping data for table categories
--

INSERT INTO categories (category_id, category_name, icon) VALUES 
(1,'Fighting','assets/images/fighting_icon.jpg'),
(2,'Racing','assets/images/racing_icon.jpg'),
(3,'Survival','assets/images/farming_icon.jpg'),
(4,'Role-Play','assets/images/RPG_icon.jpg'),
(5,'Puzzle','assets/images/puzzle_icon.jpg');

-- Reset the sequence for categories table
SELECT setval('categories_category_id_seq', (SELECT MAX(category_id) FROM categories));

--
-- Table structure for table games
--

CREATE TABLE games (
  game_id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  release_date DATE NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  developer VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  thumbnail VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  promo_price DECIMAL(10,2) DEFAULT NULL,
  category_id VARCHAR(100) DEFAULT NULL
);

--
-- Dumping data for table games
--

INSERT INTO games (game_id, title, release_date, price, developer, description, thumbnail, created_at, promo_price, category_id) VALUES 
(2,'Shadow Strikers','2022-11-21',49.99,'DarkByte Interactive','A fast-paced multiplayer shooter with tactical elements.','assets/images/shadow_strikers.jpg','2025-03-16 11:21:15',39.99,'1'),
(3,'Kingdoms of Valor','2021-07-10',39.99,'Royal Forge Games','An open-world medieval RPG with deep lore.','assets/images/kingdoms_valor.jpg','2025-03-16 11:21:15',NULL,'3'),
(5,'Alien Harvest','2020-10-05',19.99,'Galactic Ventures','A survival game where you farm resources on an alien planet.','assets/images/alien_harvest.jpg','2025-03-16 11:21:15',14.99,'3'),
(6,'Dungeon Requiem','2024-02-17',54.99,'Arcane Abyss Studios','A rogue-like dungeon crawler with intense combat.','assets/images/dungeon_requiem.jpg','2025-03-16 11:21:15',NULL,'1'),
(7,'Skybound Legacy','2023-09-08',44.99,'Cloudbound Entertainment','An adventure game set in floating islands.','assets/images/skybound_legacy.jpg','2025-03-16 11:21:15',NULL,'4'),
(8,'Mecha Wars','2022-06-14',34.99,'Titan Core','Giant robot battles in destructible cities.','assets/images/mecha_wars.jpg','2025-03-16 11:21:15',19.99,'1'),
(9,'Space Colony 9','2021-12-02',24.99,'Galaxia Industries','Manage a space colony and explore new worlds.','assets/images/space_colony_9.jpg','2025-03-16 11:21:15',NULL,'3'),
(10,'Nightmare Asylum','2023-10-31',39.99,'Horror House Games','A psychological horror experience in an abandoned asylum.','assets/images/nightmare_asylum.jpg','2025-03-16 11:21:15',NULL,'5'),
(11,'Mystic Realms','2023-08-22',49.99,'Elder Grove Studios','A magic-based RPG in an enchanted kingdom.','assets/images/mystic_realms.jpg','2025-03-16 11:21:15',NULL,'4'),
(12,'Warfront 2042','2024-01-11',59.99,'BattleCore','A modern warfare shooter with large-scale battles.','assets/images/warfront_2042.jpg','2025-03-16 11:21:15',NULL,'1'),
(13,'Frozen Tundra','2022-02-18',19.99,'Iceberg Games','Survival in the harshest arctic conditions.','assets/images/frozen_tundra.jpg','2025-03-16 11:21:15',NULL,'3'),
(14,'Tech Uprising','2021-11-29',44.99,'CyberPulse Studios','An AI-driven revolution in a futuristic city.','assets/images/tech_uprising.jpg','2025-03-16 11:21:15',NULL,'1'),
(15,'Ocean Odyssey','2020-09-15',29.99,'Deep Dive Interactive','An underwater exploration game with hidden treasures.','assets/images/ocean_odyssey.jpg','2025-03-16 11:21:15',NULL,'3'),
(16,'Pixel Brawlers','2023-06-19',14.99,'RetroPixel Studios','A retro-style brawler with pixel graphics.','assets/images/pixel_brawlers.jpg','2025-03-16 11:21:15',NULL,'1'),
(17,'Dino Escape','2023-04-05',34.99,'Jurassic Studios','Survive in a world filled with prehistoric creatures.','assets/images/dino_escape.jpg','2025-03-16 11:21:15',NULL,'3'),
(18,'Galactic Conquest','2022-12-10',59.99,'StarFury Games','A space strategy game with deep tactical gameplay.','assets/images/galactic_conquest.jpg','2025-03-16 11:21:15',NULL,'5'),
(19,'Runaway Racer','2021-08-03',19.99,'FastTrack Games','High-speed chases in an open-world city.','assets/images/runaway_racer.jpg','2025-03-16 11:21:15',NULL,'2'),
(20,'Dark Prophecy','2023-07-17',49.99,'Arcane Visions','A dark fantasy RPG with branching storylines.','assets/images/dark_prophecy.jpg','2025-03-16 11:21:15',NULL,'4'),
(21,'Quantum Shift','2024-03-01',39.99,'Temporal Labs','A puzzle-platformer that manipulates time.','assets/images/quantum_shift.jpg','2025-03-16 11:21:15',NULL,'5'),
(22,'Haunted Manor','2022-10-20',24.99,'Phantom Games','A ghost-hunting adventure in an old mansion.','assets/images/haunted_manor.jpg','2025-03-16 11:21:15',NULL,'5'),
(23,'City Hustle','2023-09-15',29.99,'Urban Life Studios','A tycoon game about building your own city empire.','assets/images/city_hustle.jpg','2025-03-16 11:21:15',NULL,'5'),
(24,'Battle Mechs','2021-05-07',39.99,'Iron Titan','A turn-based strategy game featuring mech combat.','assets/images/battle_mechs.jpg','2025-03-16 11:21:15',NULL,'5'),
(25,'Endless Ruins','2020-12-01',14.99,'Lost World Games','Explore ancient ruins in a vast open world.','assets/images/endless_ruins.jpg','2025-03-16 11:21:15',NULL,'3'),
(26,'Abyss Walker','2023-02-28',44.99,'ShadowForge Studios','An action RPG with brutal combat and dark themes.','assets/images/abyss_walker.jpg','2025-03-16 11:21:15',NULL,'4'),
(27,'Planet Defender','2022-07-23',19.99,'Galactic Shield','Defend Earth from alien invaders in this tower defense game.','assets/images/planet_defender.jpg','2025-03-16 11:21:15',NULL,'5'),
(28,'Terror at Midnight','2021-11-11',34.99,'Dread Studios','A detective thriller with horror elements.','assets/images/terror_midnight.jpg','2025-03-16 11:21:15',NULL,'5'),
(29,'Dreamscape','2020-06-16',24.99,'MindMaze Interactive','A surreal adventure through a dream world.','assets/images/dreamscape.jpg','2025-03-16 11:21:15',NULL,'4'),
(31,'Shadow Brawl','2023-06-15',39.99,'Arcade Studios','An exciting Fighting game with immersive gameplay.','assets/images/shadow_brawl.jpg','2025-03-24 04:20:36',NULL,'1'),
(32,'Nitro Rush','2023-07-10',49.99,'Speedway Games','An exciting Racing game with immersive gameplay.','assets/images/nitro_rush.jpg','2025-03-24 04:20:36',NULL,'2'),
(33,'Last Survivor','2023-08-05',29.99,'SurviveSoft','An exciting Survival game with immersive gameplay.','assets/images/last_survivor.jpg','2025-03-24 04:20:36',NULL,'3'),
(34,'Mystic Quest','2023-05-22',44.99,'RPG Masters','An exciting Role-Play game with immersive gameplay.','assets/images/mystic_quest.jpg','2025-03-24 04:20:36',NULL,'4'),
(35,'Brain Teasers','2023-09-18',19.99,'Brainy Games','An exciting Puzzle game with immersive gameplay.','assets/images/brain_teasers.jpg','2025-03-24 04:20:36',NULL,'5'),
(36,'Gladiator Arena','2023-06-30',34.99,'Arcade Studios','An exciting Fighting game with immersive gameplay.','assets/images/gladiator_arena.jpg','2025-03-24 04:20:36',NULL,'1'),
(37,'Speed Demons','2023-07-25',54.99,'Speedway Games','An exciting Racing game with immersive gameplay.','assets/images/speed_demons.jpg','2025-03-24 04:20:36',NULL,'2'),
(38,'Doomed Island','2023-08-12',24.99,'SurviveSoft','An exciting Survival game with immersive gameplay.','assets/images/doomed_island.jpg','2025-03-24 04:20:36',NULL,'3'),
(39,'Fantasy Chronicles','2023-05-30',39.99,'RPG Masters','An exciting Role-Play game with immersive gameplay.','assets/images/fantasy_chronicles.jpg','2025-03-24 04:20:36',NULL,'4'),
(40,'Mind Maze','2023-09-22',14.99,'Brainy Games','An exciting Puzzle game with immersive gameplay.','assets/images/mind_maze.jpg','2025-03-24 04:20:36',NULL,'5'),
(41,'Battle Royale X','2023-07-01',44.99,'Arcade Studios','An exciting Fighting game with immersive gameplay.','assets/images/battle_royale_x.jpg','2025-03-24 04:20:36',NULL,'1'),
(42,'Drift Legends','2023-08-14',59.99,'Speedway Games','An exciting Racing game with immersive gameplay.','assets/images/drift_legends.jpg','2025-03-24 04:20:36',NULL,'2'),
(43,'Zombie Outbreak','2023-06-10',34.99,'SurviveSoft','An exciting Survival game with immersive gameplay.','assets/images/zombie_outbreak.jpg','2025-03-24 04:20:36',NULL,'3'),
(44,'Elder Realms','2023-04-18',49.99,'RPG Masters','An exciting Role-Play game with immersive gameplay.','assets/images/elder_realms.jpg','2025-03-24 04:20:36',NULL,'4'),
(46,'Warrior Path','2023-07-20',39.99,'Arcade Studios','An exciting Fighting game with immersive gameplay.','assets/images/warrior_path.jpg','2025-03-24 04:20:36',NULL,'1'),
(47,'Grand Prix Masters','2023-09-15',49.99,'Speedway Games','An exciting Racing game with immersive gameplay.','assets/images/grand_prix_masters.jpg','2025-03-24 04:20:36',NULL,'2'),
(48,'Apocalypse Rising','2023-05-25',29.99,'SurviveSoft','An exciting Survival game with immersive gameplay.','assets/images/apocalypse_rising.jpg','2025-03-24 04:20:36',NULL,'3'),
(49,'Epic Odyssey','2023-06-28',44.99,'RPG Masters','An exciting Role-Play game with immersive gameplay.','assets/images/epic_odyssey.jpg','2025-03-24 04:20:36',NULL,'4'),
(50,'Block Breaker','2023-11-02',19.99,'Brainy Games','An exciting Puzzle game with immersive gameplay.','assets/images/block_breaker.jpg','2025-03-24 04:20:36',NULL,'5'),
(51,'Arena Showdown','2023-08-02',34.99,'Arcade Studios','An exciting Fighting game with immersive gameplay.','assets/images/arena_showdown.jpg','2025-03-24 04:20:36',NULL,'1'),
(52,'Turbo Racers','2023-09-28',59.99,'Speedway Games','An exciting Racing game with immersive gameplay.','assets/images/turbo_racers.jpg','2025-03-24 04:20:36',NULL,'2'),
(53,'Stranded Deep','2023-07-10',24.99,'SurviveSoft','An exciting Survival game with immersive gameplay.','assets/images/stranded_deep.jpg','2025-03-24 04:20:36',NULL,'3'),
(54,'Mythical Journey','2023-04-05',49.99,'RPG Masters','An exciting Role-Play game with immersive gameplay.','assets/images/mythical_journey.jpg','2025-03-24 04:20:36',NULL,'4'),
(55,'Logic Puzzler','2023-12-10',14.99,'Brainy Games','An exciting Puzzle game with immersive gameplay.','assets/images/logic_puzzler.jpg','2025-03-24 04:20:36',NULL,'5'),
(56,'Combat Kings','2023-06-05',44.99,'Arcade Studios','An exciting Fighting game with immersive gameplay.','assets/images/combat_kings.jpg','2025-03-24 04:20:36',NULL,'1'),
(57,'Circuit Blitz','2023-08-20',54.99,'Speedway Games','An exciting Racing game with immersive gameplay.','assets/images/circuit_blitz.jpg','2025-03-24 04:20:36',NULL,'2'),
(58,'Survivor Camp','2023-05-12',29.99,'SurviveSoft','An exciting Survival game with immersive gameplay.','assets/images/survivor_camp.jpg','2025-03-24 04:20:36',NULL,'3'),
(59,'Dungeon Crawler','2023-03-25',39.99,'RPG Masters','An exciting Role-Play game with immersive gameplay.','assets/images/dungeon_crawler.jpg','2025-03-24 04:20:36',NULL,'4'),
(60,'Escape Room Challenge','2023-10-15',19.99,'Brainy Games','An exciting Puzzle game with immersive gameplay.','assets/images/escape_room_challenge.jpg','2025-03-24 04:20:36',NULL,'5'),
(62,'Jungle Escape the Sequel','2000-03-22',30.00,'Jungle Bois','Jungle game','assets/images/1742831157286_tarsier.jpg','2025-03-24 15:45:57',29.00,'3');

-- Reset the sequence for games table
SELECT setval('games_game_id_seq', (SELECT MAX(game_id) FROM games));

--
-- Table structure for table game_categories
--

CREATE TABLE game_categories (
  game_id INTEGER NOT NULL,
  category_id INTEGER NOT NULL,
  PRIMARY KEY (game_id, category_id),
  CONSTRAINT game_categories_ibfk_1 FOREIGN KEY (game_id) REFERENCES games (game_id) ON DELETE CASCADE,
  CONSTRAINT game_categories_ibfk_2 FOREIGN KEY (category_id) REFERENCES categories (category_id) ON DELETE CASCADE
);

-- Create indexes for foreign keys
CREATE INDEX idx_game_categories_category_id ON game_categories(category_id);

--
-- Dumping data for table game_categories
--

INSERT INTO game_categories (game_id, category_id) VALUES 
(19,2),(3,4),(11,4),(20,4),(26,4),(21,5),(29,5);

--
-- Table structure for table game_images
--

CREATE TABLE game_images (
  image_id SERIAL PRIMARY KEY,
  game_id INTEGER NOT NULL,
  image_url VARCHAR(255) NOT NULL,
  image_order INTEGER DEFAULT 0,
  CONSTRAINT game_images_ibfk_1 FOREIGN KEY (game_id) REFERENCES games (game_id) ON DELETE CASCADE
);

-- Create index for foreign key
CREATE INDEX idx_game_images_game_id ON game_images(game_id);

--
-- Table structure for table cart
--

CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  is_purchased BOOLEAN NOT NULL DEFAULT FALSE,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  quantity INTEGER NOT NULL DEFAULT 1,
  CONSTRAINT cart_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT cart_ibfk_2 FOREIGN KEY (game_id) REFERENCES games (game_id) ON DELETE CASCADE
);

-- Create indexes for foreign keys
CREATE INDEX idx_cart_user_id ON cart(user_id);
CREATE INDEX idx_cart_game_id ON cart(game_id);

--
-- Dumping data for table cart
--

INSERT INTO cart (id, user_id, game_id, is_purchased, added_at, quantity) VALUES 
(29,2,15,FALSE,'2025-03-24 12:50:55',1);

-- Reset the sequence for cart table
SELECT setval('cart_id_seq', (SELECT MAX(id) FROM cart));

--
-- Table structure for table purchased_games
--

CREATE TABLE purchased_games (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  purchase_price DECIMAL(10,2) DEFAULT NULL,
  CONSTRAINT purchased_games_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT purchased_games_ibfk_2 FOREIGN KEY (game_id) REFERENCES games (game_id) ON DELETE CASCADE
);

-- Create indexes for foreign keys
CREATE INDEX idx_purchased_games_user_id ON purchased_games(user_id);
CREATE INDEX idx_purchased_games_game_id ON purchased_games(game_id);

--
-- Dumping data for table purchased_games
--

INSERT INTO purchased_games (id, user_id, game_id, purchase_date, purchase_price) VALUES 
(2,2,2,'2025-03-22 09:42:07',NULL),
(3,2,3,'2025-03-22 09:42:07',NULL),
(4,4,7,'2025-03-23 16:04:55',NULL),
(6,4,3,'2025-03-23 16:07:31',NULL),
(7,4,7,'2025-03-23 16:08:28',NULL),
(8,2,7,'2025-03-23 16:09:49',NULL),
(9,4,7,'2025-03-23 16:11:10',NULL),
(10,4,18,'2025-03-23 17:30:13',NULL),
(13,7,5,'2025-03-23 17:34:31',NULL),
(14,2,8,'2025-03-23 17:47:48',NULL),
(15,2,15,'2025-03-24 12:45:56',NULL),
(16,2,6,'2025-03-24 12:45:56',NULL),
(17,9,34,'2025-03-24 15:33:46',NULL),
(18,9,27,'2025-03-24 15:33:46',NULL),
(19,9,8,'2025-03-24 15:33:46',NULL),
(20,12,2,'2025-03-24 15:43:43',NULL),
(21,12,34,'2025-03-24 15:43:43',NULL),
(22,12,27,'2025-03-24 15:43:43',NULL);

-- Reset the sequence for purchased_games table
SELECT setval('purchased_games_id_seq', (SELECT MAX(id) FROM purchased_games));

--
-- Table structure for table wishlist
--

CREATE TABLE wishlist (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  game_id INTEGER NOT NULL,
  added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT wishlist_ibfk_1 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
  CONSTRAINT wishlist_ibfk_2 FOREIGN KEY (game_id) REFERENCES games (game_id) ON DELETE CASCADE
);

-- Create indexes for foreign keys
CREATE INDEX idx_wishlist_user_id ON wishlist(user_id);
CREATE INDEX idx_wishlist_game_id ON wishlist(game_id);

-- Database conversion completed
-- All tables created and data inserted successfully

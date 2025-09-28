import sqlite3 from "sqlite3";
import { open } from "sqlite";

async function init() {
  const db = await open({
    filename: "./grocery.db",
    driver: sqlite3.Database
  });

  // Create groceries table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS groceries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      category TEXT,
      unit TEXT,
      price_per_unit REAL,
      vegetarian INTEGER,
      vegan INTEGER,
      gluten_free INTEGER,
      dairy_free INTEGER,
      nut_free INTEGER,
      shellfish_free INTEGER,
      halal INTEGER,
      kosher INTEGER,
      preferences TEXT  -- JSON array
    )
  `);

  // Create recipes table
  await db.exec(`
    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT,
      ingredients TEXT, -- JSON array [{"name":"Tofu","qty":200,"unit":"g"}]
      dietary_tags TEXT, -- JSON array
      instructions TEXT,
      cost_per_serving REAL
    )
  `);

  // Insert sample groceries
  await db.exec(`
    INSERT INTO groceries (name, category, unit, price_per_unit, vegetarian, vegan, gluten_free, dairy_free, nut_free, shellfish_free, halal, kosher, preferences)
    VALUES 
    ('Tofu', 'Protein', 'g', 0.0125, 1, 1, 1, 1, 1, 1, 1, 1, '["High Protein","Quick & Easy"]'),
    ('Brown Rice', 'Grains', 'g', 0.007, 1, 1, 1, 1, 1, 1, 1, 1, '["Balanced","Meal Prep"]'),
    ('Almond Milk', 'Dairy Alternative', 'ml', 0.02, 1, 1, 1, 1, 1, 1, 1, 1, '["Low Carb / Keto","Quick & Easy"]')
  `);

  // Insert sample recipe
  await db.exec(`
    INSERT INTO recipes (title, ingredients, dietary_tags, instructions, cost_per_serving)
    VALUES 
    ('Tofu Stir Fry', '[{"name":"Tofu","qty":200,"unit":"g"},{"name":"Brown Rice","qty":100,"unit":"g"}]', '["Vegan","Quick & Easy"]', 'Cook tofu and rice together with veggies.', 3.5)
  `);

  console.log("Database initialized!");
  await db.close();
}

init();

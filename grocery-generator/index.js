import express from "express";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";

dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const PORT = 3000;

// In-memory session store
let sessionData = {
  userInput: null,
  groceryList: null,
  approvedList: null,
  recipes: null
};

/* ==============================
   Helper: Open SQLite DB
   ============================== */
async function openDB() {
  return open({
    filename: "./grocery.db",
    driver: sqlite3.Database
  });
}

/* ==============================
   Helper: Fetch groceries
   ============================== */
async function getGroceries(restrictions, preferences) {
  const db = await openDB();
  let where = [];
  let params = {};

  const restrictionMap = {
    "Vegetarian": "vegetarian",
    "Vegan": "vegan",
    "Gluten-Free": "gluten_free",
    "Dairy-Free": "dairy_free",
    "Nut-Free": "nut_free",
    "Shellfish-Free": "shellfish_free",
    "Halal": "halal",
    "Kosher": "kosher"
  };

  // Apply dietary restrictions (AND)
  restrictions.forEach((r) => {
    if (restrictionMap[r]) {
      where.push(`${restrictionMap[r]} = 1`);
    }
  });

  // Apply preferences (OR)
  if (preferences.length) {
    const prefConditions = preferences.map((p, i) => {
      params[`$pref${i}`] = p;
      return `preferences LIKE '%' || $pref${i} || '%'`;
    });
    where.push(`(${prefConditions.join(" OR ")})`);
  }

  // Use DISTINCT to avoid duplicates
  const query = `SELECT DISTINCT * FROM groceries ${where.length ? "WHERE " + where.join(" AND ") : ""}`;
  const rows = await db.all(query, params);
  await db.close();
  return rows;
}


/* ==============================
   Helper: Fetch recipes
   ============================== */
async function getRecipes(approvedItemNames, restrictions, preferences) {
  const db = await openDB();
  const recipes = await db.all("SELECT * FROM recipes");

  const filtered = recipes.filter(r => {
    const dietaryTags = JSON.parse(r.dietary_tags);       // e.g., ["Vegan","Quick & Easy"]
    const ingredients = JSON.parse(r.ingredients).map(i => i.name);

    // Recipe matches if all dietary tags are satisfied
    const matchesDiet = restrictions.every(r => dietaryTags.includes(r)) &&
      preferences.every(p => dietaryTags.includes(p));

    // Recipe matches if all ingredients are in approved + pantry items
    const allIngredientsApproved = ingredients.every(i => approvedItemNames.includes(i));

    return matchesDiet && allIngredientsApproved;
  });

  await db.close();
  return filtered;
}

/* ==============================
   Step 1 — Submit User Inputs
   ============================== */
app.post("/submit-input", async (req, res) => {
  const { restrictions = [], preferences = [], budget = 100, duration_days = 7 } = req.body;
  sessionData.userInput = { restrictions, preferences, budget, duration_days };

  try {
    // Fetch matching grocery items from DB
    const items = await getGroceries(restrictions, preferences);

    // Deduplicate items by name
    const uniqueItems = [];
    const seen = new Set();
    for (const i of items) {
      if (!seen.has(i.name)) {
        uniqueItems.push(i);
        seen.add(i.name);
      }
    }

    // Map items to grocery list format
    const groceryItems = uniqueItems.map(i => ({
      name: i.name,
      category: i.category,
      quantity: 100, // default quantity per item
      unit: i.unit,
      estimated_price: i.price_per_unit
    }));

    // Calculate total estimated cost
    const total_estimated_cost = groceryItems.reduce((sum, i) => sum + i.estimated_price, 0);

    // Save to session
    sessionData.groceryList = {
      items: groceryItems,
      total_estimated_cost,
      budget_exceeded: total_estimated_cost > budget
    };

    res.json({ message: "Grocery list generated", groceryList: sessionData.groceryList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate grocery list" });
  }
});


/* ==============================
   Step 2 — Edit Grocery List
   ============================== */
app.post("/edit-grocery", (req, res) => {
  if (!sessionData.groceryList) return res.status(400).json({ error: "Grocery list not generated yet" });

  const { alreadyHave = [], dontWant = [] } = req.body;
  const originalItems = sessionData.groceryList.items || [];

  const approved_items = originalItems.filter(i => !dontWant.includes(i.name));
  const pantry_items = originalItems.filter(i => alreadyHave.includes(i.name));

  sessionData.approvedList = { approved_items, pantry_items, removed_items: dontWant };
  res.json({ message: "Grocery list updated", approvedList: sessionData.approvedList });
});

/* ==============================
   Step 3 — Generate Recipes
   ============================== */
app.post("/generate-recipes", async (req, res) => {
  const { approvedList, userInput } = sessionData;
  if (!approvedList || !userInput) return res.status(400).json({ error: "Missing approved list or user input" });

  try {
    // Include pantry items in approved list for recipe generation
    const approvedItemNames = [
      ...approvedList.approved_items.map(i => i.name),
      ...approvedList.pantry_items.map(i => i.name)
    ];

    const recipes = await getRecipes(approvedItemNames, userInput.restrictions, userInput.preferences);
    sessionData.recipes = recipes;
    res.json({ message: "Recipes generated", recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recipes" });
  }
});

/* ==============================
   Start the server
   ============================== */
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

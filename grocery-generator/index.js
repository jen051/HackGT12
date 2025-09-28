import express from "express";
import dotenv from "dotenv";
import sqlite3 from "sqlite3";
import { open } from "sqlite";
import fetch from "node-fetch"; 


dotenv.config();
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


const USDA_KEY = process.env.USDA_API_KEY; // ingredients
const THEMEALDB_KEY = process.env.MEALDB_API_KEY; // recipies

const PORT = 3000;

// In-memory session store
let sessionData = {
  userInput: null,
  groceryList: null,
  approvedList: null,
  recipes: null
};


async function searchMealDBByIngredient(ingredient) {
  const url = `https://www.themealdb.com/api/json/v1/${THEMEALDB_KEY}/filter.php?i=${encodeURIComponent(ingredient)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.meals || [];
}

async function getMealDetails(idMeal) {
  const url = `https://www.themealdb.com/api/json/v1/${THEMEALDB_KEY}/lookup.php?i=${idMeal}`;
  const res = await fetch(url);
  const data = await res.json();
  return data.meals ? data.meals[0] : null;
}

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
   Helper: Fetch groceries from USDA
   ============================== */
async function getGroceries(restrictions, preferences) {
  // Pick a keyword based on preferences or fallback
  const keyword = preferences.length ? preferences[0] : "basic";

  // Call USDA FoodData Central search API
  const url = `https://api.nal.usda.gov/fdc/v1/foods/search?query=${encodeURIComponent(keyword)}&pageSize=10&api_key=${USDA_KEY}`;
  const res = await fetch(url);
  const data = await res.json();

  if (!data.foods) return [];

  // Map USDA results into your grocery format
  return data.foods.map(food => ({
    name: food.description,
    category: food.foodCategory || "General",
    unit: "g",
    price_per_unit: 1.0 // Placeholder (since USDA doesn’t give prices)
  }));
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
   Step 3 — Generate Recipes (with MealDB)
   ============================== */
app.post("/generate-recipes", async (req, res) => {
  const { approvedList } = sessionData;
  if (!approvedList) return res.status(400).json({ error: "Missing approved list" });

  try {
    // Collect ingredient names from approved + pantry
    const ingredients = [
      ...approvedList.approved_items.map(i => i.name),
      ...approvedList.pantry_items.map(i => i.name)
    ];

    let recipes = [];

    // Search recipes for each ingredient
    for (const ing of ingredients) {
      const meals = await searchMealDBByIngredient(ing);
      if (meals.length) {
        // fetch details for first few meals
        for (let i = 0; i < Math.min(2, meals.length); i++) {
          const details = await getMealDetails(meals[i].idMeal);
          if (details) {
            recipes.push({
              id: details.idMeal,
              name: details.strMeal,
              category: details.strCategory,
              area: details.strArea,
              instructions: details.strInstructions,
              thumbnail: details.strMealThumb,
              ingredients: Object.keys(details)
                .filter(k => k.startsWith("strIngredient") && details[k])
                .map(k => details[k])
            });
          }
        }
      }
    }

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

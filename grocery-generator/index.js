// index.js
import express from "express";
import dotenv from "dotenv";
import axios from "axios";

dotenv.config();

const app = express();
app.use(express.json()); // parse JSON bodies

const PORT = 3000;

// In-memory session
let sessionData = {
  userInput: null,
  groceryList: null,
  approvedList: null,
  recipes: null,
};

// --- Hugging Face GPT call ---
async function callHF(prompt) {
  try {
    // Uncomment to use real Hugging Face API
    /*
    const response = await axios.post(
      "https://api-inference.huggingface.co/models/mosaicml/mpt-7b-instruct",
      { inputs: prompt },
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (response.data && response.data[0] && response.data[0].generated_text) {
      return response.data[0].generated_text;
    } else {
      throw new Error("No response from Hugging Face model");
    }
    */

    // --- MOCK GPT response for testing ---
    return JSON.stringify({
      items: [
        { name: "Brown rice", category: "Grains", quantity: 500, unit: "g", estimated_price: 3.5 },
        { name: "Tofu", category: "Protein", quantity: 400, unit: "g", estimated_price: 5.0 },
      ],
      total_estimated_cost: 8.5,
      budget_exceeded: false,
    });
  } catch (err) {
    console.error("callHF error:", err.message);
    throw err;
  }
}

// --- Step 1: Submit user inputs ---
app.post("/submit-input", async (req, res) => {
  const { restrictions, preferences, budget, duration_days } = req.body;
  sessionData.userInput = { restrictions, preferences, budget, duration_days };

  const prompt = `
User inputs:
- Dietary Restrictions: ${restrictions.join(", ")}
- Preferences: ${preferences.join(", ")}
- Budget: $${budget}
- Duration: ${duration_days} days

Generate a grocery list JSON with:
- items: name, category, quantity, unit, estimated_price
- total_estimated_cost
- budget_exceeded (true/false)
Return ONLY JSON.
  `;

  try {
    const groceryJSON = await callHF(prompt);
    sessionData.groceryList = JSON.parse(groceryJSON);
    res.json({ message: "Grocery list generated", groceryList: sessionData.groceryList });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate grocery list" });
  }
});

// --- Step 2: Edit grocery list ---
app.post("/edit-grocery", (req, res) => {
  if (!sessionData.groceryList) {
    return res.status(400).json({ error: "Grocery list not generated yet. Call /submit-input first." });
  }

  const { alreadyHave, dontWant } = req.body;
  const originalItems = sessionData.groceryList.items || [];

  const approved_items = originalItems.filter(i => !dontWant.includes(i.name));
  const pantry_items = originalItems.filter(i => alreadyHave.includes(i.name));

  sessionData.approvedList = { approved_items, pantry_items, removed_items: dontWant };

  res.json({ message: "Grocery list updated", approvedList: sessionData.approvedList });
});

// --- Step 3: Generate recipes ---
app.post("/generate-recipes", async (req, res) => {
  const { approvedList, userInput } = sessionData;
  if (!approvedList || !userInput) {
    return res.status(400).json({ error: "Missing approved list or user input" });
  }

  const prompt = `
Use these approved items:
${JSON.stringify(approvedList, null, 2)}

Generate ${userInput.duration_days} days of recipes following:
- Dietary Restrictions: ${userInput.restrictions.join(", ")}
- Preferences: ${userInput.preferences.join(", ")}

Return JSON:
{
  "recipes": [
    {
      "title": string,
      "ingredients": [ { name, qty, unit } ],
      "instructions": string,
      "estimated_cost_per_serving": "$X.XX"
    }
  ]
}
  `;

  try {
    const recipesJSON = await callHF(prompt);
    sessionData.recipes = JSON.parse(recipesJSON);
    res.json({ message: "Recipes generated", recipes: sessionData.recipes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to generate recipes" });
  }
});

// --- Start server ---
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

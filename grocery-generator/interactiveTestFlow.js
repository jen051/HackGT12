import axios from "axios";
import readline from "readline";

const BASE_URL = "http://localhost:3000";

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Helper to ask questions
function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve));
}

async function main() {
  try {
    // --- Ask user inputs ---
    const restrictionsInput = await ask("Enter dietary restrictions (comma separated, e.g., Vegan,Gluten-Free): ");
    const preferencesInput = await ask("Enter diet preferences (comma separated, e.g., High Protein,Quick & Easy): ");
    const budgetInput = await ask("Enter budget (number, e.g., 70): ");
    const durationInput = await ask("Enter duration in days (number, e.g., 7): ");

    const restrictions = restrictionsInput.split(",").map(s => s.trim()).filter(Boolean);
    const preferences = preferencesInput.split(",").map(s => s.trim()).filter(Boolean);
    const budget = parseFloat(budgetInput);
    const duration_days = parseInt(durationInput);

    // --- Step 1: Submit user inputs ---
    const submitInputResponse = await axios.post(`${BASE_URL}/submit-input`, {
      restrictions,
      preferences,
      budget,
      duration_days,
    });
    console.log("\nStep 1: Grocery List Generated");
    console.log(JSON.stringify(submitInputResponse.data, null, 2));

    // --- Ask user which items to remove / already have ---
    const alreadyHaveInput = await ask("\nEnter items you already have (comma separated): ");
    const dontWantInput = await ask("Enter items you don't want (comma separated): ");

    const alreadyHave = alreadyHaveInput.split(",").map(s => s.trim()).filter(Boolean);
    const dontWant = dontWantInput.split(",").map(s => s.trim()).filter(Boolean);

    // --- Step 2: Edit grocery list ---
    const editResponse = await axios.post(`${BASE_URL}/edit-grocery`, {
      alreadyHave,
      dontWant,
    });
    console.log("\nStep 2: Grocery List Edited");
    console.log(JSON.stringify(editResponse.data, null, 2));

    // --- Step 3: Generate recipes ---
    const recipesResponse = await axios.post(`${BASE_URL}/generate-recipes`);
    console.log("\nStep 3: Recipes Generated");
    console.log(JSON.stringify(recipesResponse.data, null, 2));

  } catch (err) {
    console.error("Error during full flow test:", err.response?.data || err.message);
  } finally {
    rl.close();
  }
}

main();

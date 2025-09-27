import axios from "axios";

const BASE_URL = "http://localhost:3000";

async function main() {
  try {
    // --- Step 1: Submit user inputs ---
    const submitInputResponse = await axios.post(`${BASE_URL}/submit-input`, {
      restrictions: ["Vegan"],
      preferences: ["High Protein", "Quick & Easy"],
      budget: 70,
      duration_days: 7,
    });
    console.log("Step 1: Grocery List Generated");
    console.log(JSON.stringify(submitInputResponse.data, null, 2));

    // --- Step 2: Edit grocery list ---
    const editResponse = await axios.post(`${BASE_URL}/edit-grocery`, {
      alreadyHave: ["Brown rice"],
      dontWant: ["Tofu"],
    });
    console.log("\nStep 2: Grocery List Edited");
    console.log(JSON.stringify(editResponse.data, null, 2));

    // --- Step 3: Generate recipes ---
    const recipesResponse = await axios.post(`${BASE_URL}/generate-recipes`);
    console.log("\nStep 3: Recipes Generated");
    console.log(JSON.stringify(recipesResponse.data, null, 2));

  } catch (err) {
    console.error("Error during full flow test:", err.response?.data || err.message);
  }
}

main();

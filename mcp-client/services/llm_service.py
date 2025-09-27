# /mcp-server/services/llm_service.py
from models.schema import Context, GroceryListResponse
from typing import Dict, Any
import json
import os
from google import genai # Uncomment for real Gemini API integration


# Note: In a real app, initialize the client here using os.getenv("GEMINI_API_KEY")
os.getenv("GEMINI_API_KEY")


def build_contextual_prompt(user_query: str, duration: str, context: Context) -> str:
    """Builds the comprehensive system prompt using the database context."""
    
    # Extract context data
    dietary = context.dietary
    budget = context.budget
    stores = ", ".join(context.stores)
    staples = ", ".join(context.staples)

    # The detailed prompt embeds ALL database context as STRICT CONSTRAINTS
    system_message = f"""
    You are an expert nutritional meal and grocery list planner.
    Your task is to generate a comprehensive grocery list and meal plan in JSON format.
    
    STRICT CONSTRAINTS (sourced directly from the user's database preferences):
    1. DIETARY RESTRICTION: The entire plan must be strictly "{dietary}".
    2. BUDGET: The estimated total cost MUST NOT exceed ${budget:.2f}.
    3. SHOPPING LOCATION: Assume pricing and availability are based on the following local stores: {stores}.
    4. STAPLES: Ensure the following essential items are included in the list, if they can be worked into the plan: {staples}.
    
    USER REQUEST: The user is asking for a plan for {duration}. The specific request is: "{user_query}".

    OUTPUT FORMAT: Return a single JSON object ONLY that conforms to the Pydantic schema:
    {json.dumps(GroceryListResponse.schema(), indent=2)}
    
    Do not include any other commentary, preamble, or text outside of the JSON block.
    """
    return system_message

async def generate_list_from_llm(user_query: str, duration: str, context: Context) -> GroceryListResponse:
    """
    Simulates the call to the LLM (e.g., Google Gemini).
    In a real app, this function would call the Gemini API.
    """
    
    prompt = build_contextual_prompt(user_query, duration, context)
    
    print("--- LLM Prompt Sent to Gemini API ---")
    print(prompt)
    print("-------------------------------------")

    # MOCK LLM RESPONSE (Ensuring it adheres to the Keto constraint from the mock data)
    mock_llm_output = {
      "estimatedTotalCost": 72.45,
      "mealPlan": [
        {"day": "Monday", "meal": "Dinner", "recipe_idea": "Steak and Zucchini Noodles"},
        {"day": "Tuesday", "meal": "Breakfast", "recipe_idea": "Scrambled Eggs (using staple: eggs) with Bacon"},
        {"day": "Wednesday", "meal": "Lunch", "recipe_idea": "Keto Chicken Stir-fry"}
      ],
      "groceryList": [
        {"item": "Ribeye Steak", "quantity": "1 lb", "category": "Protein", "notes": "From Kroger for better price"},
        {"item": "Zucchini", "quantity": "3", "category": "Produce", "notes": "Keto carb substitute"},
        {"item": "Eggs", "quantity": "1 dozen", "category": "Staples", "notes": "User staple"},
        {"item": "Bacon", "quantity": "1 pack", "category": "Protein", "notes": "Keto fat source"},
        {"item": "Chicken breast", "quantity": "2 lbs", "category": "Protein", "notes": "For stir-fry"}
      ]
    }
    
    # Validate the mock output against the schema before returning
    return GroceryListResponse(**mock_llm_output)
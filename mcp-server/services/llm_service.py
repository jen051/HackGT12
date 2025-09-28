# /mcp-server/services/llm_service.py
from copy import deepcopy
from models.schema import Context, GroceryListResponse
from typing import Dict, Any, List
from pathlib import Path
from dotenv import load_dotenv
import json
import os
import re
# from google import genai # Uncomment for real Gemini API integration
from openai import OpenAI
from .fetch_data import get_full_user_with_profile_by_name, parse_and_store_user_data
import asyncio


# Note: In a real app, initialize the client here using os.getenv("GEMINI_API_KEY")
# os.getenv("OPENAI_API_KEY")
env_path = Path(__file__).resolve().parents[1] / ".env"
load_dotenv(dotenv_path=env_path)

key = os.getenv("OPENAI_API_KEY")
if not key:
    raise RuntimeError(
        f"OPENAI_API_KEY not set. Create {env_path} with 'OPENAI_API_KEY=...'"
    )

client = OpenAI(api_key=key)  


def build_contextual_prompt(user_query: str, context: Context) -> str:
    """Builds the comprehensive system prompt using the database context."""

    # Extract context data
    dietary = context.dietary
    budget = context.budget
    cuisines = context.cuisines
    inventory = context.inventory
    nutrition = context.nutrition
    allergies = context.allergies
    max_time = context.max_time

    # The detailed prompt embeds ALL database context as STRICT CONSTRAINTS
    system_message = f"""
    You are an expert nutritional meal and grocery list planner.
    Your task is to generate a comprehensive grocery list and meal plan in JSON format.

    OUTPUT SHAPE (exact keys and types):
    - estimatedTotalCost: number
    - recipeList: array of objects with keys:
        - recipe: string (the full recipe text)
        - ingredients: array of strings (each ingredient needed)
        - totalCost: number (estimated cost for this recipe)
        - cookingTime: number (in minutes)
    - groceryList: array of objects with keys:
      - item: string
      - category: string (one of: Protein, Dairy, Vegetables, Grains, Fruits, Pantry)
      - quantity: int
        
    STRICT CONSTRAINTS (sourced directly from the user's database preferences):
    1. DIETARY RESTRICTION: The entire plan must be strictly no "{dietary}". If no dietary restrictions, consider all options.
    2. BUDGET: The estimated total cost MUST NOT exceed ${budget}.
    3. SHOPPING LOCATION: Assume pricing and availability are based on publix in Midtown Atlanta.
    4. CUISINES: Prefer recipes from these cuisines: {', '.join(cuisines) or 'None'}.
    5. INVENTORY: Use these existing ingredients from the user's inventory where possible: {', '.join(inventory) or 'None'}.
    6. NUTRITION: Prioritize these nutritional preferences: {', '.join(nutrition) or 'None'}.
    7. ALLERGIES: Absolutely avoid any ingredients that may contain or be cross-contaminated with: {allergies}.
    8. MAX COOKING TIME: Recipes should take no longer than {max_time} minutes to prepare, if specified.
    
    USER REQUEST: The specific request is: "{user_query}".
    
    Do not include any other commentary, preamble, or text outside of the JSON block.
    """
    return system_message

# at top of file
import json, re
from pydantic import ValidationError

# ...

async def generate_list_from_llm(user_query: str, context: Context) -> GroceryListResponse:
    prompt = build_contextual_prompt(user_query, context)
    print("--- Prompt sent to OpenAI ---")
    print(prompt)
    print("-----------------------------")

    model = os.getenv("OPENAI_MODEL", "gpt-4o-mini")

    chat = client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"},  # enforce pure JSON
        temperature=0,
        max_tokens=1500,
    )

    text = chat.choices[0].message.content or ""
    print(text)

    # Parse JSON (handle occasional code fences defensively)
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        m = re.search(r"```json\s*(\{.*?\})\s*```", text, re.S)
        if not m:
            print("Raw LLM output:\n", text)
            raise
        data = json.loads(m.group(1))

    # Validate against your schema and return
    try:
        return GroceryListResponse.model_validate(data)  # Pydantic v2
    except ValidationError as e:
        print("Schema validation failed. Raw LLM output:\n", text)
        raise
    
# helper functions
def _to_str_from_list(v, default="None"):
          if v is None: return default
          if isinstance(v, list): return ", ".join(map(str, v))
          return str(v)

def _to_list(v):
            if v is None: return []
            if isinstance(v, list): return v
            return [s.strip() for s in re.split(r"[,\n;\|]+", str(v)) if s.strip()]

def create_context_from_profile(profile: Dict[str, Any]) -> Context:
    return Context(
        allergies=_to_str_from_list(profile.get("allergies")),          # 'seafood'
        budget=profile.get("budget"),                                    # 50
        cuisines=_to_list(profile.get("cuisine")),                       # ['italian']
        dietary=_to_str_from_list(profile.get("dietaryRestrictions")),   # 'None'
        inventory=_to_list(profile.get("inventory")),                    # ['potatoes','pasta','cream']
        nutrition=_to_list(profile.get("nutritionalPref")),              # []
        max_time=(profile.get("maxTime") or None),                       # treat 0 as unspecified
    )

async def get_response(username:str, user_query:str) -> GroceryListResponse:
    user = get_full_user_with_profile_by_name(username)
    if not user:
        raise ValueError(f"User '{username}' not found.")
    user_info = parse_and_store_user_data(user)
    profile = user_info.get("profile", {})
    context = create_context_from_profile(profile)
    
    response = await generate_list_from_llm(
        user_query=user_query,
        context=context
    )
    return response

def add_is_selected_flag(payload: Dict[str, Any]) -> Dict[str, Any]:
  data = deepcopy(payload)
  items: List[Dict[str, Any]] = data.get("groceryList", [])
  data["groceryList"] = [{**it, "isSelected": True} for it in items]
  return data

if __name__ == "__main__":
    response = get_response("Nihalika", "Generate one recipe")
    response_json = response.model_dump()  # Pydantic v2
    print(add_is_selected_flag(response_json))
    

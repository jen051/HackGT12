# /mcp-server/services/llm_service.py
from models.schema import Context, GroceryListResponse
from typing import Dict, Any
from pathlib import Path
from dotenv import load_dotenv
import json
import os
import re
# from google import genai # Uncomment for real Gemini API integration
from openai import OpenAI
from .fetch_data import get_full_user_with_profile_by_name, parse_and_store_user_data

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


def build_contextual_prompt(user_query: str, duration: str, context: Context) -> str:
    """Builds the comprehensive system prompt using the database context."""
    



    # Extract context data
    dietary = context.dietary
    budget = context.budget
    # staples = ", ".join(context.staples)

    # The detailed prompt embeds ALL database context as STRICT CONSTRAINTS
    system_message = f"""
    You are an expert nutritional meal and grocery list planner.
    Your task is to generate a comprehensive grocery list and meal plan in JSON format.

    OUTPUT CONSTRAINTS (to keep the JSON compact and valid):
    - mealPlan: exactly 7 entries (1 per day, pick the most relevant meal).
    - groceryList: at most 25 unique items; aggregate quantities rather than listing duplicates.
    - No code fences. Output JSON ONLY.
    
    STRICT CONSTRAINTS (sourced directly from the user's database preferences):
    1. DIETARY RESTRICTION: The entire plan must be strictly no "{dietary}".
    2. BUDGET: The estimated total cost MUST NOT exceed ${budget}.
    3. SHOPPING LOCATION: Assume pricing and availability are based on publix in Midtown Atlanta.
    
    USER REQUEST: The user is asking for a plan for {duration}. The specific request is: "{user_query}".

    OUTPUT FORMAT: Return a single JSON object ONLY that conforms to the Pydantic schema:
    {json.dumps(GroceryListResponse.schema(), indent=2)}
    
    Do not include any other commentary, preamble, or text outside of the JSON block.
    """
    return system_message

# at top of file
import json, re
from pydantic import ValidationError

# ...

async def generate_list_from_llm(user_query: str, duration: str, context: Context) -> GroceryListResponse:
    prompt = build_contextual_prompt(user_query, duration, context)
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

if __name__ == "__main__":
    # Example usage with mock data
    user = get_full_user_with_profile_by_name("Nihalika Kaur Vohra")
    if user:
        user_info = parse_and_store_user_data(user)
        print("User Info:", user_info)
        
        def _to_str_from_list(v, default="None"):
          if v is None: return default
          if isinstance(v, list): return ", ".join(map(str, v))
          return str(v)

        def _to_list(v):
            if v is None: return []
            if isinstance(v, list): return v
            # split comma/semicolon/pipe/newline
            return [s.strip() for s in re.split(r"[,\n;\|]+", str(v)) if s.strip()]

        # profile = user_info.get("profile", {})
        print(user_info.get('budget'))
        context = Context(
            allergies=_to_str_from_list(user_info.get("allergies")), 
            budget=user_info.get("budget"),
            cuisines=_to_list(user_info.get("cuisine")),
            dietary=_to_str_from_list(user_info.get("dietaryRestrictions")),  # -> "Vegan, Gluten-Free"
            inventory=_to_list(user_info.get("inventory")),
            nutrition=_to_list(user_info.get("nutritionalPref")),
            max_time=user_info.get("maxTime"),
        )
        
        import asyncio
        response = asyncio.run(generate_list_from_llm(
            user_query="I need a grocery list for the week",
            duration="7 days",
            context=context
        ))
        
        print("LLM Response:", response)
    else:
        print("User not found.")
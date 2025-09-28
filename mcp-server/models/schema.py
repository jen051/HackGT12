# /mcp-server/models/schemas.py
from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Define the structure for the rich context sent by the Next.js backend
class Context(BaseModel):
    allergies: str = "None"
    budget: Optional[int] = 100
    dietary: str = "None"
    cuisines: List[str] = Field(default_factory=list)
    inventory: List[str] = Field(default_factory=list)
    max_time: Optional[int] = None
    nutrition: List[str] = Field(default_factory=list)

# Define the incoming request payload from the Next.js client
class GenerateListRequest(BaseModel):
    user_id: str
    user_query: str = Field(..., description="The user's free-form request (e.g., 'list for the week').")
    duration: str = Field(..., description="The time period for the list (e.g., '7 days').")
    context: Context

# Define the structured output the LLM must return
class GroceryItem(BaseModel):
    item: str
    quantity: str
    category: str
    notes: str = ""

class MealPlanItem(BaseModel):
    day: str
    meal: str
    recipe_idea: str

class GroceryListResponse(BaseModel):
    estimatedTotalCost: float
    mealPlan: List[MealPlanItem]
    groceryList: List[GroceryItem]
# /mcp-server/models/schemas.py
from enum import Enum
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
    context: Context

class Category(str, Enum):
    PROTEIN = "Protein"
    DAIRY = "Dairy"
    VEGETABLES = "Vegetables"
    GRAINS = "Grains"
    FRUITS = "Fruits"
    PANTRY = "Pantry"

class GroceryItem(BaseModel):
    item: str
    quantity: int
    category: Category


class GroceryListResponse(BaseModel):
    estimatedTotalCost: float
    recipe: str
    groceryList: List[GroceryItem]

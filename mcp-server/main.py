from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from models.schema import GenerateListRequest, GroceryListResponse
from services.llm_service import generate_list_from_llm, get_response
import uvicorn

app = FastAPI(title="Model Context Protocol Server")

# Configure CORS to allow the Next.js frontend to talk to this server
origins = [
    "http://localhost:3000", # Next.js dev server
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/generate-list", response_model=GroceryListResponse, summary="Generate a grocery list using user context.")
async def generate_list_endpoint(request: GenerateListRequest):
    """
    Receives the user's query and full database context, then calls the LLM service.
    """
    #query firebase data
    #store in variable
    #insert variable into prompt --> transfer into nextjs
    
    response_data = await get_response(
        username=request.user_id,
        user_query=request.user_query
    )
    
    return response_data

# To run the server: uvicorn main:app --reload --port 4000
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=4000)

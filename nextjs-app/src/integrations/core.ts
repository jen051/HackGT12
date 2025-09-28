export interface LLMResponse {
  recipes?: any[];
  [key: string]: any;
}

export interface LLMRequest {
  prompt: string;
  response_json_schema?: any;
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

// Mock AI service for demo purposes
export async function InvokeLLM(request: LLMRequest): Promise<LLMResponse> {
  const { prompt, response_json_schema } = request;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Mock response based on the prompt
  if (prompt.includes("recipe") || prompt.includes("Recipe")) {
    return generateMockRecipes(prompt);
  }
  
  // Default response
  return {
    message: "AI response generated successfully",
    data: "This is a mock response from the AI service."
  };
}

function generateMockRecipes(prompt: string): LLMResponse {
  const mockRecipes = [
    {
      title: "Mediterranean Quinoa Bowl",
      description: "A nutritious and colorful bowl packed with protein, fiber, and healthy fats",
      prep_time: 15,
      cook_time: 20,
      servings: 2,
      difficulty: "easy",
      ingredients: [
        "1 cup quinoa, rinsed",
        "2 cups vegetable broth",
        "1 cucumber, diced",
        "1 cup cherry tomatoes, halved",
        "1/2 red onion, thinly sliced",
        "1/2 cup kalamata olives, pitted",
        "1/4 cup feta cheese, crumbled",
        "2 tbsp olive oil",
        "1 tbsp lemon juice",
        "1 tsp dried oregano",
        "Salt and pepper to taste"
      ],
      instructions: [
        "Cook quinoa in vegetable broth according to package directions",
        "Let quinoa cool to room temperature",
        "In a large bowl, combine cucumber, tomatoes, red onion, and olives",
        "Add cooled quinoa to the bowl",
        "In a small bowl, whisk together olive oil, lemon juice, oregano, salt, and pepper",
        "Pour dressing over the quinoa mixture and toss gently",
        "Top with crumbled feta cheese and serve"
      ],
      nutrition: {
        calories: 320,
        protein: 12,
        carbs: 45,
        fat: 11,
        fiber: 6,
        sodium: 580
      },
      health_benefits: [
        "High in plant-based protein",
        "Rich in antioxidants from vegetables",
        "Good source of healthy monounsaturated fats",
        "Supports heart health"
      ],
      dietary_tags: ["vegetarian", "gluten-free", "mediterranean", "high-protein"]
    },
    {
      title: "Green Smoothie Bowl",
      description: "A refreshing and nutrient-dense breakfast bowl with spinach, banana, and tropical fruits",
      prep_time: 10,
      cook_time: 0,
      servings: 1,
      difficulty: "easy",
      ingredients: [
        "2 cups fresh spinach",
        "1 frozen banana",
        "1/2 cup frozen mango",
        "1/2 cup coconut milk",
        "1 tbsp chia seeds",
        "1 tbsp almond butter",
        "1/4 cup granola",
        "1/4 cup fresh berries",
        "1 tbsp coconut flakes"
      ],
      instructions: [
        "Add spinach, frozen banana, frozen mango, and coconut milk to a blender",
        "Blend until smooth and creamy",
        "Pour into a bowl",
        "Top with chia seeds, almond butter, granola, fresh berries, and coconut flakes",
        "Serve immediately"
      ],
      nutrition: {
        calories: 380,
        protein: 8,
        carbs: 52,
        fat: 16,
        fiber: 12,
        sodium: 120
      },
      health_benefits: [
        "Packed with vitamins and minerals",
        "High in fiber for digestive health",
        "Contains healthy fats for brain function",
        "Rich in antioxidants"
      ],
      dietary_tags: ["vegan", "gluten-free", "raw", "high-fiber"]
    },
    {
      title: "Baked Salmon with Roasted Vegetables",
      description: "A heart-healthy dinner featuring omega-3 rich salmon and colorful roasted vegetables",
      prep_time: 20,
      cook_time: 25,
      servings: 4,
      difficulty: "medium",
      ingredients: [
        "4 salmon fillets (6 oz each)",
        "2 cups broccoli florets",
        "2 cups sweet potato, cubed",
        "1 red bell pepper, sliced",
        "1 zucchini, sliced",
        "3 tbsp olive oil",
        "2 cloves garlic, minced",
        "1 tsp dried thyme",
        "1 tsp paprika",
        "Salt and pepper to taste",
        "Lemon wedges for serving"
      ],
      instructions: [
        "Preheat oven to 425°F (220°C)",
        "Toss vegetables with 2 tbsp olive oil, garlic, thyme, salt, and pepper",
        "Spread vegetables on a baking sheet and roast for 15 minutes",
        "Season salmon with remaining olive oil, paprika, salt, and pepper",
        "Add salmon to the baking sheet with vegetables",
        "Continue roasting for 10-12 minutes until salmon is cooked through",
        "Serve with lemon wedges"
      ],
      nutrition: {
        calories: 420,
        protein: 35,
        carbs: 28,
        fat: 18,
        fiber: 6,
        sodium: 320
      },
      health_benefits: [
        "High in omega-3 fatty acids",
        "Excellent source of lean protein",
        "Rich in vitamins A and C",
        "Supports brain and heart health"
      ],
      dietary_tags: ["gluten-free", "high-protein", "omega-3", "low-carb"]
    },
    {
      title: "Lentil and Vegetable Curry",
      description: "A warming and aromatic curry packed with plant-based protein and spices",
      prep_time: 15,
      cook_time: 30,
      servings: 4,
      difficulty: "medium",
      ingredients: [
        "1 cup red lentils, rinsed",
        "1 onion, diced",
        "3 cloves garlic, minced",
        "1 tbsp fresh ginger, grated",
        "1 can coconut milk",
        "2 cups vegetable broth",
        "2 cups mixed vegetables (carrots, bell peppers, spinach)",
        "2 tbsp curry powder",
        "1 tsp turmeric",
        "1 tsp cumin",
        "2 tbsp olive oil",
        "Fresh cilantro for garnish",
        "Brown rice for serving"
      ],
      instructions: [
        "Heat olive oil in a large pot over medium heat",
        "Add onion and cook until softened, about 5 minutes",
        "Add garlic, ginger, and spices, cook for 1 minute until fragrant",
        "Add lentils, coconut milk, and vegetable broth",
        "Bring to a boil, then reduce heat and simmer for 20 minutes",
        "Add mixed vegetables and cook for 10 more minutes",
        "Season with salt and pepper",
        "Serve over brown rice and garnish with fresh cilantro"
      ],
      nutrition: {
        calories: 350,
        protein: 18,
        carbs: 45,
        fat: 12,
        fiber: 15,
        sodium: 480
      },
      health_benefits: [
        "High in plant-based protein",
        "Rich in iron and folate",
        "Anti-inflammatory spices",
        "Supports gut health"
      ],
      dietary_tags: ["vegan", "gluten-free", "high-fiber", "anti-inflammatory"]
    },
    {
      title: "Greek Yogurt Parfait",
      description: "A protein-rich breakfast or snack with layers of Greek yogurt, berries, and granola",
      prep_time: 10,
      cook_time: 0,
      servings: 2,
      difficulty: "easy",
      ingredients: [
        "2 cups Greek yogurt (plain, non-fat)",
        "1 cup mixed berries (strawberries, blueberries, raspberries)",
        "1/2 cup granola",
        "2 tbsp honey",
        "1 tbsp chia seeds",
        "1/4 cup chopped nuts (almonds, walnuts)",
        "Fresh mint leaves for garnish"
      ],
      instructions: [
        "Layer Greek yogurt in the bottom of serving glasses",
        "Add a layer of mixed berries",
        "Sprinkle with granola and chia seeds",
        "Repeat layers",
        "Drizzle with honey",
        "Top with chopped nuts and fresh mint",
        "Serve immediately or refrigerate for up to 2 hours"
      ],
      nutrition: {
        calories: 280,
        protein: 20,
        carbs: 35,
        fat: 8,
        fiber: 6,
        sodium: 120
      },
      health_benefits: [
        "High in protein and probiotics",
        "Rich in antioxidants from berries",
        "Good source of healthy fats",
        "Supports digestive health"
      ],
      dietary_tags: ["high-protein", "probiotic", "antioxidant-rich", "gluten-free"]
    }
  ];

  // Return a random selection of recipes
  const shuffled = mockRecipes.sort(() => 0.5 - Math.random());
  const selectedRecipes = shuffled.slice(0, Math.min(5, shuffled.length));
  
  return {
    recipes: selectedRecipes
  };
}


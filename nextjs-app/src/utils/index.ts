export function createPageUrl(pageName: string): string {
  // Convert page name to URL format
  const urlMap: Record<string, string> = {
    'Dashboard': '/dashboard',
    'RecipeBuilder': '/recipebuilder',
    'AIRecommendations': '/airecommendations',
    'MyRecipes': '/myrecipes',
    'HealthProfile': '/healthprofile',
  };
  
  return urlMap[pageName] || `/${pageName.toLowerCase()}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export function calculateBMI(weight: number, height: number): number {
  // Height in cm, weight in kg
  const heightInMeters = height / 100;
  return weight / (heightInMeters * heightInMeters);
}

export function getBMICategory(bmi: number): string {
  if (bmi < 18.5) return 'Underweight';
  if (bmi < 25) return 'Normal weight';
  if (bmi < 30) return 'Overweight';
  return 'Obese';
}

export function calculateCalories(age: number, weight: number, height: number, activityLevel: string): number {
  // Basic BMR calculation (Mifflin-St Jeor Equation)
  let bmr = 10 * weight + 6.25 * height - 5 * age + 5; // Male formula
  
  // Activity multipliers
  const activityMultipliers: Record<string, number> = {
    'sedentary': 1.2,
    'lightly_active': 1.375,
    'moderately_active': 1.55,
    'very_active': 1.725
  };
  
  return Math.round(bmr * (activityMultipliers[activityLevel] || 1.55));
}

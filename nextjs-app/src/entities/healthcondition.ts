// Health condition entity definitions

export interface HealthCondition {
  id: string;
  name: string;
  description: string;
  dietaryRecommendations: string[];
  restrictions: string[];
}

export const HEALTH_CONDITIONS: HealthCondition[] = [
  {
    id: 'diabetes',
    name: 'Diabetes',
    description: 'A condition that affects how your body uses blood sugar',
    dietaryRecommendations: [
      'Focus on complex carbohydrates',
      'Limit simple sugars',
      'Include fiber-rich foods',
      'Monitor portion sizes'
    ],
    restrictions: [
      'High sugar foods',
      'Refined carbohydrates',
      'Sugary beverages'
    ]
  },
  {
    id: 'hypertension',
    name: 'High Blood Pressure',
    description: 'A condition where blood pressure is consistently elevated',
    dietaryRecommendations: [
      'Reduce sodium intake',
      'Increase potassium-rich foods',
      'Limit processed foods',
      'Include heart-healthy fats'
    ],
    restrictions: [
      'High sodium foods',
      'Processed meats',
      'Canned foods with high sodium'
    ]
  },
  {
    id: 'heart-disease',
    name: 'Heart Disease',
    description: 'Conditions that affect the heart and blood vessels',
    dietaryRecommendations: [
      'Focus on plant-based foods',
      'Include omega-3 fatty acids',
      'Limit saturated fats',
      'Increase fiber intake'
    ],
    restrictions: [
      'Trans fats',
      'High cholesterol foods',
      'Excessive saturated fats'
    ]
  },
  {
    id: 'celiac',
    name: 'Celiac Disease',
    description: 'An autoimmune disorder triggered by gluten',
    dietaryRecommendations: [
      'Strict gluten-free diet',
      'Focus on naturally gluten-free grains',
      'Read labels carefully',
      'Avoid cross-contamination'
    ],
    restrictions: [
      'Wheat',
      'Barley',
      'Rye',
      'Oats (unless certified gluten-free)'
    ]
  },
  {
    id: 'lactose-intolerance',
    name: 'Lactose Intolerance',
    description: 'Inability to digest lactose, a sugar found in dairy',
    dietaryRecommendations: [
      'Choose lactose-free dairy products',
      'Include calcium-rich alternatives',
      'Consider lactase supplements',
      'Read food labels for hidden lactose'
    ],
    restrictions: [
      'Milk',
      'Cheese (except aged varieties)',
      'Ice cream',
      'Yogurt (unless lactose-free)'
    ]
  }
];

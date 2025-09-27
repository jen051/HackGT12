export interface HealthConditionData {
  id?: string;
  name: string;
  description?: string;
  dietary_restrictions?: string[];
  recommended_nutrients?: string[];
  nutrients_to_limit?: string[];
  created_at?: string;
  updated_at?: string;
}

export class HealthCondition {
  static async create(data: HealthConditionData): Promise<HealthConditionData> {
    // Mock implementation - in a real app, this would save to a database
    const condition: HealthConditionData = {
      id: `condition_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    
    // Store in localStorage for demo purposes
    const conditions = this.getAllConditions();
    conditions.push(condition);
    localStorage.setItem('health_conditions', JSON.stringify(conditions));
    
    return condition;
  }

  static async update(id: string, data: Partial<HealthConditionData>): Promise<HealthConditionData> {
    const conditions = this.getAllConditions();
    const index = conditions.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error('Health condition not found');
    }
    
    conditions[index] = {
      ...conditions[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem('health_conditions', JSON.stringify(conditions));
    return conditions[index];
  }

  static async delete(id: string): Promise<boolean> {
    const conditions = this.getAllConditions();
    const filtered = conditions.filter(c => c.id !== id);
    localStorage.setItem('health_conditions', JSON.stringify(filtered));
    return true;
  }

  static async get(id: string): Promise<HealthConditionData | null> {
    const conditions = this.getAllConditions();
    return conditions.find(c => c.id === id) || null;
  }

  static async filter(criteria: Partial<HealthConditionData>): Promise<HealthConditionData[]> {
    const conditions = this.getAllConditions();
    return conditions.filter(condition => {
      return Object.entries(criteria).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.every(v => condition[key as keyof HealthConditionData]?.includes?.(v));
        }
        return condition[key as keyof HealthConditionData] === value;
      });
    });
  }

  static async list(): Promise<HealthConditionData[]> {
    return this.getAllConditions();
  }

  static async search(query: string): Promise<HealthConditionData[]> {
    const conditions = this.getAllConditions();
    const lowercaseQuery = query.toLowerCase();
    
    return conditions.filter(condition => 
      condition.name.toLowerCase().includes(lowercaseQuery) ||
      condition.description?.toLowerCase().includes(lowercaseQuery)
    );
  }

  private static getAllConditions(): HealthConditionData[] {
    try {
      const stored = localStorage.getItem('health_conditions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

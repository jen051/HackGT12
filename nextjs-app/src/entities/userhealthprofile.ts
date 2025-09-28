export interface UserHealthProfileData {
  id?: string;
  created_by: string;
  health_conditions?: string[];
  allergies?: string[];
  dietary_preferences?: string[];
  daily_calorie_goal?: number;
  daily_sodium_limit?: number;
  daily_sugar_limit?: number;
  age?: number;
  weight?: number;
  height?: number;
  activity_level?: "sedentary" | "lightly_active" | "moderately_active" | "very_active";
  created_at?: string;
  updated_at?: string;
}

export class UserHealthProfile {
  static async create(data: UserHealthProfileData): Promise<UserHealthProfileData> {
    // Mock implementation - in a real app, this would save to a database
    const profile: UserHealthProfileData = {
      id: `profile_${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...data,
    };
    
    // Store in localStorage for demo purposes
    const profiles = this.getAllProfiles();
    profiles.push(profile);
    localStorage.setItem('user_health_profiles', JSON.stringify(profiles));
    
    return profile;
  }

  static async update(id: string, data: Partial<UserHealthProfileData>): Promise<UserHealthProfileData> {
    const profiles = this.getAllProfiles();
    const index = profiles.findIndex(p => p.id === id);
    
    if (index === -1) {
      throw new Error('Profile not found');
    }
    
    profiles[index] = {
      ...profiles[index],
      ...data,
      updated_at: new Date().toISOString(),
    };
    
    localStorage.setItem('user_health_profiles', JSON.stringify(profiles));
    return profiles[index];
  }

  static async delete(id: string): Promise<boolean> {
    const profiles = this.getAllProfiles();
    const filtered = profiles.filter(p => p.id !== id);
    localStorage.setItem('user_health_profiles', JSON.stringify(filtered));
    return true;
  }

  static async get(id: string): Promise<UserHealthProfileData | null> {
    const profiles = this.getAllProfiles();
    return profiles.find(p => p.id === id) || null;
  }

  static async filter(criteria: Partial<UserHealthProfileData>): Promise<UserHealthProfileData[]> {
    const profiles = this.getAllProfiles();
    return profiles.filter(profile => {
      return Object.entries(criteria).every(([key, value]) => {
        if (Array.isArray(value)) {
          return value.every(v => profile[key as keyof UserHealthProfileData]?.includes?.(v));
        }
        return profile[key as keyof UserHealthProfileData] === value;
      });
    });
  }

  static async list(): Promise<UserHealthProfileData[]> {
    return this.getAllProfiles();
  }

  private static getAllProfiles(): UserHealthProfileData[] {
    try {
      const stored = localStorage.getItem('user_health_profiles');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export class User {
  static email: string = "user@example.com";
  static name: string = "Health User";

  static async me(): Promise<User> {
    // Mock implementation - in a real app, this would fetch from an API
    return {
      email: this.email,
      name: this.name,
    };
  }

  static async create(data: Partial<User>): Promise<User> {
    // Mock implementation
    return {
      email: data.email || this.email,
      name: data.name || this.name,
    };
  }

  static async update(id: string, data: Partial<User>): Promise<User> {
    // Mock implementation
    return {
      email: data.email || this.email,
      name: data.name || this.name,
    };
  }

  static async delete(id: string): Promise<boolean> {
    // Mock implementation
    return true;
  }

  static async list(): Promise<User[]> {
    // Mock implementation
    return [{
      email: this.email,
      name: this.name,
    }];
  }
}

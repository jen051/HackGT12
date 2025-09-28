import { getAuth, onAuthStateChanged } from "firebase/auth";

interface UserData {
  email: string;
  name: string;
}

export class User {
  static email: string = "user@example.com";
  static defaultName: string = "Health User";

  static async me(): Promise<UserData> {
    return new Promise((resolve, reject) => {
      const auth = getAuth();
      onAuthStateChanged(auth, (user) => {
        if (user) {
          resolve({
            email: user.email || "",
            name: user.displayName || "Health User",
          });
        } else {
          reject(new Error("No user logged in."));
        }
      });
    });
  }

  static async create(data: Partial<UserData>): Promise<UserData> {
    // Mock implementation
    return {
      email: data.email || this.email,
      name: data.name || this.defaultName,
    };
  }

  static async update(id: string, data: Partial<UserData>): Promise<UserData> {
    // Mock implementation
    return {
      email: data.email || this.email,
      name: data.name || this.defaultName,
    };
  }

  static async delete(id: string): Promise<boolean> {
    // Mock implementation
    return true;
  }

  static async list(): Promise<UserData[]> {
    // Mock implementation
    return [{
      email: this.email,
      name: this.defaultName,
    }];
  }
}

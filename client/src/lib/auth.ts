import type { User } from "@shared/schema";

export interface AuthUser extends Omit<User, 'password'> {
  // L'identifiant unique de l'utilisateur est toujours user.id
}

export const authService = {
  getCurrentUser(): AuthUser | null {
    const userData = localStorage.getItem('currentUser');
    return userData ? JSON.parse(userData) : null;
  },

  setCurrentUser(user: AuthUser): void {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  logout(): void {
    localStorage.removeItem('currentUser');
  }
};

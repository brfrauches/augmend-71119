
// Token storage key
const TOKEN_KEY = 'augmend_auth_token';
const USER_KEY = 'augmend_user';

// Save authentication token to localStorage
export const saveToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
};

// Get stored token from localStorage
export const getStoredToken = (): string | null => {
  return localStorage.getItem(TOKEN_KEY);
};

// Clear stored token from localStorage
export const clearStoredToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
};

// Save user data to localStorage
export const saveUser = (user: any): void => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Get stored user from localStorage
export const getStoredUser = (): any | null => {
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getStoredToken();
};

// Handle token refresh
export const refreshAuthToken = async (): Promise<boolean> => {
  // In a real application, you would implement token refresh logic here
  // For now, we'll just return true to indicate success
  return true;
};

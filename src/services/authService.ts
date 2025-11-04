
import api, { handleApiError } from './api';
import { saveToken, saveUser, clearStoredToken } from '@/utils/auth';
import { toast } from 'sonner';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  user: any;
  token: string;
}

const AUTH_URL = '/auth';

// Register a new user
export const register = async (data: RegisterData): Promise<boolean> => {
  try {
    const response = await api.post<{status: string, data: AuthResponse}>(`${AUTH_URL}/register`, data);
    
    const { user, token } = response.data.data;
    
    // Save auth data
    saveToken(token);
    saveUser(user);
    
    toast.success("Registration successful! Welcome to AugMend Health.");
    
    return true;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast.error(`Registration failed: ${errorMessage}`);
    return false;
  }
};

// Login user
export const login = async (credentials: LoginCredentials): Promise<boolean> => {
  try {
    const response = await api.post<{status: string, data: AuthResponse}>(`${AUTH_URL}/login`, credentials);
    
    const { user, token } = response.data.data;
    
    // Save auth data
    saveToken(token);
    saveUser(user);
    
    toast.success("Login successful! Welcome back.");
    
    return true;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast.error(`Login failed: ${errorMessage}`);
    return false;
  }
};

// Logout user
export const logout = (): void => {
  clearStoredToken();
  toast.info("You have been logged out.");
};

// Get current user profile
export const getProfile = async (): Promise<any | null> => {
  try {
    const response = await api.get<{status: string, data: {user: any}}>(`${AUTH_URL}/profile`);
    return response.data.data.user;
  } catch (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
};

// Update user profile
export const updateProfile = async (profileData: Partial<{name: string, email: string}>): Promise<any | null> => {
  try {
    const response = await api.put<{status: string, data: {user: any}}>(`${AUTH_URL}/profile`, profileData);
    
    // Update stored user data
    saveUser(response.data.data.user);
    
    toast.success("Profile updated successfully.");
    
    return response.data.data.user;
  } catch (error) {
    const errorMessage = handleApiError(error);
    toast.error(`Profile update failed: ${errorMessage}`);
    return null;
  }
};

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiGet, apiPost, makeFetchRequest } from '@/utils/api';

// Types
interface User {
  id: string;
  name: string;
  email: string;
  specialty?: string;
  location?: string;
  institution?: string;
  profile_image?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  requestResetCode: (email: string) => Promise<{ success: boolean; code?: string; message?: string }>;
  verifyResetCode: (email: string, code: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  getAuthHeaders: () => { Authorization: string } | {};
  updateProfilePicture: (imageUri: string) => Promise<{ success: boolean; message?: string }>;
  deleteProfilePicture: () => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored token on app start
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      const userData = await AsyncStorage.getItem('userData');

      if (token && userData) {
        setToken(token);
        try {
          // Try to verify token with backend
          const response = await apiGet('/auth/profile', {
            headers: { Authorization: `Bearer ${token}` },
          });
          setUser(response.data);
        } catch (error) {
          // If backend is unreachable or token expired, use stored data
          // Token persists forever unless manually removed
          console.log('Backend unreachable, using stored user data');
          setUser(JSON.parse(userData));
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiPost('/auth/login', {
        email,
        password,
      });

      const { token, user: userData } = response.data;

      // Store token permanently (until app is deleted)
      await AsyncStorage.setItem('userToken', token);
      // Also store user data for offline access
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      setToken(token);
      setUser(userData);

      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const logout = async () => {
    await AsyncStorage.removeItem('userToken');
    await AsyncStorage.removeItem('userData');
    setToken(null);
    setUser(null);
  };

  const getAuthHeaders = () => {
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const requestResetCode = async (email: string) => {
    try {
      const response = await apiPost('/auth/forgot-password', {
        email,
      });
      return {
        success: true,
        code: response.data.resetCode, // For demo purposes
        message: response.data.message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to send reset code',
      };
    }
  };

  const verifyResetCode = async (email: string, code: string) => {
    try {
      await apiPost('/auth/verify-reset-code', {
        email,
        code,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string) => {
    try {
      await apiPost('/auth/reset-password', {
        email,
        code,
        newPassword,
      });
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateProfilePicture = async (imageUri: string) => {
    try {
      const formData = new FormData();
      formData.append('profilePic', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await makeFetchRequest('/auth/update-profile-pic', {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        // Update user data with new profile picture
        setUser(data.doctor);
        await AsyncStorage.setItem('userData', JSON.stringify(data.doctor));
        return { success: true };
      } else {
        return { success: false, message: 'Failed to update profile picture' };
      }
    } catch (error) {
      return { success: false, message: 'Failed to upload image' };
    }
  };

  const deleteProfilePicture = async () => {
    try {
      const response = await makeFetchRequest('/auth/delete-profile-pic', {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        // Update user data without profile picture
        setUser(data.doctor);
        await AsyncStorage.setItem('userData', JSON.stringify(data.doctor));
        return { success: true };
      } else {
        return { success: false, message: 'Failed to delete profile picture' };
      }
    } catch (error) {
      return { success: false, message: 'Failed to delete profile picture' };
    }
  };

  const value: AuthContextType = {
    user,
    token,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    requestResetCode,
    verifyResetCode,
    resetPassword,
    getAuthHeaders,
    updateProfilePicture,
    deleteProfilePicture,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
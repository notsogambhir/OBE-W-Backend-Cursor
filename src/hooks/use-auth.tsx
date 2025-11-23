'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthUser } from '@/types/user';
import { createApiUrl, getAuthHeaders, saveAuthToken, clearAuthToken } from '@/lib/api-config';
import { hasRole } from '@/lib/auth';

// Email validation regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, collegeId?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUserSelections: (updates: Partial<User>) => void;
  loading: boolean;
  hasPermission: (requiredRole: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper function to convert AuthUser to User
const authUserToUser = (authUser: AuthUser | null): User | null => {
  if (!authUser) return null;
  return {
    id: authUser.id,
    email: authUser.email,
    name: authUser.name,
    role: authUser.role,
    collegeId: authUser.collegeId || undefined,
    programId: authUser.programId || undefined,
    batchId: authUser.batchId || undefined,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false); // Start with false instead of true

  useEffect(() => {
    checkAuth();
  }, []);

  // Save user to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('obe-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('obe-user');
    }
  }, [user]);

  const checkAuth = async () => {
    try {
      // First check if we have user data in localStorage
      const storedUser = localStorage.getItem('obe-user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Check if there's a selected batch from login
          const selectedBatch = localStorage.getItem('obe-selected-batch');
          if (selectedBatch && !parsedUser.batchId) {
            // Update user with the selected batch
            const updatedUser = { ...parsedUser, batchId: selectedBatch };
            setUser(authUserToUser(updatedUser));
            localStorage.setItem('obe-user', JSON.stringify(updatedUser));
            localStorage.removeItem('obe-selected-batch');
            console.log('Updated user with selected batch:', updatedUser);
          } else {
            setUser(authUserToUser(parsedUser));
          }
          console.log('Using stored user data:', parsedUser);
          
          // If we have stored user data, set loading to false immediately
          // and verify with server in the background
          setLoading(false);
          
          // Verify with server in background (don't block UI)
          verifyWithServer();
          return;
        } catch (error) {
          console.error('Failed to parse stored user:', error);
          localStorage.removeItem('obe-user');
        }
      }

      // If no stored user, verify with server
      await verifyWithServer();
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
      setLoading(false);
    }
  };

  // Add a fallback timeout to prevent infinite loading
  useEffect(() => {
    const fallbackTimeout = setTimeout(() => {
      if (loading) {
        console.log('Auth check taking too long, setting loading to false');
        setLoading(false);
      }
    }, 1000); // Reduced to 1 second fallback

    return () => clearTimeout(fallbackTimeout);
  }, [loading]);

  const verifyWithServer = async () => {
    // Add a timeout to the fetch request
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000); // Reduced to 2 second timeout

    try {
      const response = await fetch(createApiUrl(`/api/auth/me`), {
        headers: getAuthHeaders(),
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        setUser(authUserToUser(data.user));
        // Update localStorage with fresh user data
        localStorage.setItem('obe-user', JSON.stringify(data.user));
        console.log('Server auth check successful, user:', data.user);
      } else {
        // Silently handle auth failures - don't log 401 errors as they're expected when not logged in
        if (response.status === 401) {
          console.log('User not authenticated (401)');
        } else if (response.status === 403) {
          console.log('User access forbidden (403)');
        } else {
          console.log('Server auth check failed:', response.status, response.statusText);
        }
        setUser(null);
        localStorage.removeItem('obe-user');
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      const error = fetchError as Error;
      if (error.name === 'AbortError') {
        console.log('Server auth check request timed out');
      } else if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
        console.log('Network error during auth check - this is expected in some environments');
      } else {
        console.log('Server auth check request failed:', error.message);
      }
      // Don't set user to null on network errors if we have stored data
      const storedUser = localStorage.getItem('obe-user');
      if (!storedUser) {
        setUser(null);
      } else {
        console.log('Using stored user data due to network issues');
      }
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string, collegeId?: string) => {
    console.log('=== FRONTEND LOGIN ATTEMPT ===');
    console.log('Email:', email);
    console.log('College ID:', collegeId);
    
    // Clear any existing token to ensure fresh authentication
    if (typeof window !== 'undefined') {
      localStorage.removeItem('obe-auth-token');
      console.log('Cleared existing token from localStorage');
    }
    
    // Input validation
    if (!email || !password) {
      const error = new Error('Email and password are required');
      console.error('Login validation failed:', error.message);
      throw error;
    }

    if (!emailRegex.test(email)) {
      const error = new Error('Please enter a valid email address');
      console.error('Login validation failed:', error.message);
      throw error;
    }
    
    // Use configured URL to work in both development and production
    console.log('Request URL:', createApiUrl('/api/auth/login'));
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(createApiUrl('/api/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password, collegeId }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (!response.ok) {
        let errorMessage = 'Login failed';
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorMessage;
          console.error('Login error response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server returned ${response.status}: ${response.statusText}`;
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      
      // Save the token for development cross-origin requests
      if (data.token) {
        saveAuthToken(data.token);
        console.log('Token saved successfully');
      }
      
      const userData = authUserToUser(data.user);
      setUser(userData);
      
      // Update localStorage with the user data
      localStorage.setItem('obe-user', JSON.stringify(data.user));
      console.log('User data saved to localStorage');
      
      // Verify the login worked by checking auth status (allow time for cookie to be set)
      setTimeout(async () => {
        try {
          console.log('Post-login verification - checking auth status...');
          const verifyResponse = await fetch(createApiUrl('/api/auth/me'), {
            // Don't send Authorization header here - let cookie work
            headers: {
              'Content-Type': 'application/json',
            },
          });
          if (verifyResponse.ok) {
            console.log('Post-login verification successful');
          } else {
            console.log('Post-login verification failed, trying with token...');
            // Fallback: try with token if cookie doesn't work
            const token = localStorage.getItem('obe-auth-token');
            if (token) {
              const tokenResponse = await fetch(createApiUrl('/api/auth/me'), {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${token}`,
                },
              });
              if (tokenResponse.ok) {
                console.log('Post-login verification successful with token');
              } else {
                console.log('Post-login verification failed even with token');
              }
            }
          }
        } catch (error) {
          console.log('Post-login verification error:', error);
        }
      }, 500); // Increased timeout to allow cookie to be set
      
    } catch (error) {
      console.error('Login failed:', error);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Login request timed out. Please check your connection and try again.');
        }
        // Re-throw the original error with more context if needed
        throw error;
      }
      
      throw new Error('An unexpected error occurred during login');
    }
  };

  const logout = async () => {
    try {
      // Use configured URL to work in both development and production
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const response = await fetch(createApiUrl('/api/auth/logout'), { 
        method: 'POST',
        headers: getAuthHeaders(),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn('Logout request failed:', response.status, response.statusText);
      } else {
        console.log('Logout successful');
      }
    } catch (error) {
      const err = error as Error;
      if (err.name === 'AbortError') {
        console.warn('Logout request timed out');
      } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        console.warn('Network error during logout - proceeding with local logout');
      } else {
        console.warn('Logout error:', err.message);
      }
      // Even if the server logout fails, we should still clear local state
    } finally {
      setUser(null);
      // Clear localStorage on logout
      localStorage.removeItem('obe-user');
      localStorage.removeItem('obe-selected-batch');
      // Clear auth token
      clearAuthToken();
    }
  };

  const updateUserSelections = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      // localStorage will be automatically updated by the useEffect
    }
  };

  const hasPermission = (requiredRole: string): boolean => {
    if (!user) return false;
    return hasRole(user.role, requiredRole);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUserSelections, loading, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export type { User, AuthUser } from '@/types/user';
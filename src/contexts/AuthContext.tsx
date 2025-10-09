import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { AuthState, AuthContextType, LoginCredentials, User } from '../types/auth';
import { supabase } from '../supabaseClient';

// Add RegisterData interface
export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER_SUCCESS'; payload: Partial<User> };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER_SUCCESS':
      if (!state.user) return state;
      return {
        ...state,
        user: {
          ...state.user,
          ...action.payload,
        },
      };
    default:
      return state;
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (credentials: LoginCredentials) => {
    dispatch({ type: 'LOGIN_START' });
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error || !data.user) throw new Error(error?.message || 'Login failed');

      // Role from user metadata (role_key or role)
      const roleKey = (data.user.user_metadata?.role_key as string) || (data.user.user_metadata?.role as string);
      const role: User['role'] = (roleKey === 'admin') ? 'admin' : (roleKey === 'employee' ? 'employee' : 'client');

      const user: User = {
        id: data.user.id,
        email: data.user.email || '',
        name: data.user.user_metadata?.name || 'User',
        role,
        avatar: data.user.user_metadata?.avatar_url || '',
        phone: data.user.user_metadata?.phone || '', 
        createdAt: data.user.created_at,
        lastLogin: new Date().toISOString(),
      };

      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    } catch (err) {
      dispatch({ type: 'LOGIN_FAILURE', payload: err instanceof Error ? err.message : 'Login failed' });
    }
  };

  // Add the register function
  const register = async (userData: RegisterData) => {
  dispatch({ type: 'LOGIN_START' });
  try {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          name: userData.name,
          phone: userData.phone,
          role: 'client',
          role_key: 'client',
        },
      },
    });

    if (error || !data.user) throw new Error(error?.message || 'Registration failed');

    if (!data.session) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: 'Please check your email to confirm your account.'
      });
      return null; // explicitly return null
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      name: userData.name,
      phone: userData.phone,
      role: 'client',
      avatar: '',
      createdAt: data.user.created_at,
      lastLogin: new Date().toISOString(),
    };

    dispatch({ type: 'LOGIN_SUCCESS', payload: user });
    return user; // ✅ Return user object
  } catch (err) {
    dispatch({
      type: 'LOGIN_FAILURE',
      payload: err instanceof Error ? err.message : 'Registration failed'
    });
    return null; // return null on error
  }
};


  const logout = async () => {
    await supabase.auth.signOut();
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const setUser = (user: Partial<User>) => {
    dispatch({ type: 'UPDATE_USER_SUCCESS', payload: user });
  };

  // Check for existing session on app load
  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const roleKey = (session.user.user_metadata?.role_key as string) || (session.user.user_metadata?.role as string);
        const role: User['role'] = (roleKey === 'admin') ? 'admin' : (roleKey === 'employee' ? 'employee' : 'client');
        dispatch({ type: 'LOGIN_SUCCESS', payload: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          role,
          avatar: session.user.user_metadata?.avatar_url || '',
          phone: session.user.user_metadata?.phone || '', 
          createdAt: session.user.created_at,
        }});
      }
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const roleKey = (session.user.user_metadata?.role_key as string) || (session.user.user_metadata?.role as string);
        const role: User['role'] = (roleKey === 'admin') ? 'admin' : (roleKey === 'employee' ? 'employee' : 'client');
        dispatch({ type: 'LOGIN_SUCCESS', payload: {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.name || 'User',
          role,
          avatar: session.user.user_metadata?.avatar_url || '',
          phone: session.user.user_metadata?.phone || '',
          createdAt: session.user.created_at,
        }});
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    });
    return () => listener?.subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    clearError,
    setUser,
  };

  return (
    <AuthContext.Provider value={value}>
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
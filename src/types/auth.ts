export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'employee' | 'client';
  avatar?: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
}
export interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<User | null>;

  logout: () => void;
  clearError: () => void;
  setUser: (user: Partial<User>) => void;
} 
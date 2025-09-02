export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface SafeUser {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  lastLogin: string | null;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: SafeUser;
  token?: string;
}

export interface ErrorResponse {
  error: string;
}

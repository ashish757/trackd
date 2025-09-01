import type { User } from '../types';

// Simulate localStorage for demo purposes
const STORAGE_KEY = 'trackd_user';

export const saveUser = (user: User): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const userData = localStorage.getItem(STORAGE_KEY);
  if (!userData) return null;
  
  try {
    const user = JSON.parse(userData);
    return {
      ...user,
      createdAt: new Date(user.createdAt),
      updatedAt: new Date(user.updatedAt),
    };
  } catch {
    return null;
  }
};

export const removeUser = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export const isAuthenticated = (): boolean => {
  return getUser() !== null;
};

// Mock authentication functions for demo
export const mockSignUp = async (email: string, _password: string, name: string, username: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name,
    username,
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  saveUser(user);
  return user;
};

export const mockSignIn = async (email: string, _password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo, create a user if they don't exist
  const existingUser = getUser();
  if (existingUser && existingUser.email === email) {
    return existingUser;
  }
  
  const user: User = {
    id: Math.random().toString(36).substr(2, 9),
    email,
    name: email.split('@')[0],
    username: email.split('@')[0],
    bio: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  saveUser(user);
  return user;
};

export const mockSignOut = async (): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  removeUser();
};

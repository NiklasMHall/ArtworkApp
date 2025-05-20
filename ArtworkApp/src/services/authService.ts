import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../config/firebaseConfig';
import { UserProfile } from '../types/user';
import * as Google from 'expo-auth-session/providers/google';
import { googleConfig } from '../services/googleAuthConfig';


interface AuthService {
  signUp: (email: string, password: string, displayName: string) => Promise<FirebaseUser>;
  signIn: (email: string, password: string) => Promise<FirebaseUser>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  getCurrentUser: () => FirebaseUser | null;
  googleSignIn: () => Promise<FirebaseUser | null>;
}

export const authService: AuthService = {
  signUp: async (email: string, password: string, displayName: string) => {
    try {
      console.log('Starting sign up process...');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('User created, updating profile...');

      await updateProfile(userCredential.user, { displayName });
      console.log('Profile updated successfully');

      return userCredential.user;
    } catch (error: any) {
      console.error('Signup error:', error.code, error.message);
      throw error;
    }
  },

  signIn: async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return userCredential.user;
    } catch (error: any) {
      console.error('Sign in error:', error.code, error.message);
      throw error;
    }
  },

  signOut: async () => {
    try {
      await signOut(auth);
    } catch (error: any) {
      console.error('Sign out error:', error.code, error.message);
      throw error;
    }
  },

  updateUserProfile: async (profile: Partial<UserProfile>) => {
    if (!auth.currentUser) {
      throw new Error('No user is currently signed in');
    }
    try {
      await updateProfile(auth.currentUser, profile);
    } catch (error: any) {
      console.error('Profile update error:', error.code, error.message);
      throw error;
    }
  },

  getCurrentUser: () => {
    return auth.currentUser;
  },
  googleSignIn: function (): Promise<FirebaseUser | null> {
    throw new Error('Function not implemented.');
  }
}
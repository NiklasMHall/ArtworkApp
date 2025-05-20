export interface User {
    id: string;
    email: string;
    displayName: string | null;
    photoURL: string | null;
  }
  
  export interface UserProfile {
    displayName?: string;
    photoURL?: string;
  }
  
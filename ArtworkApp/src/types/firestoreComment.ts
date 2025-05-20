import { Timestamp } from 'firebase/firestore';

export interface FirestoreComment {
  id?: string;
  text: string;
  userId: string;
  userName: string;
  createdAt: Timestamp;
}

export type CommentInput = Omit<FirestoreComment, 'id' | 'createdAt'>;
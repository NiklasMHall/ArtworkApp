import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  query,
  where,
  orderBy,
  updateDoc,
  arrayUnion,
  arrayRemove,
  Timestamp,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { Artwork } from '../types/artwork';

  
  export type FirestoreComment = {
    id?: string;
    text: string;
    userId: string;
    userName: string;
    createdAt: Timestamp;
  }
  
  export type CommentInput = Omit<FirestoreComment, 'id' | 'createdAt'>;
  
  interface FirestoreService {
    addArtwork: (artworkData: Omit<Artwork, 'id'>) => Promise<string>;
    getArtworks: () => Promise<Artwork[]>;
    getArtworkById: (id: string) => Promise<Artwork>;
    getArtworksByArtist: (artistId: string) => Promise<Artwork[]>;
    addComment: (artworkId: string, commentData: CommentInput) => Promise<string>;
    getComments: (artworkId: string) => Promise<FirestoreComment[]>;
    toggleLike: (artworkId: string, userId: string) => Promise<boolean>;
    getLikeStatus: (artworkId: string, userId: string) => Promise<boolean>;
    subscribeToComments: (
      artworkId: string,
      callback: (comments: FirestoreComment[]) => void
    ) => () => void;
    subscribeLikes: (
      artworkId: string,
      callback: (likes: string[]) => void
    ) => () => void;
  }
  
  export const firestoreService: FirestoreService = {
    addArtwork: async (artworkData) => {
      try {
        const docRef = await addDoc(collection(db, 'artworks'), {
          ...artworkData,
          createdAt: serverTimestamp(),
          likes: [],
          comments: 0
        });
        return docRef.id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    getArtworks: async () => {
      try {
        const querySnapshot = await getDocs(
          query(collection(db, 'artworks'), orderBy('createdAt', 'desc'))
        );
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Artwork[];
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    getArtworkById: async (id: string) => {
      try {
        const docRef = doc(db, 'artworks', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Artwork;
        }
        throw new Error('Artwork not found');
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    getArtworksByArtist: async (artistId: string) => {
      try {
        const q = query(
          collection(db, 'artworks'),
          where('artistId', '==', artistId),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Artwork[];
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    addComment: async (artworkId: string, commentData: CommentInput) => {
      try {
        const commentRef = await addDoc(
          collection(db, `artworks/${artworkId}/comments`),
          {
            ...commentData,
            createdAt: serverTimestamp()
          }
        );
        return commentRef.id;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    getComments: async (artworkId: string) => {
      try {
        const querySnapshot = await getDocs(
          query(
            collection(db, `artworks/${artworkId}/comments`),
            orderBy('createdAt', 'desc')
          )
        );
        return querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreComment[];
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    toggleLike: async (artworkId: string, userId: string): Promise<boolean> => {
      const artworkRef = doc(db, 'artworks', artworkId);
      try {
        const artworkSnap = await getDoc(artworkRef);
        if (!artworkSnap.exists()) {
          throw new Error("Artwork not found");
        }
  
        const artworkData = artworkSnap.data();
        const likes = artworkData?.likes || [];
        const isLiked = likes.includes(userId);
  
        await updateDoc(artworkRef, {
          likes: isLiked ? arrayRemove(userId) : arrayUnion(userId),
        });
  
        return !isLiked;
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    getLikeStatus: async (artworkId: string, userId: string): Promise<boolean> => {
      try {
        const docSnap = await getDoc(doc(db, 'artworks', artworkId));
        if (!docSnap.exists()) {
          throw new Error('Artwork not found');
        }
        const likes = docSnap.data()?.likes || [];
        return likes.includes(userId);
      } catch (error: any) {
        throw new Error(error.message);
      }
    },
  
    subscribeToComments: (artworkId: string, callback: (comments: FirestoreComment[]) => void) => {
      const q = query(
        collection(db, `artworks/${artworkId}/comments`),
        orderBy('createdAt', 'desc')
      );
  
      return onSnapshot(q, (snapshot) => {
        const comments = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as FirestoreComment[];
        callback(comments);
      });
    },
  
    subscribeLikes: (artworkId: string, callback: (likes: string[]) => void) => {
      const artworkRef = doc(db, 'artworks', artworkId);
      
      return onSnapshot(artworkRef, (snapshot) => {
        if (snapshot.exists()) {
          const likes = snapshot.data()?.likes || [];
          callback(likes);
        }
      });
    }
  };
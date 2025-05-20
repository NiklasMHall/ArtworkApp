import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../config/firebaseConfig';

interface StorageService {
  uploadImage: (uri: string, path: string) => Promise<string>;
}

export const storageService: StorageService = {
  uploadImage: async (uri: string, path: string): Promise<string> => {
    try {
      console.log('Starting image upload...', { uri, path });
      
      const response = await fetch(uri);
      console.log('Image fetched');
      
      const blob = await response.blob();
      console.log('Blob created', { size: blob.size });
      
      const storageRef = ref(storage, path);
      console.log('Storage reference created');
      
      await uploadBytes(storageRef, blob);
      console.log('Image uploaded');
      
      const downloadURL = await getDownloadURL(storageRef);
      console.log('Download URL obtained:', downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error('Upload error details:', error);
      throw new Error(`Error uploading image: ${error.message}`);
    }
  }
};
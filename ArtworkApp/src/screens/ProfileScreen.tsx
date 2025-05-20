/**
 * Profile screen component.
 * Displays user profile information and artworks.
 * Handles picking a new profile photo and signing out.
 */
import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Text, Button, Divider, ActivityIndicator } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { RootStackParamList } from '../types/navigation';
import { firestoreService } from '../services/firestoreService';
import { authService } from '../services/authService';
import { storageService } from '../services/storageService';
import { auth, db, storage } from '../config/firebaseConfig';
import { Artwork } from '../types/artwork';
import ProfileImage from '../components/ProfileImage';
import ArtworkCard from '../components/ArtWorkCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

type ProfileScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Profile'>;
};

/**
 * Profile screen component.
 * @param navigation Navigation prop to navigate to other screens.
 */
const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [uploadingPhoto, setUploadingPhoto] = useState<boolean>(false);

  useEffect(() => {
    loadUserArtworks();
 
    const unsubscribe = navigation.addListener('focus', () => {
      loadUserArtworks();
    });

    return unsubscribe;
  }, [navigation]);

  /**
   * Loads artworks for the current user from the database.
   */
  const loadUserArtworks = async () => {
    if (!auth.currentUser) {
      setLoading(false);
      return;
    }
  
    try {
      console.log('Starting to load artworks for user:', auth.currentUser.uid);
      const artworksQuery = query(
        collection(db, 'artworks'),
        where('artistId', '==', auth.currentUser.uid),
        orderBy('createdAt', 'desc')
      );
      console.log('Query created');
  
      const snapshot = await getDocs(artworksQuery);
      console.log('Query executed, found documents:', snapshot.size);
  
      const userArtworks = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Artwork[];
  
      console.log('Processed artworks:', userArtworks.length);
      setArtworks(userArtworks);
    } catch (error) {
      console.error('Detailed error loading artworks:', error);
      setArtworks([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles picking a new profile photo.
   */
  const handlePickImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        alert('Permission to access camera roll is required!');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && auth.currentUser) {
        setUploadingPhoto(true);
        try {
          const imageUrl = await storageService.uploadImage(
            result.assets[0].uri,
            `profilePhotos/${auth.currentUser.uid}`
          );

          await authService.updateUserProfile({
            photoURL: imageUrl
          });
        } catch (error) {
          console.error('Error uploading profile photo:', error);
          alert('Failed to upload profile photo');
        } finally {
          setUploadingPhoto(false);
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      alert('Error selecting image');
    }
  };

  /**
   * Handles signing out.
   */
  const handleSignOut = async () => {
    try {
      await authService.signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) return <LoadingSpinner />;

  const renderArtworks = () => {
    if (loading) {
      return <LoadingSpinner />;
    }

    if (artworks.length === 0) {
      return (
        <View style={styles.emptyStateContainer}>
          <Text style={styles.emptyStateText}>No artworks yet</Text>
          <Button 
            mode="contained" 
            onPress={() => navigation.navigate('Upload')}
            style={styles.uploadButton}
          >
            Upload Your First Artwork
          </Button>
        </View>
      );
    }

    return (
      <View style={styles.artworkGrid}>
        {artworks.map(artwork => (
          <View key={artwork.id} style={styles.artworkContainer}>
            <ArtworkCard
              artwork={artwork}
              onPress={() => navigation.navigate('ArtworkDetail', { artwork })}
              viewMode="grid"
            />
          </View>
        ))}
      </View>
    );
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handlePickImage} disabled={uploadingPhoto}>
          <ProfileImage 
            uri={auth.currentUser?.photoURL || undefined}
            size={100}
            style={styles.profileImage}
          />
          {uploadingPhoto ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#6200ee" />
            </View>
          ) : (
            <Text style={styles.changePhotoText}>Change Photo</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.name}>
          {auth.currentUser?.displayName || 'Anonymous Artist'}
        </Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>

        <View style={styles.stats}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{artworks?.length || 0}</Text>
            <Text style={styles.statLabel}>Artworks</Text>
          </View>
        </View>
      </View>

      <Divider style={styles.divider} />

      <View style={styles.artworksSection}>
        <Text style={styles.sectionTitle}>My Artworks</Text>
        {renderArtworks()}
      </View>

      <Button 
        mode="outlined" 
        onPress={handleSignOut}
        style={styles.signOutButton}
      >
        Sign Out
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
  },
  profileImage: {
    marginBottom: 12,
  },
  loadingContainer: {
    alignItems: 'center',
    marginTop: 8,
  },
  changePhotoText: {
    color: '#6200ee',
    textAlign: 'center',
    marginTop: 8,
    fontSize: 14,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
    marginBottom: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    color: '#666',
  },
  divider: {
    marginVertical: 16,
  },
  artworksSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  artworkGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  artworkContainer: {
    width: '48%',
    marginBottom: 16,
  },
  emptyStateContainer: {
    alignItems: 'center',
    padding: 20,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  uploadButton: {
    marginTop: 8,
  },
  signOutButton: {
    margin: 16,
  },
});

export default ProfileScreen;
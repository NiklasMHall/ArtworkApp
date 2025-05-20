import React, { useState } from 'react';
import { View, Image, StyleSheet, ScrollView,KeyboardAvoidingView, Platform, TouchableWithoutFeedback, Keyboard, useWindowDimensions } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { firestoreService } from '../services/firestoreService';
import { storageService } from '../services/storageService';
import { auth } from '../config/firebaseConfig';
import LoadingSpinner from '../components/LoadingSpinner';


type UploadScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Upload'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type UploadArtworkScreenProps = {
  navigation: UploadScreenNavigationProp;
};

interface ArtworkForm {
  title: string;
  description: string;
  category: string;
}

  const UploadArtworkScreen: React.FC<UploadArtworkScreenProps> = ({ navigation }) => {
    const { width } = useWindowDimensions();
    const isWeb = Platform.OS === 'web';
  const [image, setImage] = useState<string | null>(null);
  const [form, setForm] = useState<ArtworkForm>({
    title: '',
    description: '',
    category: ''
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const pickImage = async (useCamera: boolean = false) => {
    try {
      const permissionResult = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        setError('Permission denied');
        return;
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

      if (!result.canceled && result.assets) {
        setImage(result.assets[0].uri);
        setError(''); // Clear any previous errors
      }
    } catch (error) {
      console.error('Error picking image:', error);
      setError('Failed to pick image');
    }
  };

  const handleUpload = async () => {
    if (!image || !form.title.trim() || !form.description.trim() || !auth.currentUser) {
      setError('Please fill in all fields and select an image');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const imageUrl = await storageService.uploadImage(
        image,
        `artworks/${auth.currentUser.uid}/${Date.now()}`
      );

      const artworkId = await firestoreService.addArtwork({
        title: form.title.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        imageUrl,
        artistId: auth.currentUser.uid,
        artistName: auth.currentUser.displayName || 'Anonymous Artist',
        createdAt: new Date().toISOString(),
        likes: [], // Initialize empty likes array
        comments: 0  // Initialize comments count
      });

      // Navigate to the artwork detail screen after successful upload
      navigation.navigate('ArtworkDetail', {
        artwork: {
          id: artworkId,
          title: form.title.trim(),
          description: form.description.trim(),
          category: form.category.trim(),
          imageUrl,
          artistId: auth.currentUser.uid,
          artistName: auth.currentUser.displayName || 'Anonymous Artist',
          createdAt: new Date().toISOString(),
          likes: [],
          comments: 0
        }
      });
    } catch (error) {
      console.error('Error uploading artwork:', error);
      setError('Failed to upload artwork. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { flex: 1 }]}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            style={styles.container}
            contentContainerStyle={[
              styles.contentContainer,
              isWeb && styles.webContentContainer,
            ]}
          >
            <View style={[styles.imageContainer, isWeb && styles.webImageContainer]}>
              {image ? (
                <Image source={{ uri: image }} style={styles.image} />
              ) : (
                <Text style={styles.placeholder}>No image selected</Text>
              )}
            </View>
            <View style={styles.buttonContainer}>
              <Button
                mode="contained"
                onPress={() => pickImage(false)}
                style={[styles.button, isWeb && styles.webButton]}
              >
          Pick from Gallery
        </Button>
        <Button
          mode="contained"
          onPress={() => pickImage(true)}
          style={[styles.button, isWeb && styles.webButton]}
        >
          Take Photo
        </Button>
      </View>
  
      <View style={styles.formContainer}>
        <TextInput
          label="Title"
          value={form.title}
          onChangeText={(text) => {
            setForm({ ...form, title: text });
            setError('');
          }}
          mode="outlined"
          style={styles.input}
          theme={{
            colors: {
              background: 'white',
              text: 'black',
              placeholder: '#666',
            },
          }}
        />
  
        <TextInput
          label="Description"
          value={form.description}
          onChangeText={(text) => {
            setForm({ ...form, description: text });
            setError('');
          }}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.input}
          theme={{
            colors: {
              background: 'white',
              text: 'black',
              placeholder: '#666',
            },
          }}
        />
  
        <TextInput
          label="Category"
          value={form.category}
          onChangeText={(text) => {
            setForm({ ...form, category: text });
            setError('');
          }}
          mode="outlined"
          style={styles.input}
          theme={{
            colors: {
              background: 'white',
              text: 'black',
              placeholder: '#666',
            },
          }}
        />
     </View>
          {error ? <Text style={styles.error}>{error}</Text> : null}
          <Button
            mode="contained"
            onPress={handleUpload}
            disabled={!image || !form.title.trim() || !form.description.trim()}
            style={styles.submitButton}
          >
            Upload Artwork
          </Button>
        </ScrollView>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
  },
  webContentContainer: {
    maxWidth: 800,
    alignSelf: 'center',
    width: '100%',
    paddingTop: 32,
  },
  imageContainer: {
    height: 300,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderRadius: 8,
  },
  webImageContainer: {
    maxWidth: 600,
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  placeholder: {
    color: '#666',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
  },
  webButton: {
    maxWidth: 200,
  },
  formContainer: {
    maxWidth: 600,
    alignSelf: 'center',
    width: '100%',
  },
  input: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  error: {
    color: 'red',
    marginBottom: 12,
    textAlign: 'center',
  },
  submitButton: {
    marginTop: 8,
    marginBottom: 24,
    maxWidth: 200,
    alignSelf: 'center',
  },
});

export default UploadArtworkScreen;
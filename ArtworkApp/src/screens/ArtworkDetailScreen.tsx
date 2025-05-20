import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Card, Text, Button, TextInput, ActivityIndicator, useTheme } from 'react-native-paper';
import { ScrollView } from 'react-native-gesture-handler';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types/navigation';
import { firestoreService, FirestoreComment } from '../services/firestoreService';
import { auth } from '../config/firebaseConfig';
import { formatDate } from '../utils/formatDate';
import { useResponsiveLayout } from '../utils/layout';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

/**
 * Types for the component
 */
type Props = NativeStackScreenProps<RootStackParamList, 'ArtworkDetail'>;

/**
 * Renders the artwork detail screen
 */
const ArtworkDetailScreen: React.FC<Props> = ({ route, navigation}) => {
  const { colors } = useTheme();
  const { getContentMaxWidth } = useResponsiveLayout();
  const { artwork } = route.params;
  const [comment, setComment] = useState<string>('');
  const [comments, setComments] = useState<FirestoreComment[]>([]);
  const [isLiked, setIsLiked] = useState<boolean>(false);
  const [likesCount, setLikesCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Initialize like status
    firestoreService.getLikeStatus(artwork.id, auth.currentUser.uid)
      .then(setIsLiked)
      .catch((error) => {
        console.error('Error getting like status:', error);
      });

    // Subscribe to comments
    const unsubscribeComments = firestoreService.subscribeToComments(
      artwork.id,
      (newComments) => {
        setComments(newComments);
        setIsLoading(false);
      }
    );

    // Subscribe to likes
    const unsubscribeLikes = firestoreService.subscribeLikes(
      artwork.id,
      (likes) => setLikesCount(likes.length)
    );

    return () => {
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [artwork.id]);

  /**
   * Handles like button click
   */
  const handleLike = async () => {
    if (!auth.currentUser) return;

    try {
      const newLikeStatus = await firestoreService.toggleLike(
        artwork.id,
        auth.currentUser.uid
      );
      setIsLiked(newLikeStatus);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  /**
   * Handles comment button click
   */
  const handleComment = async () => {
    if (!comment.trim() || !auth.currentUser) return;

    try {
      await firestoreService.addComment(artwork.id, {
        text: comment.trim(),
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || 'Anonymous'
      });
      setComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    }
  };
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
    <View style={styles.container}>
      <View style={styles.header}>
        <Button
          icon="arrow-left"
          onPress={() => navigation.goBack()}
          style={[styles.backButton, { backgroundColor: 'rgba(255, 255, 255, 0.5)' }]}
          color={colors.onSurface}
        >
          Back
        </Button>
      </View>
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: artwork.imageUrl }} 
          style={styles.image}
          resizeMode="cover"
        />
      </View>
      <ScrollView style={styles.contentContainer}>
          <Text style={[styles.title, { color: colors.onSurface }]}>
            {artwork.title}
          </Text>
          <Text style={[styles.artist, { color: colors.onSurfaceVariant }]}>
            by {artwork.artistName}
          </Text>
          <Text style={[styles.description, { color: colors.onSurface }]}>
            {artwork.description}
          </Text>
          
          <View style={styles.interactions}>
            <Button 
              icon={isLiked ? 'heart' : 'heart-outline'} 
              onPress={handleLike}
              disabled={!auth.currentUser}
              textColor={colors.primary}
            >
              {`${likesCount} ${likesCount === 1 ? 'Like' : 'Likes'}`}
            </Button>
          </View>

          <TextInput
            value={comment}
            onChangeText={setComment}
            placeholder="Add a comment..."
            mode="outlined"
            disabled={!auth.currentUser}
            style={styles.commentInput}
            theme={{
              colors: {
                background: colors.surface,
                text: colors.onSurface,
                placeholder: colors.onSurfaceVariant
              }
            }}
            right={
              <TextInput.Icon 
                icon="send" 
                onPress={handleComment}
                disabled={!comment.trim() || !auth.currentUser}
              />
            }
          />

          <View style={styles.commentsSection}>
            <Text style={[styles.commentsHeader, { color: colors.onSurface }]}>
              Comments ({comments.length})
            </Text>
            
            {isLoading ? (
              <ActivityIndicator style={styles.loader} color={colors.primary} />
            ) : (
              comments.map((comment) => (
                <View 
                  key={comment.id} 
                  style={[styles.commentItem, { backgroundColor: colors.surfaceVariant }]}
                >
                  <Text style={[styles.commentUser, { color: colors.onSurface }]}>
                    {comment.userName}
                  </Text>
                  <Text style={[styles.commentText, { color: colors.onSurface }]}>
                    {comment.text}
                  </Text>
                  <Text style={[styles.commentDate, { color: colors.onSurfaceVariant }]}>
                    {formatDate(comment.createdAt.toDate())}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </View>
    </GestureHandlerRootView>
  );
};

/**
 * Styles for the component
 */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    position: 'absolute',
    top: 40, // Adjust for safe area
    left: 16,
    zIndex: 10,
  },
  backButton: {
    borderRadius: 24,
    paddingVertical: 4,
    paddingHorizontal: 12,
  },
  imageContainer: {
    height: 450,
    width: '100%',
    position: 'absolute',
    top: 0,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
    marginTop: 440,
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  artist: {
    fontSize: 18,
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    marginVertical: 16,
    lineHeight: 24,
  },
  interactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 20,
  },
  commentInput: {
    marginVertical: 16,
  },
  commentsSection: {
    marginTop: 24,
  },
  commentsHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  commentItem: {
    marginVertical: 8,
    padding: 16,
    borderRadius: 12,
  },
  commentUser: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  commentText: {
    fontSize: 16,
    marginBottom: 8,
    lineHeight: 22,
  },
  commentDate: {
    fontSize: 12,
  },
  loader: {
    marginVertical: 24,
  },
});

export default ArtworkDetailScreen;

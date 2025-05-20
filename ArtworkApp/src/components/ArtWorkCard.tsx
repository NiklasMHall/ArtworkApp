/**
 * A component that renders a card with an image and text for an artwork.
 * @prop artwork - The artwork object with an imageUrl, title, and artistName.
 * @prop onPress - The callback function to be called when the card is pressed.
 * @prop viewMode - The view mode of the card, either 'grid' or 'list'.
 */
import React from 'react';
import { StyleSheet, Dimensions, Platform, View } from 'react-native';
import { Card, Title, Paragraph, useTheme, Text } from 'react-native-paper';
import { useResponsiveLayout } from '../utils/layout';
import { colors } from '../themes/colors';

interface ArtworkCardProps {
  artwork: {
    imageUrl: string;
    title: string;
    artistName: string;
  };
  onPress: () => void;
  viewMode: 'grid' | 'list';
}

/**
 * A functional component that renders a card with an image and text for an artwork.
 * 
 * If the viewMode is 'grid', the card will be a square with the image and text centered.
 * If the viewMode is 'list', the card will be a horizontal row with the image on the left and the text on the right.
 * 
 * The card is pressable and calls the onPress callback when pressed.
 */
const ArtworkCard: React.FC<ArtworkCardProps> = ({ artwork, onPress, viewMode }) => {
  const { isWeb } = useResponsiveLayout();
  const theme = useTheme();

  return (
    <Card
      style={[
        styles.card,
        viewMode === 'list' && styles.listCard,
        { backgroundColor: theme.colors.background },
      ]}
      onPress={onPress}
    >
      <Card.Cover
        source={{ uri: artwork.imageUrl }}
        style={[styles.image, viewMode === 'list' && styles.listImage]}
      />
      <Card.Content style={viewMode === 'list' && styles.listContent}>
        <Title
          numberOfLines={1}
          style={[styles.title, { color: theme.colors.onSurface }]}
        >
          {artwork.title}
        </Title>
        <Paragraph
          numberOfLines={1}
          style={{ color: theme.colors.onSurfaceVariant }}
        >
          {artwork.artistName}
        </Paragraph>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  /**
   * The style for the card.
   * The card is a square with a width and height of 400px and a margin of 8px.
   * The card has a shadow on the web platform.
   */
  card: {
    width: '100%',
    maxWidth: 400,
    margin: 8,
    ...Platform.select({
      web: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      default: {
        elevation: 4,
      },
    }),
  },
  /**
   * The style for the card when the viewMode is 'list'.
   * The card is a horizontal row with the image on the left and the text on the right.
   * The card has a height of 120px and a maximum width of 800px.
   */
  listCard: {
    flexDirection: 'row',
    height: 120,
    maxWidth: 800,
  },
  /**
   * The style for the image.
   * The image is a square with a width and height of undefined and an aspect ratio of 1.
   */
  image: {
    height: undefined,
    aspectRatio: 1,
  },
  /**
   * The style for the image when the viewMode is 'list'.
   * The image is a square with a width and height of 120px.
   */
  listImage: {
    width: 120,
    height: 120,
  },
  /**
   * The style for the content when the viewMode is 'list'.
   * The content is centered vertically.
   */
  listContent: {
    flex: 1,
    justifyContent: 'center',
  },
  /**
   * The style for the title.
   * The title has a font size of 16px.
   */
  title: {
    fontSize: 16,
  },
});

export default ArtworkCard;

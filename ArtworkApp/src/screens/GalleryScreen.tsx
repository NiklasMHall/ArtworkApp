import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Platform } from 'react-native';
import { Searchbar, SegmentedButtons, useTheme } from 'react-native-paper';
import { CompositeNavigationProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RootStackParamList, TabParamList } from '../types/navigation';
import { firestoreService } from '../services/firestoreService';
import { Artwork } from '../types/artwork';
import ArtworkCard from '../components/ArtWorkCard';
import { useResponsiveLayout } from '../utils/layout';
import LoadingSpinner from '../components/LoadingSpinner';

type GalleryScreenNavigationProp = CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList, 'Gallery'>,
    NativeStackNavigationProp<RootStackParamList>
  >;


type GalleryScreenProps = {
  navigation: GalleryScreenNavigationProp;
};

const GalleryScreen: React.FC<GalleryScreenProps> = ({ navigation }) => {
  const { isWeb, getGridColumns, getContentMaxWidth } = useResponsiveLayout();
  const theme = useTheme();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const fetchArtworks = async () => {
    try {
      const fetchedArtworks = await firestoreService.getArtworks();
      setArtworks(fetchedArtworks);
    } catch (error) {
      console.error('Error fetching artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      fetchArtworks();
    });

    return unsubscribe;
  }, [navigation]);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchArtworks();
  };

  const filteredArtworks = artworks.filter(artwork => {
    const searchLower = searchQuery.toLowerCase();
    return (
      artwork.title.toLowerCase().includes(searchLower) ||
      artwork.artistName.toLowerCase().includes(searchLower) ||
      (artwork.category?.toLowerCase().includes(searchLower) || false)
    );
  });

  const renderArtwork = ({ item }: { item: Artwork }) => (
    <View style={[
      styles.artworkContainer,
      {
        width: `${100 / getGridColumns(viewMode) - 3}%`
      }
    ]}>
      <ArtworkCard
        artwork={item}
        onPress={() => navigation.navigate('ArtworkDetail', { artwork: item })}
        viewMode={viewMode}
      />
    </View>
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={[
      styles.container,
      { 
        backgroundColor: theme.colors.background,
        maxWidth: getContentMaxWidth(),
      }
    ]}>
      <View style={[styles.header, isWeb && styles.webHeader]}>
        <View style={styles.searchContainer}>
          <Searchbar
            placeholder="Search artworks..."
            onChangeText={setSearchQuery}
            value={searchQuery}
            style={[styles.searchBar, isWeb && styles.webSearchBar]}
          />
          <SegmentedButtons
            value={viewMode}
            onValueChange={(value) => setViewMode(value as 'grid' | 'list')}
            buttons={[
              { value: 'grid', label: 'Grid', icon: 'grid' },
              { value: 'list', label: 'List', icon: 'list' }
            ]}
            style={styles.viewModeButtons}
          />
        </View>
      </View>

      <FlatList
        data={filteredArtworks}
        renderItem={renderArtwork}
        keyExtractor={item => item.id}
        numColumns={getGridColumns(viewMode)}
        key={`${viewMode}-${getGridColumns(viewMode)}`}
        refreshing={refreshing}
        onRefresh={handleRefresh}
        contentContainerStyle={[
          styles.listContainer,
          isWeb && styles.webListContainer
        ]}
        columnWrapperStyle={viewMode === 'grid' ? styles.gridRow : undefined}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
  },
  searchContainer: {
    maxWidth: 800,
    width: '100%',
    alignSelf: 'center',
  },
  webHeader: {
    paddingHorizontal: 20,
  },
  searchBar: {
    marginBottom: 16,
  },
  webSearchBar: {
    marginBottom: 16,
  },
  viewModeButtons: {
    marginBottom: 16,
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    width: '100%',
    maxWidth: Platform.OS === 'web' ? 1200 : undefined,
    alignSelf: 'center',
  },
  webListContainer: {
    paddingHorizontal: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
    width: '100%',
  },
  artworkContainer: {
    marginBottom: 16,
    alignItems: 'center',
  }
});

export default GalleryScreen;
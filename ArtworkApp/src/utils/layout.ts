import { Platform, useWindowDimensions } from 'react-native';

export const useResponsiveLayout = () => {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';

  const getGridColumns = (viewMode: 'grid' | 'list') => {
    if (!isWeb) return viewMode === 'grid' ? 2 : 1;
    if (width > 1200) return viewMode === 'grid' ? 4 : 1;
    if (width > 768) return viewMode === 'grid' ? 3 : 1;
    return viewMode === 'grid' ? 2 : 1;
  };

  const getContentMaxWidth = () => {
    if (!isWeb) return '100%';
    if (width > 1200) return 1200;
    if (width > 768) return '90%';
    return '95%';
  };

  return {
    isWeb,
    screenWidth: width,
    getGridColumns,
    getContentMaxWidth,
  };
};
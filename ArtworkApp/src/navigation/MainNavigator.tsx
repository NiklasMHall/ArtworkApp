import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import GalleryScreen from '../screens/GalleryScreen';
import UploadArtworkScreen from '../screens/UploadArtworkScreen';
import ProfileScreen from '../screens/ProfileScreen';

type TabParamList = {
  Gallery: undefined;
  Upload: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<TabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          switch (route.name) {
            case 'Gallery':
              iconName = focused ? 'images' : 'images-outline';
              break;
            case 'Upload':
              iconName = focused ? 'add-circle' : 'add-circle-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#6200ee',
        tabBarInactiveTintColor: 'gray',
      })}
    >
      <Tab.Screen 
        name="Gallery" 
        component={GalleryScreen}
        options={{ title: 'Art Gallery' }}
      />
      <Tab.Screen 
        name="Upload" 
        component={UploadArtworkScreen}
        options={{ title: 'Upload Art' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
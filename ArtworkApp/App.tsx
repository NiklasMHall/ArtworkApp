import React, { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider as PaperProvider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from 'firebase/auth';
import { StatusBar } from 'expo-status-bar';

import { auth } from './src/config/firebaseConfig';
import { getNavigationTheme, getTheme } from './src/themes/theme';
import SignInScreen from './src/screens/SignInScreen';
import SignupScreen from './src/screens/SignupScreen';
import GalleryScreen from './src/screens/GalleryScreen';
import UploadArtworkScreen from './src/screens/UploadArtworkScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import ArtworkDetailScreen from './src/screens/ArtworkDetailScreen';
import LoadingSpinner from './src/components/LoadingSpinner';
import { RootStackParamList, TabParamList } from './src/types/navigation';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const colorScheme = useColorScheme();
  const theme = getTheme(colorScheme === 'dark');
  const navigationTheme = getNavigationTheme(colorScheme === 'dark');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return unsubscribe;
  }, []);

  if (isLoading) {
    return (
      <PaperProvider theme={theme}>
        <LoadingSpinner />
      </PaperProvider>
    );
  }

  const Stack = createNativeStackNavigator<RootStackParamList>();
  const Tab = createBottomTabNavigator<TabParamList>();

  function TabNavigator() {
    return (
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName: keyof typeof Ionicons.glyphMap = 'images';
            if (route.name === 'Gallery') {
              iconName = focused ? 'images' : 'images-outline';
            } else if (route.name === 'Upload') {
              iconName = focused ? 'add-circle' : 'add-circle-outline';
            } else if (route.name === 'Profile') {
              iconName = focused ? 'person' : 'person-outline';
            }
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#6200ee',
          tabBarInactiveTintColor: 'gray',
        })}
      >
        <Tab.Screen name="Gallery" component={GalleryScreen} />
        <Tab.Screen name="Upload" component={UploadArtworkScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator
  screenOptions={{
    headerShown: false,
    headerTintColor: theme.colors.onSurface,
    headerStyle: {
      backgroundColor: theme.colors.surface,
    },
  }}
>
  {currentUser ? (
    <>
      <Stack.Screen name="MainApp" component={TabNavigator} />
      <Stack.Screen
        name="ArtworkDetail"
        component={ArtworkDetailScreen}
      />
    </>
  ) : (
    <>
      <Stack.Screen name="SignIn" component={SignInScreen} />
      <Stack.Screen
        name="Signup"
        component={SignupScreen}
        options={{
          title: 'Create Account',
          headerShown: true,
        }}
      />
    </>
  )}
</Stack.Navigator>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
      </NavigationContainer>
    </PaperProvider>
  );
}
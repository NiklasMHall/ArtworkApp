import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SignInScreen from '../screens/SignInScreen';
import SignupScreen from '../screens/SignupScreen';
import { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="SignIn" 
        component={SignInScreen} 
      />
      <Stack.Screen 
        name="Signup" 
        component={SignupScreen}
        options={{ 
          headerShown: true,
          title: 'Create Account' 
        }}
      />
    </Stack.Navigator>
  );
};

export default AuthNavigator;
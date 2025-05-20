import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainNavigator from './MainNavigator';
import AuthNavigator from './AuthNavigator';

const AppNavigator = () => (
  <NavigationContainer>
    <MainNavigator />
  </NavigationContainer>
);

export default AppNavigator;

import * as React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import HomeScreen from './Components/HomeScreen.js';
import UploadPhoto from './Components/UploadPhoto.js';

const Tab = createMaterialBottomTabNavigator();

const App = (props) => {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="New Scan" component={UploadPhoto} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App; 
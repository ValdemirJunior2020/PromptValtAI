import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// ❌ WRONG: import { GeneratorScreen } from '../screens/GeneratorScreen';
// ✅ CORRECT: Import directly without braces
import GeneratorScreen from '../screens/GeneratorScreen'; 

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen 
        name="Smart Gen" 
        component={GeneratorScreen} // If the import above is wrong, this is 'undefined'
      />
    </Tab.Navigator>
  );
}
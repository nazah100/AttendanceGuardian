import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import TabNavigator from './src/navigation/TabNavigator';
import SubjectDetailScreen from './src/screens/SubjectDetailScreen';
import AddSubjectScreen from './src/screens/AddSubjectScreen';
import AuthScreen from './src/screens/AuthScreen'; // <-- ১. AuthScreen ইম্পোর্ট করুন

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Auth" // <-- ২. প্রথম স্ক্রিন হিসেবে Auth (লগইন) সেট করুন
        screenOptions={{
          headerStyle: { backgroundColor: '#0F172A' },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {/* ৩. লগইন / রেজিস্ট্রেশন স্ক্রিন */}
        <Stack.Screen 
          name="Auth" 
          component={AuthScreen} 
          options={{ headerShown: false }} 
        />

        {/* ৪. মেইন অ্যাপ / ট্যাব নেভিগেটর */}
        <Stack.Screen 
          name="MainTabs" 
          component={TabNavigator} 
          options={{ headerShown: false }} 
        />

        <Stack.Screen name="SubjectDetail" component={SubjectDetailScreen} options={{ title: 'Subject Details' }} />
        <Stack.Screen name="AddSubject" component={AddSubjectScreen} options={{ title: 'Add Subject' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
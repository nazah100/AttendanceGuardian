import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import your screen components
import DashboardScreen from '../screens/DashboardScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import AttendanceHistoryScreen from '../screens/AttendanceHistoryScreen';

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Attendance') {
            iconName = focused ? 'location' : 'location-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#38BDF8',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#1E293B',
          borderTopColor: '#334155',
          height: 60,
          paddingBottom: 8,
          paddingTop: 8,
        },
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: '#F8FAFC',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        options={{ title: 'Dashboard' }} 
      />
      <Tab.Screen 
        name="Attendance" 
        component={AttendanceScreen} 
        options={{ title: 'GPS Attendance' }} 
      />
      <Tab.Screen 
        name="History" 
        component={AttendanceHistoryScreen} 
        options={{ title: 'Attendance History' }} 
      />
    </Tab.Navigator>
  );
}
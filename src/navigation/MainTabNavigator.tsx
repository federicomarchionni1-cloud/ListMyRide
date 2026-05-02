import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '@/types/navigation';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { AccountScreen } from '@/screens/account/AccountScreen';
import { COLORS } from '@/constants/theme';

const Tab = createBottomTabNavigator<MainTabParamList>();

export function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textSecondary,
        tabBarStyle: { borderTopColor: COLORS.border },
        tabBarIcon: ({ focused, color, size }) => {
          const icons: Record<string, { focused: any; outline: any }> = {
            Home: { focused: 'home', outline: 'home-outline' },
            Account: { focused: 'person', outline: 'person-outline' },
          };
          const icon = icons[route.name];
          return (
            <Ionicons
              name={focused ? icon.focused : icon.outline}
              size={size}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: 'My Listings' }} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

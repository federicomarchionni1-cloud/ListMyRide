import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from '@/types/navigation';
import { MainTabNavigator } from './MainTabNavigator';
import { PlateEntryScreen } from '@/screens/listing/PlateEntryScreen';
import { PhotoCaptureScreen } from '@/screens/listing/PhotoCaptureScreen';
import { AnalysisScreen } from '@/screens/listing/AnalysisScreen';
import { ReviewScreen } from '@/screens/listing/ReviewScreen';
import { ExportScreen } from '@/screens/listing/ExportScreen';
import { COLORS } from '@/constants/theme';

const Stack = createNativeStackNavigator<MainStackParamList>();

const headerOptions = {
  headerStyle: { backgroundColor: COLORS.background },
  headerTintColor: COLORS.primary,
  headerTitleStyle: { fontWeight: '600' as const },
  headerShadowVisible: false,
};

export function MainStackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen
        name="PlateEntry"
        component={PlateEntryScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Enter Plate', headerLeft: () => null }}
      />
      <Stack.Screen
        name="PhotoCapture"
        component={PhotoCaptureScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Add Photos' }}
      />
      <Stack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Analysing Vehicle', gestureEnabled: false, headerLeft: () => null }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Your Listing' }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{ ...headerOptions, headerShown: true, title: 'Export Listing' }}
      />
    </Stack.Navigator>
  );
}

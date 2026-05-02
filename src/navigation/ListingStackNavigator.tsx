import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ListingStackParamList } from '@/types/navigation';
import { PlateEntryScreen } from '@/screens/listing/PlateEntryScreen';
import { PhotoCaptureScreen } from '@/screens/listing/PhotoCaptureScreen';
import { AnalysisScreen } from '@/screens/listing/AnalysisScreen';
import { ReviewScreen } from '@/screens/listing/ReviewScreen';
import { ExportScreen } from '@/screens/listing/ExportScreen';
import { COLORS } from '@/constants/theme';

const Stack = createNativeStackNavigator<ListingStackParamList>();

export function ListingStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.primary,
        headerTitleStyle: { fontWeight: '600' },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen
        name="PlateEntry"
        component={PlateEntryScreen}
        options={{ title: 'Enter Plate', headerLeft: () => null }}
      />
      <Stack.Screen
        name="PhotoCapture"
        component={PhotoCaptureScreen}
        options={{ title: 'Add Photos' }}
      />
      <Stack.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ title: 'Analysing Vehicle', gestureEnabled: false, headerLeft: () => null }}
      />
      <Stack.Screen
        name="Review"
        component={ReviewScreen}
        options={{ title: 'Your Listing' }}
      />
      <Stack.Screen
        name="Export"
        component={ExportScreen}
        options={{ title: 'Export Listing' }}
      />
    </Stack.Navigator>
  );
}

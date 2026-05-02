import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ListingStackParamList } from '@/types/navigation';
import { subscribeToListing } from '@/services/firebase/firestore';
import { Listing } from '@/types/listing';
import { PLATFORM_CONFIGS } from '@/constants/platforms';
import { PlatformCard } from '@/components/listing/PlatformCard';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface Props {
  navigation: NativeStackNavigationProp<ListingStackParamList, 'Export'>;
  route: RouteProp<ListingStackParamList, 'Export'>;
}

export function ExportScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);

  useEffect(() => {
    const unsub = subscribeToListing(listingId, setListing);
    return unsub;
  }, [listingId]);

  if (!listing) return <LoadingOverlay message="Loading…" />;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Export to platforms</Text>
        <Text style={styles.sub}>
          Copy or share your listing to any platform. Each copy is formatted for that platform's requirements.
        </Text>

        {PLATFORM_CONFIGS.map((config) => (
          <PlatformCard key={config.id} listing={listing} config={config} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, gap: SPACING.md },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
});

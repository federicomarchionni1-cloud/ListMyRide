import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { subscribeToUserListings } from '@/services/firebase/firestore';
import { useListingDraftStore } from '@/store/listingDraftStore';
import { Listing } from '@/types/listing';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';
import { formatGBP } from '@/utils/formatCurrency';
import { MainStackParamList } from '@/types/navigation';
import { format } from 'date-fns';

export function HomeScreen() {
  const { user } = useAuthStore();
  const [listings, setListings] = useState<Listing[]>([]);
  const resetDraft = useListingDraftStore((s) => s.reset);

  const navigation = useNavigation<NativeStackNavigationProp<MainStackParamList>>();

  useEffect(() => {
    if (!user) return;
    const unsub = subscribeToUserListings(user.uid, setListings);
    return unsub;
  }, [user]);

  function startNewListing() {
    resetDraft();
    navigation.navigate('PlateEntry');
  }

  function openListing(listing: Listing) {
    navigation.navigate('Review', { listingId: listing.id });
  }

  const firstName = user?.displayName?.split(' ')[0] ?? 'there';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi, {firstName}</Text>
          <Text style={styles.subtitle}>
            {listings.length === 0
              ? 'Create your first listing'
              : `${listings.length} listing${listings.length > 1 ? 's' : ''}`}
          </Text>
        </View>
      </View>

      <View style={styles.ctaRow}>
        <Button label="+ New Listing" onPress={startNewListing} style={styles.ctaButton} />
      </View>

      {listings.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="car-outline" size={64} color={COLORS.border} />
          <Text style={styles.emptyTitle}>No listings yet</Text>
          <Text style={styles.emptyText}>
            Tap "New Listing" to photograph your vehicle and let AI write the ad for you.
          </Text>
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.card} onPress={() => openListing(item)} activeOpacity={0.8}>
              {item.photos?.[0] ? (
                <Image source={{ uri: item.photos[0] }} style={styles.thumbnail} />
              ) : (
                <View style={[styles.thumbnail, styles.thumbnailPlaceholder]}>
                  <Ionicons name="car" size={28} color={COLORS.border} />
                </View>
              )}
              <View style={styles.cardBody}>
                <Text style={styles.cardTitle} numberOfLines={1}>
                  {item.listing?.title ?? `${item.vehicle?.make ?? ''} ${item.vehicle?.yearOfManufacture ?? ''}`}
                </Text>
                <Text style={styles.cardPlate}>{item.plate}</Text>
                <Text style={styles.cardDate}>
                  {item.createdAt ? format(new Date(item.createdAt), 'd MMM yyyy') : ''}
                </Text>
              </View>
              <View style={styles.cardRight}>
                {item.listing?.suggestedPriceGBP ? (
                  <Text style={styles.price}>
                    {formatGBP(item.listing.userPriceGBP ?? item.listing.suggestedPriceGBP)}
                  </Text>
                ) : null}
                <View style={[styles.badge, styles[`badge_${item.status}`]]}>
                  <Text style={styles.badgeText}>{item.status}</Text>
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.lg,
    paddingBottom: SPACING.sm,
  },
  greeting: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  subtitle: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, marginTop: 2 },
  ctaRow: { paddingHorizontal: SPACING.lg, paddingBottom: SPACING.md },
  ctaButton: {},
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
    gap: SPACING.md,
  },
  emptyTitle: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text },
  emptyText: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  list: { padding: SPACING.lg, gap: SPACING.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  thumbnail: { width: 80, height: 80 },
  thumbnailPlaceholder: {
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBody: { flex: 1, padding: SPACING.sm, gap: 2 },
  cardTitle: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  cardPlate: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontFamily: 'monospace' },
  cardDate: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  cardRight: { padding: SPACING.sm, alignItems: 'flex-end', gap: SPACING.xs },
  price: { fontSize: FONT_SIZE.md, fontWeight: '700', color: COLORS.primary },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.full,
  },
  badge_draft: { backgroundColor: '#F3F4F6' },
  badge_ready: { backgroundColor: '#D1FAE5' },
  badge_exported: { backgroundColor: '#DBEAFE' },
  badgeText: { fontSize: 10, fontWeight: '600', textTransform: 'uppercase', color: COLORS.text },
});

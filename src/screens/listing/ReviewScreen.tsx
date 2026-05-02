import React, { useEffect, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  Image,
  TouchableOpacity,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ListingStackParamList } from '@/types/navigation';
import { subscribeToListing, updateListing } from '@/services/firebase/firestore';
import { Listing } from '@/types/listing';
import { PriceTag } from '@/components/listing/PriceTag';
import { Button } from '@/components/common/Button';
import { LoadingOverlay } from '@/components/common/LoadingOverlay';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';

interface Props {
  navigation: NativeStackNavigationProp<ListingStackParamList, 'Review'>;
  route: RouteProp<ListingStackParamList, 'Review'>;
}

export function ReviewScreen({ navigation, route }: Props) {
  const { listingId } = route.params;
  const [listing, setListing] = useState<Listing | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priceText, setPriceText] = useState('');
  const [mileageText, setMileageText] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const unsub = subscribeToListing(listingId, (l) => {
      if (l && !listing) {
        // First load — seed local state
        setTitle(l.listing?.title ?? '');
        setDescription(l.listing?.description ?? '');
        setPriceText(
          String(l.listing?.userPriceGBP ?? l.listing?.suggestedPriceGBP ?? '')
        );
        setMileageText(l.listing?.mileage ? String(l.listing.mileage) : '');
      }
      setListing(l);
    });
    return unsub;
  }, [listingId]);

  const scheduleSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const userPrice = parseFloat(priceText);
      const mileage = parseInt(mileageText, 10);
      await updateListing(listingId, {
        listing: {
          ...listing!.listing,
          title,
          description,
          userPriceGBP: isNaN(userPrice) ? null : userPrice,
          mileage: isNaN(mileage) ? null : mileage,
        },
      });
    }, 500);
  }, [title, description, priceText, mileageText, listing]);

  if (!listing) return <LoadingOverlay message="Loading listing…" />;

  const photos = listing.photos ?? [];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Photo carousel */}
        {photos.length > 0 && (
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.carousel}>
            {photos.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.photo} />
            ))}
          </ScrollView>
        )}

        {/* Price */}
        {listing.listing?.suggestedPriceGBP ? (
          <PriceTag
            suggestedPrice={listing.listing.suggestedPriceGBP}
            userPrice={listing.listing.userPriceGBP}
            rationale={listing.listing.priceRationale}
          />
        ) : null}

        {/* Editable price */}
        <View style={styles.field}>
          <Text style={styles.label}>Your asking price (£)</Text>
          <TextInput
            style={styles.input}
            value={priceText}
            onChangeText={(t) => { setPriceText(t); scheduleSave(); }}
            keyboardType="numeric"
            placeholder="Enter price"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Title */}
        <View style={styles.field}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={(t) => { setTitle(t); scheduleSave(); }}
            maxLength={100}
            placeholder="Listing title"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Mileage */}
        <View style={styles.field}>
          <Text style={styles.label}>Mileage</Text>
          <TextInput
            style={styles.input}
            value={mileageText}
            onChangeText={(t) => { setMileageText(t); scheduleSave(); }}
            keyboardType="numeric"
            placeholder="e.g. 45000"
            placeholderTextColor={COLORS.textSecondary}
          />
        </View>

        {/* Description */}
        <View style={styles.field}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={(t) => { setDescription(t); scheduleSave(); }}
            multiline
            numberOfLines={10}
            placeholder="Listing description"
            placeholderTextColor={COLORS.textSecondary}
            textAlignVertical="top"
          />
        </View>

        {/* Key selling points */}
        {listing.listing?.keySellingPoints?.length > 0 && (
          <View style={styles.field}>
            <Text style={styles.label}>Key selling points</Text>
            <View style={styles.pills}>
              {listing.listing.keySellingPoints.map((p, i) => (
                <View key={i} style={styles.pill}>
                  <Text style={styles.pillText}>• {p}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Condition */}
        {listing.condition && (
          <View style={styles.field}>
            <Text style={styles.label}>Condition ({listing.condition.conditionLabel})</Text>
            <View style={styles.conditionNotes}>
              {listing.condition.conditionNotes.map((n, i) => (
                <Text key={i} style={styles.conditionNote}>• {n}</Text>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Export Listing"
          onPress={() => navigation.navigate('Export', { listingId })}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { padding: SPACING.lg, gap: SPACING.md, paddingBottom: SPACING.xxl },
  carousel: { height: 220, marginHorizontal: -SPACING.lg, marginBottom: SPACING.sm },
  photo: { width: 340, height: 220, resizeMode: 'cover' },
  field: { gap: SPACING.xs },
  label: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  textarea: { height: 200, paddingTop: SPACING.sm },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.xs },
  pill: {
    backgroundColor: '#EEF3FA',
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
  },
  pillText: { fontSize: FONT_SIZE.xs, color: COLORS.primary },
  conditionNotes: { gap: 4 },
  conditionNote: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
});

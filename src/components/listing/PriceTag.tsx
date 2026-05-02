import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '@/constants/theme';
import { formatGBP } from '@/utils/formatCurrency';

interface PriceTagProps {
  suggestedPrice: number;
  userPrice: number | null;
  rationale?: string;
}

export function PriceTag({ suggestedPrice, userPrice, rationale }: PriceTagProps) {
  const displayed = userPrice ?? suggestedPrice;
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Suggested price</Text>
      <Text style={styles.price}>{formatGBP(displayed)}</Text>
      {userPrice !== null && userPrice !== suggestedPrice && (
        <Text style={styles.ai}>AI suggested: {formatGBP(suggestedPrice)}</Text>
      )}
      {rationale ? <Text style={styles.rationale}>{rationale}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#EEF3FA',
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    gap: SPACING.xs,
  },
  label: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textTransform: 'uppercase', letterSpacing: 0.5 },
  price: { fontSize: 32, fontWeight: '800', color: COLORS.primary },
  ai: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  rationale: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, fontStyle: 'italic', lineHeight: 18 },
});

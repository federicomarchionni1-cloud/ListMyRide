import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { VehicleData } from '@/types/vehicle';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface VehicleCardProps {
  vehicle: VehicleData;
  plate: string;
}

export function VehicleCard({ vehicle, plate }: VehicleCardProps) {
  const rows: [string, string][] = [
    ['Make', vehicle.make],
    ['Year', String(vehicle.yearOfManufacture)],
    ['Colour', vehicle.colour],
    ['Fuel', vehicle.fuelType],
    ['Engine', `${vehicle.engineCapacity}cc`],
    ['MOT', vehicle.motStatus + (vehicle.motExpiryDate ? ` (until ${vehicle.motExpiryDate})` : '')],
    ['Tax', vehicle.taxStatus],
  ];

  return (
    <View style={styles.card}>
      <View style={styles.plateRow}>
        <View style={styles.plate}>
          <Text style={styles.plateText}>{plate}</Text>
        </View>
      </View>
      {rows.map(([label, value]) => (
        <View key={label} style={styles.row}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.value}>{value}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  plateRow: {
    backgroundColor: COLORS.primary,
    padding: SPACING.md,
    alignItems: 'center',
  },
  plate: {
    backgroundColor: COLORS.plateYellow,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  plateText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: '800',
    color: COLORS.plateText,
    letterSpacing: 3,
    fontFamily: 'monospace',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  label: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  value: { fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text },
});

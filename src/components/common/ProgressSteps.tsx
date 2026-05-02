import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '@/constants/theme';

export interface Step {
  label: string;
  status: 'pending' | 'active' | 'done' | 'error';
}

interface ProgressStepsProps {
  steps: Step[];
}

export function ProgressSteps({ steps }: ProgressStepsProps) {
  return (
    <View style={styles.container}>
      {steps.map((step, i) => (
        <View key={i} style={styles.row}>
          <View style={[styles.icon, styles[`icon_${step.status}`]]}>
            {step.status === 'done' ? (
              <Ionicons name="checkmark" size={14} color="#fff" />
            ) : step.status === 'error' ? (
              <Ionicons name="close" size={14} color="#fff" />
            ) : step.status === 'active' ? (
              <View style={styles.activeDot} />
            ) : (
              <View style={styles.pendingDot} />
            )}
          </View>
          {i < steps.length - 1 && (
            <View style={[styles.line, step.status === 'done' && styles.lineDone]} />
          )}
          <Text style={[styles.label, step.status === 'active' && styles.labelActive]}>
            {step.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: SPACING.md,
    gap: 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.sm,
    gap: SPACING.sm,
  },
  icon: {
    width: 28,
    height: 28,
    borderRadius: BORDER_RADIUS.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon_pending: { backgroundColor: COLORS.border },
  icon_active: { backgroundColor: COLORS.primary },
  icon_done: { backgroundColor: COLORS.success },
  icon_error: { backgroundColor: COLORS.error },
  line: {
    position: 'absolute',
    left: 13,
    top: 28,
    width: 2,
    height: SPACING.sm,
    backgroundColor: COLORS.border,
  },
  lineDone: { backgroundColor: COLORS.success },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  pendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.textSecondary,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    color: COLORS.textSecondary,
  },
  labelActive: {
    color: COLORS.text,
    fontWeight: '600',
  },
});

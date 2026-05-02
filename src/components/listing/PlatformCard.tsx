import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Listing, Platform } from '@/types/listing';
import { PlatformConfig } from '@/constants/platforms';
import { useListingExport } from '@/hooks/useListingExport';
import { COLORS, FONT_SIZE, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface PlatformCardProps {
  listing: Listing;
  config: PlatformConfig;
}

export function PlatformCard({ listing, config }: PlatformCardProps) {
  const { copyToClipboard, shareText } = useListingExport(listing);
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await copyToClipboard(config.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      Alert.alert('Error', 'Could not copy. Please try again.');
    }
  }

  async function handleShare() {
    try {
      await shareText(config.id);
    } catch {
      // User cancelled share — no error needed
    }
  }

  return (
    <View style={styles.card}>
      <View style={[styles.colorBar, { backgroundColor: config.color }]} />
      <View style={styles.body}>
        <Text style={styles.platformName}>{config.label}</Text>
        <Text style={styles.hint}>
          Title: {config.titleMaxChars} chars · Desc: {config.descriptionMaxChars} chars
        </Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.btn} onPress={handleCopy} activeOpacity={0.8}>
            <Ionicons
              name={copied ? 'checkmark-circle' : 'copy-outline'}
              size={18}
              color={copied ? COLORS.success : COLORS.primary}
            />
            <Text style={[styles.btnText, copied && { color: COLORS.success }]}>
              {copied ? 'Copied!' : 'Copy'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btn} onPress={handleShare} activeOpacity={0.8}>
            <Ionicons name="share-outline" size={18} color={COLORS.primary} />
            <Text style={styles.btnText}>Share</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: 'hidden',
  },
  colorBar: { width: 6 },
  body: { flex: 1, padding: SPACING.md, gap: SPACING.xs },
  platformName: { fontSize: FONT_SIZE.md, fontWeight: '600', color: COLORS.text },
  hint: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary },
  actions: { flexDirection: 'row', gap: SPACING.sm, marginTop: SPACING.xs },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  btnText: { fontSize: FONT_SIZE.sm, color: COLORS.primary, fontWeight: '500' },
});

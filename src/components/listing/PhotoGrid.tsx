import React from 'react';
import { View, Image, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, BORDER_RADIUS } from '@/constants/theme';

interface PhotoGridProps {
  uris: string[];
  onAdd: () => void;
  onRemove: (uri: string) => void;
  maxPhotos?: number;
}

const TILE = 100;

export function PhotoGrid({ uris, onAdd, onRemove, maxPhotos = 10 }: PhotoGridProps) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.row}>
        {uris.map((uri) => (
          <View key={uri} style={styles.tile}>
            <Image source={{ uri }} style={styles.image} />
            <TouchableOpacity style={styles.remove} onPress={() => onRemove(uri)}>
              <Ionicons name="close-circle" size={22} color={COLORS.error} />
            </TouchableOpacity>
          </View>
        ))}
        {uris.length < maxPhotos && (
          <TouchableOpacity style={styles.addTile} onPress={onAdd} activeOpacity={0.7}>
            <Ionicons name="add" size={32} color={COLORS.primary} />
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 0 },
  row: { flexDirection: 'row', gap: SPACING.sm, paddingVertical: SPACING.xs },
  tile: {
    width: TILE,
    height: TILE,
    borderRadius: BORDER_RADIUS.md,
    overflow: 'visible',
    position: 'relative',
  },
  image: {
    width: TILE,
    height: TILE,
    borderRadius: BORDER_RADIUS.md,
  },
  remove: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.surface,
    borderRadius: 11,
  },
  addTile: {
    width: TILE,
    height: TILE,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 2,
    borderColor: COLORS.primary,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EEF3FA',
  },
});

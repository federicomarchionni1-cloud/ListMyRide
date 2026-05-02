import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/services/firebase/auth';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';

export function AccountScreen() {
  const { user } = useAuthStore();

  async function handleSignOut() {
    Alert.alert('Sign out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: async () => {
          await signOut();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Account</Text>
        </View>

        <View style={styles.avatar}>
          <Ionicons name="person-circle" size={80} color={COLORS.primary} />
          <Text style={styles.name}>{user?.displayName ?? 'User'}</Text>
          <Text style={styles.email}>{user?.email}</Text>
        </View>

        <View style={styles.section}>
          <Button
            label="Sign Out"
            onPress={handleSignOut}
            variant="secondary"
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.lg },
  header: { marginBottom: SPACING.xl },
  title: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  avatar: { alignItems: 'center', gap: SPACING.xs, marginBottom: SPACING.xl },
  name: { fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text },
  email: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  section: { gap: SPACING.sm },
});

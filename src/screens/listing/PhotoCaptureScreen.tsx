import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Alert,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListingStackParamList } from '@/types/navigation';
import { useListingDraftStore } from '@/store/listingDraftStore';
import { useListing } from '@/hooks/useListing';
import { PhotoGrid } from '@/components/listing/PhotoGrid';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';

interface Props {
  navigation: NativeStackNavigationProp<ListingStackParamList, 'PhotoCapture'>;
}

export function PhotoCaptureScreen({ navigation }: Props) {
  const { photoUris, addPhotoUri, removePhotoUri } = useListingDraftStore();
  const { start, stage } = useListing();
  const loading = stage === 'uploading' || stage === 'dvla' || stage === 'analysing' || stage === 'generating';

  async function pickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access in Settings to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10 - photoUris.length,
    });
    if (!result.canceled) {
      result.assets.forEach((a) => addPhotoUri(a.uri));
    }
  }

  async function takePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access in Settings.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 1 });
    if (!result.canceled) {
      addPhotoUri(result.assets[0].uri);
    }
  }

  async function handleAnalyse() {
    if (photoUris.length === 0) return;
    const result = await start();
    if (result) {
      navigation.navigate('Analysis', { jobId: result.jobId });
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Add vehicle photos</Text>
        <Text style={styles.sub}>
          Add 1–10 photos. Include exterior, interior, and any damage.
        </Text>

        <PhotoGrid
          uris={photoUris}
          onAdd={pickFromLibrary}
          onRemove={removePhotoUri}
          maxPhotos={10}
        />

        <View style={styles.addBtns}>
          <TouchableOpacity style={styles.addBtn} onPress={takePhoto} activeOpacity={0.8}>
            <Ionicons name="camera-outline" size={22} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Camera</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.addBtn} onPress={pickFromLibrary} activeOpacity={0.8}>
            <Ionicons name="images-outline" size={22} color={COLORS.primary} />
            <Text style={styles.addBtnText}>Library</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.count}>{photoUris.length} / 10 photos added</Text>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Analyse Vehicle"
          onPress={handleAnalyse}
          loading={loading}
          disabled={photoUris.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flexGrow: 1, padding: SPACING.lg, gap: SPACING.md },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
  addBtns: { flexDirection: 'row', gap: SPACING.sm },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: SPACING.xs,
    height: 48,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: '#EEF3FA',
  },
  addBtnText: { fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.primary },
  count: { fontSize: FONT_SIZE.xs, color: COLORS.textSecondary, textAlign: 'center' },
  footer: { padding: SPACING.lg, paddingBottom: SPACING.xl },
});

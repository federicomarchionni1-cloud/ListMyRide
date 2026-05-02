import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { ListingStackParamList } from '@/types/navigation';
import { useListingDraftStore } from '@/store/listingDraftStore';
import { useDVLA } from '@/hooks/useDVLA';
import { isValidUKPlate, normalisePlate } from '@/utils/plateValidation';
import { VehicleCard } from '@/components/listing/VehicleCard';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, FONT_SIZE, BORDER_RADIUS } from '@/constants/theme';
import { VehicleData } from '@/types/vehicle';

interface Props {
  navigation: NativeStackNavigationProp<ListingStackParamList, 'PlateEntry'>;
}

export function PlateEntryScreen({ navigation }: Props) {
  const { plate, setPlate, setVehicle } = useListingDraftStore();
  const [input, setInput] = useState(plate);
  const [foundVehicle, setFoundVehicle] = useState<VehicleData | null>(null);
  const { lookup, loading, error } = useDVLA();

  async function handleLookup() {
    const normalised = normalisePlate(input);
    if (!isValidUKPlate(normalised)) {
      Alert.alert('Invalid plate', 'Please enter a valid UK registration number.');
      return;
    }
    setPlate(normalised);
    const result = await lookup(normalised);
    if (result) {
      const vehicle: VehicleData = {
        make: result.make,
        colour: result.colour,
        fuelType: result.fuelType,
        yearOfManufacture: result.yearOfManufacture,
        engineCapacity: result.engineCapacity,
        taxStatus: result.taxStatus,
        motStatus: result.motStatus,
        motExpiryDate: result.motExpiryDate ?? 'N/A',
        registrationNumber: result.registrationNumber,
        monthOfFirstRegistration: result.monthOfFirstRegistration,
      };
      setFoundVehicle(vehicle);
      setVehicle(vehicle);
    }
  }

  function handleNext() {
    navigation.navigate('PhotoCapture');
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
          <Text style={styles.heading}>Enter the registration</Text>
          <Text style={styles.sub}>We'll look up the vehicle details automatically.</Text>

          <View style={styles.plateInput}>
            <TextInput
              style={styles.input}
              value={input}
              onChangeText={(t) => {
                setInput(t.toUpperCase());
                setFoundVehicle(null);
              }}
              placeholder="e.g. AB12 CDE"
              autoCapitalize="characters"
              maxLength={8}
              placeholderTextColor={COLORS.textSecondary}
            />
          </View>

          {error ? <Text style={styles.error}>{error}</Text> : null}

          <Button
            label="Look Up Vehicle"
            onPress={handleLookup}
            loading={loading}
            disabled={input.length < 2}
            style={styles.lookupBtn}
          />

          {foundVehicle && (
            <View style={styles.result}>
              <VehicleCard vehicle={foundVehicle} plate={normalisePlate(input)} />
              <Button
                label="Continue to Photos"
                onPress={handleNext}
                style={styles.nextBtn}
              />
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  flex: { flex: 1 },
  container: { flexGrow: 1, padding: SPACING.lg, gap: SPACING.md },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary },
  plateInput: {
    backgroundColor: COLORS.plateYellow,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
  },
  input: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
    color: COLORS.plateText,
    fontFamily: 'monospace',
    padding: SPACING.sm,
  },
  error: { fontSize: FONT_SIZE.sm, color: COLORS.error, textAlign: 'center' },
  lookupBtn: {},
  result: { gap: SPACING.md },
  nextBtn: {},
});

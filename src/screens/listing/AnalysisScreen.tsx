import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { ListingStackParamList } from '@/types/navigation';
import { subscribeToAnalysisJob } from '@/services/firebase/firestore';
import { AnalysisJob } from '@/types/listing';
import { ProgressSteps, Step } from '@/components/common/ProgressSteps';
import { Button } from '@/components/common/Button';
import { COLORS, SPACING, FONT_SIZE } from '@/constants/theme';

interface Props {
  navigation: NativeStackNavigationProp<ListingStackParamList, 'Analysis'>;
  route: RouteProp<ListingStackParamList, 'Analysis'>;
}

const STEP_LABELS = [
  'Uploading photos',
  'Looking up vehicle (DVLA)',
  'Analysing condition',
  'Generating listing',
  'Done',
];

function jobToSteps(job: AnalysisJob | null): Step[] {
  if (!job) return STEP_LABELS.map((label) => ({ label, status: 'pending' }));

  return STEP_LABELS.map((label, i) => {
    if (job.status === 'failed') {
      return { label, status: i <= job.step ? 'error' : 'pending' } as Step;
    }
    if (i < job.step) return { label, status: 'done' };
    if (i === job.step) return { label, status: job.status === 'complete' ? 'done' : 'active' };
    return { label, status: 'pending' };
  });
}

export function AnalysisScreen({ navigation, route }: Props) {
  const { jobId } = route.params;
  const [job, setJob] = useState<AnalysisJob | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    unsubscribe = subscribeToAnalysisJob(jobId, (j) => {
      setJob(j);
      if (j?.status === 'complete' && j.listingId) {
        unsubscribe?.();
        navigation.replace('Review', { listingId: j.listingId });
      }
    });
    return () => unsubscribe?.();
  }, [jobId]);

  const failed = job?.status === 'failed';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <Text style={styles.heading}>
          {failed ? 'Analysis failed' : 'Analysing your vehicle…'}
        </Text>
        <Text style={styles.sub}>
          {failed
            ? job?.error ?? 'Something went wrong. Please try again.'
            : 'This takes about 20–30 seconds. Please keep the app open.'}
        </Text>

        <ProgressSteps steps={jobToSteps(job)} />

        {failed && (
          <Button
            label="Go Back and Retry"
            onPress={() => navigation.popToTop()}
            variant="secondary"
            style={styles.retryBtn}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.background },
  container: { flex: 1, padding: SPACING.lg, gap: SPACING.md },
  heading: { fontSize: FONT_SIZE.xl, fontWeight: '700', color: COLORS.text, marginTop: SPACING.xl },
  sub: { fontSize: FONT_SIZE.sm, color: COLORS.textSecondary, lineHeight: 20 },
  retryBtn: { marginTop: SPACING.lg },
});

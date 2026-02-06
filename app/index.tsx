import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TabBar } from '../src/components/tabs/TabBar';
import { MindMapCanvas } from '../src/components/mindmap/MindMapCanvas';
import { AISynthesisPanel } from '../src/components/ai/AISynthesisPanel';
import { useLayout } from '../src/hooks/useLayout';
import { useMindMapStore } from '../src/store/useMindMapStore';
import { theme } from '../src/theme/theme';

export default function HomeScreen() {
  const router = useRouter();
  const { isWide } = useLayout();
  const isLoaded = useMindMapStore((s) => s.isLoaded);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mind Map</Text>
        <TouchableOpacity
          style={styles.settingsBtn}
          onPress={() => router.push('/settings')}
        >
          <Text style={styles.settingsBtnText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <TabBar />

      <View style={[styles.main, isWide && styles.mainWide]}>
        <View style={styles.canvasContainer}>
          <MindMapCanvas />
        </View>
        <AISynthesisPanel />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: theme.fontSize.xl,
    fontWeight: '700',
    color: theme.colors.text,
  },
  settingsBtn: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.md,
  },
  settingsBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  main: {
    flex: 1,
    flexDirection: 'column',
  },
  mainWide: {
    flexDirection: 'row',
  },
  canvasContainer: {
    flex: 1,
  },
});

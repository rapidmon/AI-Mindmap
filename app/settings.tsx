import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettingsStore } from '../src/store/useSettingsStore';
import { AIProvider } from '../src/models/types';
import { theme } from '../src/theme/theme';

export default function SettingsScreen() {
  const provider = useSettingsStore((s) => s.provider);
  const claudeApiKey = useSettingsStore((s) => s.claudeApiKey);
  const openaiApiKey = useSettingsStore((s) => s.openaiApiKey);
  const setProvider = useSettingsStore((s) => s.setProvider);
  const setClaudeApiKey = useSettingsStore((s) => s.setClaudeApiKey);
  const setOpenaiApiKey = useSettingsStore((s) => s.setOpenaiApiKey);

  const providers: { value: AIProvider; label: string }[] = [
    { value: 'claude', label: 'Claude (Anthropic)' },
    { value: 'openai', label: 'OpenAI' },
  ];

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom']}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>AI Provider</Text>
        <View style={styles.providerRow}>
          {providers.map((p) => (
            <TouchableOpacity
              key={p.value}
              style={[
                styles.providerBtn,
                provider === p.value && styles.providerBtnActive,
              ]}
              onPress={() => setProvider(p.value)}
            >
              <Text
                style={[
                  styles.providerBtnText,
                  provider === p.value && styles.providerBtnTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {provider === 'openai' && Platform.OS === 'web' && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              OpenAI API may not work on web due to CORS restrictions. Use Claude
              on web, or use OpenAI on mobile devices.
            </Text>
          </View>
        )}

        <Text style={styles.sectionTitle}>Claude API Key</Text>
        <TextInput
          style={styles.input}
          value={claudeApiKey}
          onChangeText={setClaudeApiKey}
          placeholder="sk-ant-..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Get your API key from console.anthropic.com
        </Text>

        <Text style={styles.sectionTitle}>OpenAI API Key</Text>
        <TextInput
          style={styles.input}
          value={openaiApiKey}
          onChangeText={setOpenaiApiKey}
          placeholder="sk-..."
          secureTextEntry
          autoCapitalize="none"
          autoCorrect={false}
        />
        <Text style={styles.hint}>
          Get your API key from platform.openai.com
        </Text>

        <View style={styles.infoBox}>
          <Text style={styles.infoTitle}>How it works</Text>
          <Text style={styles.infoText}>
            AI Synthesis analyzes all the nodes in your current mind map and
            suggests creative new ideas that connect different branches in
            unexpected ways. Your API keys are stored locally on your device and
            never sent to any server except the AI provider you selected.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: theme.spacing.xl,
    maxWidth: 500,
  },
  sectionTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.text,
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  providerRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  providerBtn: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
  },
  providerBtnActive: {
    borderColor: theme.colors.ai,
    backgroundColor: theme.colors.ai + '10',
  },
  providerBtnText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    fontWeight: '600',
  },
  providerBtnTextActive: {
    color: theme.colors.ai,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
  },
  hint: {
    fontSize: theme.fontSize.xs,
    color: theme.colors.textLight,
    marginTop: theme.spacing.xs,
  },
  warningBox: {
    backgroundColor: theme.colors.warning + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.md,
  },
  warningText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  infoBox: {
    backgroundColor: theme.colors.primary + '10',
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.xxl,
  },
  infoTitle: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  infoText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
  },
});

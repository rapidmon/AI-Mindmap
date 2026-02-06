import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { useMindMapStore } from '../../store/useMindMapStore';
import { useSettingsStore } from '../../store/useSettingsStore';
import { useAISynthesis } from '../../hooks/useAISynthesis';
import { useLayout } from '../../hooks/useLayout';
import { AIResultCard } from './AIResultCard';
import { theme } from '../../theme/theme';
import { AI_PANEL_WIDTH, AI_PANEL_MOBILE_HEIGHT_RATIO } from '../../utils/constants';

export function AISynthesisPanel() {
  const { isWide, height } = useLayout();
  const [isExpanded, setIsExpanded] = useState(false);
  const { results, isLoading, error, generateIdeas, clearResults } =
    useAISynthesis();

  const activeTabId = useMindMapStore((s) => s.activeTabId);
  const mindMaps = useMindMapStore((s) => s.mindMaps);
  const addNode = useMindMapStore((s) => s.addNode);
  const provider = useSettingsStore((s) => s.provider);
  const hasKey =
    provider === 'claude'
      ? useSettingsStore((s) => !!s.claudeApiKey)
      : useSettingsStore((s) => !!s.openaiApiKey);

  const mm = activeTabId ? mindMaps[activeTabId] : null;

  const handleGenerate = useCallback(() => {
    if (mm) generateIdeas(mm);
  }, [mm, generateIdeas]);

  const handleAddToMap = useCallback(
    (text: string) => {
      if (mm) addNode(mm.rootNodeId, text);
    },
    [mm, addNode],
  );

  const panelStyle = isWide
    ? [styles.panelWide, { width: AI_PANEL_WIDTH }]
    : isExpanded
      ? [styles.panelMobile, { height: height * AI_PANEL_MOBILE_HEIGHT_RATIO }]
      : [styles.panelMobileCollapsed];

  return (
    <View style={panelStyle}>
      {!isWide && (
        <TouchableOpacity
          style={styles.handle}
          onPress={() => setIsExpanded(!isExpanded)}
        >
          <View style={styles.handleBar} />
          <Text style={styles.handleText}>
            AI Ideas {isExpanded ? '▼' : '▲'}
          </Text>
        </TouchableOpacity>
      )}

      {(isWide || isExpanded) && (
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Synthesis</Text>
            {results.length > 0 && (
              <TouchableOpacity onPress={clearResults}>
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>

          {!hasKey && (
            <View style={styles.notice}>
              <Text style={styles.noticeText}>
                Set your API key in Settings to use AI synthesis.
              </Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.generateBtn, (!hasKey || isLoading) && styles.generateBtnDisabled]}
            onPress={handleGenerate}
            disabled={!hasKey || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.generateBtnText}>Generate Ideas</Text>
            )}
          </TouchableOpacity>

          {error && (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <ScrollView
            style={styles.resultsList}
            showsVerticalScrollIndicator={false}
          >
            {results.map((result) => (
              <AIResultCard
                key={result.id}
                result={result}
                onAddToMap={handleAddToMap}
              />
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  panelWide: {
    borderLeftWidth: 1,
    borderLeftColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  panelMobile: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  panelMobileCollapsed: {
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  handle: {
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  handleBar: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: theme.colors.border,
    marginBottom: theme.spacing.xs,
  },
  handleText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.ai,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '700',
    color: theme.colors.ai,
  },
  clearText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textLight,
  },
  notice: {
    backgroundColor: theme.colors.warning + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  noticeText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.warning,
  },
  generateBtn: {
    backgroundColor: theme.colors.ai,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  generateBtnDisabled: {
    opacity: 0.5,
  },
  generateBtnText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: theme.colors.error + '15',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.error,
  },
  resultsList: {
    flex: 1,
  },
});

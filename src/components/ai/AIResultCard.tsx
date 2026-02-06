import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AIResult } from '../../models/types';
import { theme } from '../../theme/theme';

interface AIResultCardProps {
  result: AIResult;
  onAddToMap: (text: string) => void;
}

export function AIResultCard({ result, onAddToMap }: AIResultCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.idea}>{result.idea}</Text>
      <Text style={styles.description}>{result.description}</Text>
      <TouchableOpacity
        style={styles.addBtn}
        onPress={() => onAddToMap(result.idea)}
      >
        <Text style={styles.addBtnText}>+ Add to Mind Map</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: theme.colors.ai,
    ...theme.shadows.sm,
  },
  idea: {
    fontSize: theme.fontSize.md,
    fontWeight: '700',
    color: theme.colors.ai,
    marginBottom: theme.spacing.xs,
  },
  description: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    lineHeight: 20,
    marginBottom: theme.spacing.md,
  },
  addBtn: {
    alignSelf: 'flex-start',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    backgroundColor: theme.colors.ai + '15',
    borderRadius: theme.borderRadius.md,
  },
  addBtnText: {
    color: theme.colors.ai,
    fontSize: theme.fontSize.sm,
    fontWeight: '600',
  },
});

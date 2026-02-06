import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from 'react-native';
import { Tab } from '../../models/types';
import { theme } from '../../theme/theme';

interface TabItemProps {
  tab: Tab;
  isActive: boolean;
  onPress: () => void;
  onRename: (title: string) => void;
  onDelete: () => void;
}

export function TabItem({
  tab,
  isActive,
  onPress,
  onRename,
  onDelete,
}: TabItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(tab.title);

  const handleDoublePress = () => {
    setEditText(tab.title);
    setIsEditing(true);
  };

  const handleSubmit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== tab.title) {
      onRename(trimmed);
    }
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <View style={[styles.tab, isActive && styles.activeTab]}>
        <TextInput
          style={styles.input}
          value={editText}
          onChangeText={setEditText}
          onBlur={handleSubmit}
          onSubmitEditing={handleSubmit}
          autoFocus
          selectTextOnFocus
        />
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.tab, isActive && styles.activeTab]}
      onPress={onPress}
      onLongPress={handleDoublePress}
    >
      <Text
        style={[styles.tabText, isActive && styles.activeTabText]}
        numberOfLines={1}
      >
        {tab.title}
      </Text>
      <TouchableOpacity style={styles.closeBtn} onPress={onDelete} hitSlop={8}>
        <Text style={styles.closeText}>×</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.surfaceHover,
    borderRadius: theme.borderRadius.md,
    marginRight: theme.spacing.xs,
    maxWidth: 160,
  },
  activeTab: {
    backgroundColor: theme.colors.surface,
    ...theme.shadows.sm,
  },
  tabText: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  activeTabText: {
    color: theme.colors.text,
    fontWeight: '600',
  },
  closeBtn: {
    marginLeft: theme.spacing.xs,
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    fontSize: 16,
    color: theme.colors.textLight,
    lineHeight: 18,
  },
  input: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.text,
    flex: 1,
    padding: 0,
    minWidth: 60,
  },
});

import React, { useState } from 'react';
import { View, ScrollView, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useMindMapStore } from '../../store/useMindMapStore';
import { TabItem } from './TabItem';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { theme } from '../../theme/theme';

export function TabBar() {
  const tabs = useMindMapStore((s) => s.tabs);
  const activeTabId = useMindMapStore((s) => s.activeTabId);
  const addTab = useMindMapStore((s) => s.addTab);
  const removeTab = useMindMapStore((s) => s.removeTab);
  const renameTab = useMindMapStore((s) => s.renameTab);
  const setActiveTab = useMindMapStore((s) => s.setActiveTab);

  const [deleteTabId, setDeleteTabId] = useState<string | null>(null);

  const handleDelete = () => {
    if (deleteTabId) {
      removeTab(deleteTabId);
      setDeleteTabId(null);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {tabs.map((tab) => (
          <TabItem
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
            onPress={() => setActiveTab(tab.id)}
            onRename={(title) => renameTab(tab.id, title)}
            onDelete={() => {
              if (tabs.length <= 1) return;
              setDeleteTabId(tab.id);
            }}
          />
        ))}
        <TouchableOpacity style={styles.addBtn} onPress={() => addTab()}>
          <Text style={styles.addText}>+</Text>
        </TouchableOpacity>
      </ScrollView>

      <ConfirmDialog
        visible={deleteTabId !== null}
        title="Delete Tab"
        message="Are you sure you want to delete this topic and all its nodes?"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTabId(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm,
  },
  scrollContent: {
    alignItems: 'center',
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surfaceHover,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: theme.spacing.xs,
  },
  addText: {
    fontSize: 20,
    color: theme.colors.textSecondary,
    lineHeight: 22,
  },
});

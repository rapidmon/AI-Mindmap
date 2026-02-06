import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { MindMapNode } from '../../models/types';
import { ColorPicker } from '../common/ColorPicker';
import { theme } from '../../theme/theme';

interface NodeEditorProps {
  visible: boolean;
  node: MindMapNode | null;
  onSave: (text: string, color: string) => void;
  onDelete: () => void;
  onClose: () => void;
  isRoot: boolean;
}

export function NodeEditor({
  visible,
  node,
  onSave,
  onDelete,
  onClose,
  isRoot,
}: NodeEditorProps) {
  const [text, setText] = useState(node?.text || '');
  const [color, setColor] = useState(node?.color || '#4A90D9');

  React.useEffect(() => {
    if (node) {
      setText(node.text);
      setColor(node.color);
    }
  }, [node]);

  const handleSave = () => {
    const trimmed = text.trim();
    if (trimmed) {
      onSave(trimmed, color);
    }
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.editor}>
          <Text style={styles.title}>Edit Node</Text>

          <TextInput
            style={styles.input}
            value={text}
            onChangeText={setText}
            placeholder="Node text..."
            autoFocus
            onSubmitEditing={handleSave}
          />

          <Text style={styles.label}>Color</Text>
          <ColorPicker selectedColor={color} onSelectColor={setColor} />

          <View style={styles.buttons}>
            {!isRoot && (
              <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
                <Text style={styles.deleteText}>Delete</Text>
              </TouchableOpacity>
            )}
            <View style={styles.rightButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editor: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    width: 320,
    ...theme.shadows.lg,
  },
  title: {
    fontSize: theme.fontSize.lg,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.sm,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: theme.fontSize.md,
    color: theme.colors.text,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  rightButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  deleteBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.error,
    borderRadius: theme.borderRadius.md,
  },
  deleteText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
  cancelBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  cancelText: {
    color: theme.colors.textSecondary,
    fontSize: theme.fontSize.md,
  },
  saveBtn: {
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.borderRadius.md,
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: theme.fontSize.md,
    fontWeight: '600',
  },
});

import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../../theme/theme';

interface ColorPickerProps {
  selectedColor: string;
  onSelectColor: (color: string) => void;
}

export function ColorPicker({ selectedColor, onSelectColor }: ColorPickerProps) {
  return (
    <View style={styles.container}>
      {theme.colors.nodeColors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorDot,
            { backgroundColor: color },
            selectedColor === color && styles.selected,
          ]}
          onPress={() => onSelectColor(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
    padding: theme.spacing.sm,
  },
  colorDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selected: {
    borderColor: theme.colors.text,
    borderWidth: 3,
  },
});

import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useMindMapStore } from '../src/store/useMindMapStore';
import { useSettingsStore } from '../src/store/useSettingsStore';

export default function RootLayout() {
  const loadState = useMindMapStore((s) => s.loadState);
  const loadSettings = useSettingsStore((s) => s.loadSettings);

  useEffect(() => {
    loadState();
    loadSettings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: '#F5F7FA' },
          headerTintColor: '#1A1A2E',
        }}
      >
        <Stack.Screen
          name="index"
          options={{ title: 'Mind Map', headerShown: false }}
        />
        <Stack.Screen
          name="settings"
          options={{ title: 'Settings', presentation: 'modal' }}
        />
      </Stack>
    </GestureHandlerRootView>
  );
}

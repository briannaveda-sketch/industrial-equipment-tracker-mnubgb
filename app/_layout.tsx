
import * as SplashScreen from 'expo-splash-screen';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useColorScheme } from 'react-native';
import { useFonts } from 'expo-font';
import '../utils/i18n';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#f0f0f0',
          },
          headerTintColor: '#20639B',
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen 
          name="add-equipment" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="equipment-list" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
          }} 
        />
        <Stack.Screen 
          name="equipment-detail" 
          options={{ 
            presentation: 'modal',
            headerShown: true,
          }} 
        />
      </Stack>
      <StatusBar style="dark" />
    </GestureHandlerRootView>
  );
}

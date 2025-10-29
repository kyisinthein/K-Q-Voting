import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import QuickActionsFloating from '@/components/quick-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="university/[id]" options={{ headerShown: false }} />
        {/* Hide header on Candidate Detail for immersive design */}
        <Stack.Screen name="candidate/[id]" options={{ headerShown: false }} />
        {/* Hide header on Live Results as well */}
        <Stack.Screen name="live-results" options={{ headerShown: false }} />
        {/* User Guide immersive screen */}
        <Stack.Screen name="user-guide" options={{ headerShown: false }} />
        {/* About Us immersive screen */}
        <Stack.Screen name="about" options={{ headerShown: false }} />
        {/* Hide header for the entire admin subtree */}
        <Stack.Screen name="admin" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
      </Stack>
      {/* Floating quick actions on all screens */}
      <QuickActionsFloating />
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

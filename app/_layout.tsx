import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-get-random-values';
import 'react-native-reanimated';
import 'react-native-url-polyfill/auto';

import QuickActionsFloating from '@/components/quick-actions';
import { useColorScheme } from '@/hooks/use-color-scheme';

import * as NavigationBar from 'expo-navigation-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

export const unstable_settings = {
  anchor: '(tabs)',
};

import { LinearGradient } from 'expo-linear-gradient';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setVisibilityAsync('hidden');
      NavigationBar.setBehaviorAsync('overlay-swipe');
      NavigationBar.setButtonStyleAsync('light');
      NavigationBar.setBackgroundColorAsync('#5B3DB5'); // darker bottom of gradient
    }
  }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: 'transparent' }} edges={['top', 'bottom']}>
        <LinearGradient
          colors={['#4e99f5ff', '#7E74F9', '#613bd4ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={{ flex: 1 }}
        >
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
              {/* Sponsors immersive screen */}
              <Stack.Screen name="sponsors" options={{ headerShown: false }} />
              {/* Hide header for the entire admin subtree */}
              <Stack.Screen name="admin" options={{ headerShown: false }} />
              <Stack.Screen name="home" options={{headerShown: false}} />
              {/* Partners immersive screen */}
              <Stack.Screen name="partners" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            {/* Floating quick actions on all screens */}
            <QuickActionsFloating />
            <StatusBar style="light" translucent={false} />
          </ThemeProvider>
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

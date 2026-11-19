import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DarkTheme, NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ConfirmModal } from './src/components/ConfirmModal';
import { useI18n } from './src/modules/language';
import { initNotifications } from './src/modules/productivity';
import { VoiceProvider } from './src/modules/voice/VoiceContext';
import { ChatScreen } from './src/screens/ChatScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { SettingsScreen } from './src/screens/SettingsScreen';
import { ToolsScreen } from './src/screens/ToolsScreen';
import { colors } from './src/theme/colors';

const Tab = createBottomTabNavigator();

const navTheme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.accent },
};

function Tabs() {
  const { t } = useI18n();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('tabHome'), tabBarIcon: ({ color, size }) => <Ionicons name="planet" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ title: t('tabChat'), tabBarIcon: ({ color, size }) => <Ionicons name="chatbubbles" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Tools"
        component={ToolsScreen}
        options={{ title: t('tabTools'), tabBarIcon: ({ color, size }) => <Ionicons name="checkbox" color={color} size={size} /> }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('tabSettings'), tabBarIcon: ({ color, size }) => <Ionicons name="settings" color={color} size={size} /> }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  useEffect(() => {
    initNotifications().catch(() => {});
  }, []);
  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <VoiceProvider>
        <NavigationContainer theme={navTheme}>
          <Tabs />
        </NavigationContainer>
        <ConfirmModal />
      </VoiceProvider>
    </SafeAreaProvider>
  );
}

import { Redirect } from 'expo-router';
import { TopTabs } from 'expo-router/js-top-tabs';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

export default function TabLayout() {
  const { token, ready } = useAuth();

  if (ready && !token) {
    return <Redirect href="/login" />;
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <TopTabs
        screenOptions={{
          tabBarActiveTintColor: colors.accent,
          tabBarInactiveTintColor: colors.muted,
          tabBarPressColor: colors.accentSoft,
          tabBarIndicatorStyle: {
            backgroundColor: colors.accent,
            height: 3,
            borderRadius: 99,
          },
          tabBarLabelStyle: {
            fontWeight: '700',
            fontSize: 14,
            textTransform: 'none',
          },
          tabBarStyle: {
            backgroundColor: colors.bg,
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 1,
            borderBottomColor: colors.line,
          },
        }}
      >
        <TopTabs.Screen name="index" options={{ title: 'Ledger' }} />
        <TopTabs.Screen name="categories" options={{ title: 'Categories' }} />
        <TopTabs.Screen name="profile" options={{ title: 'You' }} />
      </TopTabs>
    </SafeAreaView>
  );
}

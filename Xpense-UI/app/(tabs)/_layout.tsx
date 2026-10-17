import { Redirect } from 'expo-router';
import { TopTabs } from 'expo-router/js-top-tabs';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { readToken } from '@/lib/storage';
import { colors } from '@/lib/theme';

export default function TabLayout() {
  const [gate, setGate] = useState<'loading' | 'in' | 'out'>('loading');

  useEffect(() => {
    let cancelled = false;
    void readToken().then((stored) => {
      if (!cancelled) {
        setGate(stored ? 'in' : 'out');
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (gate === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  if (gate === 'out') {
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
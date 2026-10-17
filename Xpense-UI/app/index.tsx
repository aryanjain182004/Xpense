import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { AuthBackdrop, AuthBrand } from '@/components/auth-layout';
import { Muted } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, shadow, space } from '@/lib/theme';

export default function Index() {
  const { ready, token } = useAuth();

  if (!ready) {
    return (
      <View style={styles.splash}>
        <AuthBackdrop />
        <View style={styles.splashInner}>
          <AuthBrand compact />
          <View style={styles.loaderRing}>
            <ActivityIndicator color={colors.accent} size="large" />
          </View>
          <Muted style={styles.splashText}>Opening your ledger…</Muted>
        </View>
      </View>
    );
  }

  return <Redirect href={token ? '/(tabs)' : '/login'} />;
}

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: space.xl,
  },
  splashInner: {
    alignItems: 'center',
    gap: space.lg,
    maxWidth: 320,
    width: '100%',
  },
  loaderRing: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  splashText: {
    textAlign: 'center',
    fontSize: 15,
  },
});

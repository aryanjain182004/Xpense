import { Redirect, router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { AuthBrand, AuthCard, AuthFeatureList, AuthShell } from '@/components/auth-layout';
import { ErrorText, Muted, PrimaryButton } from '@/components/ui';
import { resolveApiUrl } from '@/lib/api-url';
import { useAuth } from '@/lib/auth';
import { colors, space } from '@/lib/theme';

const apiUrl = resolveApiUrl();

export default function LoginScreen() {
  const { token, acceptToken, handleError } = useAuth();
  const { token: tokenParam } = useLocalSearchParams<{ token?: string }>();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const nextToken = Array.isArray(tokenParam) ? tokenParam[0] : tokenParam;
    if (!nextToken) {
      return;
    }
    setLoading(true);
    acceptToken(nextToken)
      .then(() => router.replace('/(tabs)'))
      .catch((err) => setError(handleError(err)))
      .finally(() => setLoading(false));
  }, [acceptToken, handleError, tokenParam]);

  if (token) {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <AuthShell
      footer={
        <Muted style={styles.footerNote}>
          Sign in once. We only use Google to verify it is really you.
        </Muted>
      }
    >
      <AuthBrand />
      <AuthFeatureList />
      <AuthCard>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Welcome back</Text>
          <Muted style={styles.cardSubtitle}>Pick up your ledger where you left off.</Muted>
        </View>
        <ErrorText message={error} />
        <PrimaryButton
          label="Continue with Google"
          icon="logo-google"
          loading={loading}
          light
          onPress={() => {
            setError(null);
            void Linking.openURL(`${apiUrl}/auth/google`);
          }}
        />
        <View style={styles.dividerRow}>
          <View style={styles.divider} />
          <Text style={styles.dividerLabel}>secure sign-in</Text>
          <View style={styles.divider} />
        </View>
      </AuthCard>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  cardHeader: {
    gap: 6,
  },
  cardTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  cardSubtitle: {
    lineHeight: 22,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.sm,
    marginTop: -4,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: colors.line,
  },
  dividerLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  footerNote: {
    textAlign: 'center',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 300,
  },
});

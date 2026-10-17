import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode } from 'react';
import { ScrollView, StyleSheet, Text, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, radius, shadow, space } from '@/lib/theme';

const FEATURES = [
  { icon: 'wallet-outline' as const, label: 'Every rupee accounted' },
  { icon: 'pie-chart-outline' as const, label: 'See where it goes' },
  { icon: 'leaf-outline' as const, label: 'Spend with intention' },
];

export function AuthBackdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <View style={styles.blobTop} />
      <View style={styles.blobBottom} />
      <View style={styles.ledgerLines}>
        {Array.from({ length: 8 }).map((_, i) => (
          <View key={i} style={styles.ledgerLine} />
        ))}
      </View>
    </View>
  );
}

export function AuthBrand({ compact }: { compact?: boolean }) {
  return (
    <View style={[styles.brandBlock, compact && styles.brandBlockCompact]}>
      <View style={styles.brandRow}>
        <View style={styles.mark}>
          <Text style={styles.markGlyph}>₹</Text>
        </View>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.eyebrow}>BAHI KHATA</Text>
          <Text style={[styles.title, compact && styles.titleCompact]}>Xpense</Text>
        </View>
      </View>
      {!compact ? (
        <Text style={styles.tagline}>
          A quiet ledger for rent, groceries, and the things you did not need.
        </Text>
      ) : null}
    </View>
  );
}

export function AuthFeatureList() {
  return (
    <View style={styles.featureList}>
      {FEATURES.map((item) => (
        <View key={item.label} style={styles.featureRow}>
          <View style={styles.featureIcon}>
            <Ionicons name={item.icon} size={18} color={colors.accent} />
          </View>
          <Text style={styles.featureLabel}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
}

export function AuthShell({
  children,
  footer,
  scroll = true,
  style,
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  style?: ViewStyle;
}) {
  const body = (
    <View style={[styles.inner, style]}>
      {children}
      {footer ? <View style={styles.footer}>{footer}</View> : null}
    </View>
  );

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <AuthBackdrop />
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {body}
        </ScrollView>
      ) : (
        <View style={styles.scrollContent}>{body}</View>
      )}
    </SafeAreaView>
  );
}

export function AuthCard({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: space.lg,
    paddingVertical: space.xl,
    justifyContent: 'center',
  },
  inner: {
    gap: space.lg,
    maxWidth: 440,
    width: '100%',
    alignSelf: 'center',
  },
  blobTop: {
    position: 'absolute',
    top: -120,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: colors.accentSoft,
    opacity: 0.55,
  },
  blobBottom: {
    position: 'absolute',
    bottom: -100,
    left: -60,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#E8DFD0',
    opacity: 0.7,
  },
  ledgerLines: {
    position: 'absolute',
    top: '18%',
    left: space.lg,
    right: space.lg,
    gap: 28,
    opacity: 0.35,
  },
  ledgerLine: {
    height: 1,
    backgroundColor: colors.line,
  },
  brandBlock: {
    gap: space.md,
  },
  brandBlockCompact: {
    alignItems: 'center',
    gap: space.sm,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
  },
  mark: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow,
  },
  markGlyph: {
    color: colors.accentSoft,
    fontSize: 28,
    fontWeight: '700',
    marginTop: -2,
  },
  eyebrow: {
    color: colors.accentMid,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 3,
  },
  title: {
    color: colors.ink,
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.5,
    lineHeight: 46,
  },
  titleCompact: {
    fontSize: 36,
    lineHeight: 40,
    textAlign: 'center',
  },
  tagline: {
    color: colors.muted,
    fontSize: 17,
    lineHeight: 26,
    maxWidth: 340,
  },
  featureList: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureLabel: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: space.lg,
    borderWidth: 1,
    borderColor: colors.line,
    gap: space.md,
    ...shadow,
  },
  footer: {
    alignItems: 'center',
    paddingTop: space.sm,
  },
});

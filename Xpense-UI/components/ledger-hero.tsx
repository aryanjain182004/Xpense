import { ImageBackground, StyleSheet, Text, View } from 'react-native';

import { regretStage } from '@/components/regret-meter';
import { useMobileLayout } from '@/lib/layout';
import { money } from '@/lib/format';
import { colors, radius, shadow, space } from '@/lib/theme';

const heroImage = require('../assets/images/ledger-regret-hero.png');

export function LedgerHero({
  total,
  count,
}: {
  total: number;
  count: number;
}) {
  const { isMobile } = useMobileLayout();
  const stage = regretStage(total);
  const heat =
    stage.level < 0.35 ? colors.accentSoft : stage.level < 0.7 ? '#FCD9C8' : colors.dangerSoft;

  return (
    <View style={styles.shell}>
      <ImageBackground source={heroImage} style={styles.image} imageStyle={styles.imageRadius} resizeMode="cover">
        <View style={styles.scrim} />
        <View style={styles.content}>
          <Text style={styles.eyebrow}>THE DAMAGE SO FAR</Text>
          <Text style={[styles.total, isMobile && styles.totalMobile, { color: heat }]}>{money(total)}</Text>
          <View style={styles.metaRow}>
            <View style={styles.pill}>
              <Text style={styles.pillText}>{stage.label}</Text>
            </View>
            <Text style={styles.meta}>
              {count} {count === 1 ? 'regret' : 'regrets'} logged
            </Text>
          </View>
          <Text style={styles.whisper}>{stage.hint}</Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    ...shadow,
  },
  image: {
    minHeight: 200,
    justifyContent: 'flex-end',
  },
  imageRadius: {
    borderRadius: radius.lg,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 61, 54, 0.62)',
  },
  content: {
    padding: space.lg,
    gap: 6,
  },
  eyebrow: {
    color: 'rgba(255, 252, 247, 0.7)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2.2,
  },
  total: {
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  totalMobile: {
    fontSize: 32,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  pill: {
    backgroundColor: 'rgba(22, 19, 17, 0.45)',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 247, 0.12)',
  },
  pillText: {
    color: colors.paper,
    fontSize: 12,
    fontWeight: '800',
  },
  meta: {
    color: 'rgba(255, 252, 247, 0.75)',
    fontSize: 13,
    fontWeight: '600',
  },
  whisper: {
    color: 'rgba(255, 252, 247, 0.85)',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 4,
    fontStyle: 'italic',
  },
});

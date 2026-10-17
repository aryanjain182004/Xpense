import { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { money } from '@/lib/format';
import { colors, radius, space } from '@/lib/theme';

const MESSAGES = [
  { min: 0, label: 'Still innocent', hint: 'Your wallet is breathing easy.' },
  { min: 500, label: 'Mild sting', hint: 'That could have been lunch at home.' },
  { min: 2000, label: 'Wallet winced', hint: 'Future you is side-eyeing you.' },
  { min: 5000, label: 'Deep regret', hint: 'This one will replay at 2 a.m.' },
  { min: 15000, label: 'Financial heartbreak', hint: 'Your savings just flinched.' },
];

export function regretStage(amount: number) {
  let stage = MESSAGES[0];
  for (const item of MESSAGES) {
    if (amount >= item.min) {
      stage = item;
    }
  }
  const max = 20000;
  const level = Math.min(1, amount / max);
  return { ...stage, level };
}

export function RegretMeter({ amount }: { amount: number }) {
  const parsed = Number(amount);
  const value = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;
  const stage = useMemo(() => regretStage(value), [value]);

  const barColor =
    stage.level < 0.25
      ? colors.accentMid
      : stage.level < 0.5
        ? colors.gold
        : stage.level < 0.75
          ? colors.luxury
          : colors.danger;

  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.label}>Regret meter</Text>
        <Text style={[styles.stage, { color: barColor }]}>{stage.label}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.max(8, stage.level * 100)}%`, backgroundColor: barColor }]} />
      </View>
      <Text style={styles.hint}>{value > 0 ? stage.hint : 'Type an amount to see the damage.'}</Text>
      {value > 0 ? <Text style={styles.amount}>{money(value)} leaving your pocket</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: '#1A1210',
    borderRadius: radius.md,
    padding: space.md,
    gap: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 252, 247, 0.08)',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: 'rgba(255, 252, 247, 0.55)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  stage: {
    fontSize: 13,
    fontWeight: '800',
  },
  track: {
    height: 10,
    borderRadius: 99,
    backgroundColor: 'rgba(255, 252, 247, 0.1)',
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 99,
  },
  hint: {
    color: 'rgba(255, 252, 247, 0.75)',
    fontSize: 14,
    lineHeight: 20,
  },
  amount: {
    color: colors.dangerSoft,
    fontSize: 15,
    fontWeight: '700',
  },
});

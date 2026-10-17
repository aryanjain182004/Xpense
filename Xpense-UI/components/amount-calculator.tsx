import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors, radius, space } from '@/lib/theme';

function sanitizeExpression(raw: string) {
  return raw.replace(/×/g, '*').replace(/÷/g, '/').replace(/\s/g, '');
}

function computeExpression(raw: string): number | null {
  const expr = sanitizeExpression(raw);
  if (!expr || !/^[\d.+\-*/]+$/.test(expr)) {
    return null;
  }
  try {
    const value = Function(`"use strict"; return (${expr})`)() as number;
    if (!Number.isFinite(value)) {
      return null;
    }
    return Math.round(value * 100) / 100;
  } catch {
    return null;
  }
}

function formatAmount(value: number) {
  const rounded = Math.round(value * 100) / 100;
  return String(rounded);
}

type AmountCalculatorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AmountCalculator({ label, value, onChange, placeholder = '0.00' }: AmountCalculatorProps) {
  const [open, setOpen] = useState(false);
  const [expression, setExpression] = useState(value);

  useEffect(() => {
    if (open) {
      setExpression(value);
    }
  }, [open, value]);

  function pressKey(key: string) {
    if (key === 'C') {
      setExpression('');
      return;
    }
    if (key === '⌫') {
      setExpression((current) => current.slice(0, -1));
      return;
    }
    if (key === '=') {
      const result = computeExpression(expression);
      if (result !== null) {
        const next = formatAmount(result);
        setExpression(next);
        onChange(next);
      }
      return;
    }
    if (key === 'Apply') {
      const result = computeExpression(expression);
      const next = result !== null ? formatAmount(result) : expression.trim();
      if (next) {
        onChange(next);
      }
      setOpen(false);
      return;
    }
    setExpression((current) => current + key);
  }

  const keys = [
    ['C', '⌫', '=', '÷'],
    ['7', '8', '9', '×'],
    ['4', '5', '6', '-'],
    ['1', '2', '3', '+'],
    ['0', '.', '00', 'Apply'],
  ];

  return (
    <View style={styles.wrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        <Pressable
          onPress={() => setOpen((current) => !current)}
          style={({ pressed }) => [styles.calcToggle, pressed && styles.pressed]}
          accessibilityRole="button"
          accessibilityLabel={open ? 'Hide calculator' : 'Open calculator'}
        >
          <Ionicons name="calculator-outline" size={16} color={colors.accent} />
          <Text style={styles.calcToggleText}>{open ? 'Hide' : 'Calculator'}</Text>
        </Pressable>
      </View>
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        placeholder={placeholder}
        value={value}
        onChangeText={onChange}
        keyboardType="decimal-pad"
      />
      {open ? (
        <View style={styles.panel}>
          <Text style={styles.expr} numberOfLines={1}>
            {expression || '0'}
          </Text>
          <View style={styles.grid}>
            {keys.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.row}>
                {row.map((key) => {
                  const primary = key === 'Apply';
                  const accent = key === '=' || key === 'C';
                  return (
                    <Pressable
                      key={key}
                      onPress={() => pressKey(key)}
                      style={({ pressed }) => [
                        styles.key,
                        primary && styles.keyPrimary,
                        accent && styles.keyAccent,
                        pressed && styles.pressed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.keyLabel,
                          primary && styles.keyLabelOn,
                          key === 'Apply' && styles.keyApplyLabel,
                        ]}
                      >
                        {key}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  calcToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    backgroundColor: colors.accentSoft,
  },
  calcToggleText: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '700',
  },
  input: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 13,
    fontSize: 16,
    color: colors.ink,
  },
  panel: {
    marginTop: 4,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    padding: space.sm,
    gap: space.sm,
  },
  expr: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'right',
    paddingHorizontal: 4,
  },
  grid: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    gap: 6,
  },
  key: {
    flex: 1,
    minHeight: 44,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
    justifyContent: 'center',
  },
  keyPrimary: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
    flex: 1.2,
  },
  keyAccent: {
    backgroundColor: '#E8DFD0',
  },
  keyLabel: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
  },
  keyLabelOn: {
    color: colors.paper,
  },
  keyApplyLabel: {
    fontSize: 12,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
});

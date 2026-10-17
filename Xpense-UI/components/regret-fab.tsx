import Ionicons from '@expo/vector-icons/Ionicons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { useMobileLayout } from '@/lib/layout';
import { colors, shadow, space } from '@/lib/theme';

export function RegretFab({ onPress }: { onPress: () => void }) {
  const { isMobile, width } = useMobileLayout();
  const showSubtitle = !isMobile || width >= 340;
  return (
    <View style={styles.anchor} pointerEvents="box-none">
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel="Add expense"
      >
        <View style={styles.iconRing}>
          <Ionicons name="add" size={26} color={colors.paper} />
        </View>
        <View style={styles.copy}>
          <Text style={styles.title}>Add expense</Text>
          {showSubtitle ? <Text style={styles.subtitle}>Your wallet is not ready</Text> : null}
        </View>
        <Ionicons name="chevron-forward" size={18} color="rgba(255,252,247,0.65)" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  anchor: {
    position: 'absolute',
    left: space.md,
    right: space.md,
    bottom: space.md,
    alignItems: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 999,
    backgroundColor: '#2A0F14',
    borderWidth: 1,
    borderColor: 'rgba(159, 18, 57, 0.55)',
    maxWidth: 420,
    width: '100%',
    ...shadow,
    shadowColor: colors.danger,
    shadowOpacity: 0.28,
    shadowRadius: 16,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  iconRing: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  title: {
    color: colors.paper,
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  subtitle: {
    color: 'rgba(255, 252, 247, 0.55)',
    fontSize: 12,
    fontWeight: '600',
  },
});

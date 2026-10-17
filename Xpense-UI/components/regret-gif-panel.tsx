import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { RegretMeter } from '@/components/regret-meter';
import { ErrorText } from '@/components/ui';
import { regretGifFor } from '@/lib/regret-gifs';
import { money } from '@/lib/format';
import { colors, radius, shadow, space } from '@/lib/theme';
import type { TransactionType } from '@/lib/types';

export function RegretGifPanel({ type, compact }: { type: TransactionType; compact?: boolean }) {
  const meta = regretGifFor(type);

  return (
    <View style={[styles.panel, compact && styles.panelCompact]}>
      <Image
        key={type}
        source={meta.source}
        style={[styles.gif, compact && styles.gifCompact]}
        resizeMode="cover"
      />
      <View style={styles.scrim} />
      <View style={styles.copy}>
        <Text style={styles.eyebrow}>{type === 'NECESSITY' ? 'NEED' : type === 'MODERATE' ? 'MODERATE' : 'LUXURY'}</Text>
        <Text style={[styles.title, compact && styles.titleCompact]}>{meta.title}</Text>
        {!compact ? <Text style={styles.caption}>{meta.caption}</Text> : null}
      </View>
    </View>
  );
}

export function RegretGifIntro({
  visible,
  type,
  amount,
  confirmLabel = 'Add to the ledger',
  error,
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  type: TransactionType;
  amount: number;
  confirmLabel?: string;
  error?: string | null;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  const meta = regretGifFor(type);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Image key={type} source={meta.source} style={styles.modalGif} resizeMode="contain" />
          <View style={styles.modalBody}>
            <Text style={styles.modalEyebrow}>Still sure?</Text>
            <Text style={styles.modalTitle}>{meta.title}</Text>
            <Text style={styles.modalAmount}>{money(amount)}</Text>
            <Text style={styles.modalCaption}>{meta.caption}</Text>
            <RegretMeter amount={amount} />
            <ErrorText message={error} />
            <View style={styles.modalActions}>
              <Pressable
                onPress={onCancel}
                disabled={loading}
                style={({ pressed }) => [styles.modalSecondary, pressed && styles.pressed, loading && styles.disabled]}
              >
                <Text style={styles.modalSecondaryLabel}>Go back</Text>
              </Pressable>
              <Pressable
                onPress={onConfirm}
                disabled={loading}
                style={({ pressed }) => [styles.modalButton, pressed && styles.pressed, loading && styles.disabled]}
              >
                <Text style={styles.modalButtonLabel}>{loading ? 'Saving…' : confirmLabel}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  panel: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    minHeight: 196,
    justifyContent: 'flex-end',
    backgroundColor: '#1A1210',
    ...shadow,
  },
  panelCompact: {
    minHeight: 160,
  },
  gif: {
    ...StyleSheet.absoluteFill,
    width: '100%',
    height: '100%',
  },
  gifCompact: {
    opacity: 0.92,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(11, 61, 54, 0.35)',
  },
  copy: {
    padding: space.lg,
    gap: 6,
  },
  eyebrow: {
    color: 'rgba(255, 252, 247, 0.6)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 2,
  },
  title: {
    color: colors.paper,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  titleCompact: {
    fontSize: 20,
  },
  caption: {
    color: 'rgba(255, 252, 247, 0.82)',
    fontSize: 14,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 19, 17, 0.72)',
    justifyContent: 'center',
    padding: space.lg,
  },
  modalCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    overflow: 'hidden',
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    ...shadow,
  },
  modalGif: {
    width: '100%',
    height: 220,
    backgroundColor: '#161311',
  },
  modalBody: {
    padding: space.lg,
    gap: 8,
  },
  modalEyebrow: {
    color: colors.danger,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.6,
    textTransform: 'uppercase',
  },
  modalTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  modalAmount: {
    color: colors.danger,
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.8,
  },
  modalCaption: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: space.sm,
  },
  modalSecondary: {
    flex: 1,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    backgroundColor: colors.paper,
  },
  modalSecondaryLabel: {
    color: colors.accentMid,
    fontSize: 15,
    fontWeight: '700',
  },
  modalButton: {
    flex: 1.2,
    backgroundColor: colors.danger,
    borderRadius: radius.sm,
    paddingVertical: 14,
    alignItems: 'center',
  },
  modalButtonLabel: {
    color: colors.paper,
    fontSize: 14,
    fontWeight: '800',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.9,
  },
  disabled: {
    opacity: 0.55,
  },
});

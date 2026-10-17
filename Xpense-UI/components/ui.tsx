import Ionicons from '@expo/vector-icons/Ionicons';
import { ReactNode, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
  type TextProps,
  type TextStyle,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DateCalendar } from '@/components/date-calendar';
import { clampToMaxLocalDay, formatDate, parseIsoDate, startOfLocalDay, toIsoDate } from '@/lib/format';
import { useMobileLayout } from '@/lib/layout';
import { colors, radius, shadow, space } from '@/lib/theme';

export function Screen({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.screen, style]}>{children}</View>;
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function Title({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Muted({
  children,
  style,
  ...props
}: TextProps) {
  return (
    <Text style={[styles.muted, style]} {...props}>
      {children}
    </Text>
  );
}

export function Field({
  label,
  ...props
}: TextInputProps & { label: string }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.muted}
        style={styles.input}
        {...props}
      />
    </View>
  );
}

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Pick a date',
}: {
  label: string;
  value?: string;
  onChange: (value: string | undefined) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const selected = parseIsoDate(value);
  const [draft, setDraft] = useState(selected ?? new Date());

  const maxDay = startOfLocalDay(new Date());

  function openPicker() {
    const initial = selected ?? maxDay;
    setDraft(clampToMaxLocalDay(initial, maxDay));
    setOpen(true);
  }

  function closePicker() {
    setOpen(false);
  }

  function applyDraft() {
    onChange(toIsoDate(clampToMaxLocalDay(draft, maxDay)));
    closePicker();
  }

  const { isMobile, width: windowWidth } = useMobileLayout();
  const insets = useSafeAreaInsets();
  const compact = isMobile;
  const sheetHorizontalPad = space.lg * 2;
  const calendarInnerWidth = compact
    ? windowWidth - sheetHorizontalPad
    : Math.min(400, windowWidth - sheetHorizontalPad) - sheetHorizontalPad;

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={openPicker}
        style={({ pressed }) => [styles.select, pressed && styles.pressed]}
        accessibilityRole="button"
        accessibilityLabel={`${label}, ${value ? formatDate(value) : placeholder}`}
      >
        <Text style={[styles.selectText, !value && styles.selectPlaceholder]} numberOfLines={1}>
          {value ? formatDate(value) : placeholder}
        </Text>
        <Ionicons name="calendar-outline" size={18} color={colors.muted} />
      </Pressable>
      {open ? (
        <Modal visible transparent animationType="slide" onRequestClose={closePicker}>
          <Pressable
            style={[
              styles.backdrop,
              compact && styles.backdropBottom,
            ]}
            onPress={closePicker}
          >
            <Pressable
              style={[
                styles.dateSheet,
                compact && styles.dateSheetBottom,
                compact
                  ? {
                      width: windowWidth,
                      maxWidth: windowWidth,
                      paddingBottom: insets.bottom + space.lg,
                    }
                  : { maxWidth: Math.min(400, windowWidth - space.lg * 2) },
              ]}
              onPress={(event) => event.stopPropagation()}
            >
              <Text style={styles.sheetTitle}>{label}</Text>
              <DateCalendar
                value={draft}
                onChange={(date) => setDraft(clampToMaxLocalDay(date, maxDay))}
                width={calendarInnerWidth}
                maxDate={maxDay}
              />
              <View style={styles.dateSheetActions}>
                {value ? (
                  <Pressable
                    onPress={() => {
                      onChange(undefined);
                      closePicker();
                    }}
                    style={({ pressed }) => [styles.dateClear, pressed && styles.pressed]}
                  >
                    <Text style={styles.dateClearText}>Clear</Text>
                  </Pressable>
                ) : (
                  <View />
                )}
                <Pressable
                  onPress={applyDraft}
                  style={({ pressed }) => [styles.dateDone, pressed && styles.pressed]}
                >
                  <Text style={styles.dateDoneText}>Done</Text>
                </Pressable>
              </View>
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </View>
  );
}

export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Search',
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}) {
  return (
    <View style={styles.searchBar}>
      <Ionicons name="search" size={18} color={colors.muted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.muted}
        style={styles.searchInput}
        autoCapitalize="none"
        autoCorrect={false}
      />
      {value ? (
        <Pressable onPress={() => onChangeText('')} hitSlop={8} accessibilityLabel="Clear search">
          <Ionicons name="close-circle" size={18} color={colors.muted} />
        </Pressable>
      ) : null}
    </View>
  );
}

export function Dropdown<T extends string | number | null>({
  label,
  value,
  options,
  onChange,
  searchable,
  searchPlaceholder = 'Search',
  footerLabel,
  onFooterPress,
}: {
  label: string;
  value: T;
  options: { label: string; value: T }[];
  onChange: (value: T) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  footerLabel?: string;
  onFooterPress?: () => void;
}) {
  const { isMobile, width: windowWidth } = useMobileLayout();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const selected = options.find((option) => option.value === value);

  const visibleOptions = searchable
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  function close() {
    setOpen(false);
    setQuery('');
  }

  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <Pressable onPress={() => setOpen(true)} style={({ pressed }) => [styles.select, pressed && styles.pressed]}>
        <Text style={styles.selectText} numberOfLines={1}>
          {selected?.label ?? 'Select'}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.muted} />
      </Pressable>
      <Modal visible={open} transparent animationType="fade" onRequestClose={close}>
        <Pressable
          style={[styles.backdrop, isMobile && styles.backdropMobile]}
          onPress={close}
        >
          <Pressable
            style={[
              styles.sheet,
              isMobile && {
                width: windowWidth - space.md * 2,
                maxHeight: '85%',
              },
            ]}
            onPress={(event) => event.stopPropagation()}
          >
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              {onFooterPress ? (
                <Pressable
                  onPress={() => {
                    close();
                    onFooterPress();
                  }}
                  style={({ pressed }) => [styles.sheetHeaderAction, pressed && styles.pressed]}
                  accessibilityRole="button"
                  accessibilityLabel={footerLabel ?? 'Add new'}
                  hitSlop={8}
                >
                  <Ionicons name="add-circle-outline" size={26} color={colors.accent} />
                </Pressable>
              ) : null}
            </View>
            {searchable ? (
              <SearchBar
                value={query}
                onChangeText={setQuery}
                placeholder={searchPlaceholder}
              />
            ) : null}
            <ScrollView style={{ maxHeight: 360 }} keyboardShouldPersistTaps="handled">
              {visibleOptions.length === 0 ? (
                <Text style={styles.muted}>No matches.</Text>
              ) : (
                visibleOptions.map((option) => {
                  const active = option.value === value;
                  return (
                    <Pressable
                      key={String(option.value)}
                      onPress={() => {
                        onChange(option.value);
                        close();
                      }}
                      style={[styles.option, active && styles.optionOn]}
                    >
                      <Text style={[styles.optionLabel, active && styles.optionLabelOn]}>{option.label}</Text>
                      {active ? <Ionicons name="checkmark" size={18} color={colors.accent} /> : null}
                    </Pressable>
                  );
                })
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
  loading,
  light,
  icon,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  light?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}) {
  const iconColor = light ? colors.accent : colors.paper;

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.primary,
        light && styles.primaryLight,
        icon && styles.primaryWithIcon,
        (disabled || loading) && styles.disabled,
        pressed && styles.pressed,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <View style={styles.primaryContent}>
          {icon ? <Ionicons name={icon} size={20} color={iconColor} /> : null}
          <Text style={[styles.primaryLabel, light && styles.primaryLabelLight]}>{label}</Text>
        </View>
      )}
    </Pressable>
  );
}

export function GhostButton({
  label,
  onPress,
  danger,
}: {
  label: string;
  onPress: () => void;
  danger?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.ghost,
        danger && styles.ghostDanger,
        pressed && styles.pressed,
      ]}
    >
      <Text style={[styles.ghostLabel, danger && styles.ghostLabelDanger]}>{label}</Text>
    </Pressable>
  );
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  loading,
  onCancel,
  onConfirm,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <Text style={styles.sheetTitle}>{title}</Text>
          <Text style={styles.muted}>{message}</Text>
          <View style={{ flexDirection: 'row', gap: 10, marginTop: space.md }}>
            <Pressable onPress={onCancel} style={[styles.ghost, { flex: 1 }]}>
              <Text style={styles.ghostLabel}>Cancel</Text>
            </Pressable>
            <Pressable
              onPress={onConfirm}
              disabled={loading}
              style={[styles.primary, styles.dangerFill, { flex: 1 }, loading && styles.disabled]}
            >
              {loading ? (
                <ActivityIndicator color={colors.paper} />
              ) : (
                <Text style={styles.primaryLabel}>{confirmLabel}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

export function ErrorText({ message }: { message?: string | null }) {
  if (!message) {
    return null;
  }
  return <Text style={styles.error}>{message}</Text>;
}

export function TypeBadge({ label, color }: { label: string; color: string }) {
  return (
    <View style={[styles.badge, { backgroundColor: `${color}18` }]}>
      <View style={[styles.badgeDot, { backgroundColor: color }]} />
      <Text style={[styles.badgeLabel, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
    padding: space.md,
  },
  card: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: space.md,
    borderWidth: 1,
    borderColor: colors.line,
    ...shadow,
  },
  title: {
    color: colors.ink,
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
  },
  muted: {
    color: colors.muted,
    fontSize: 15,
    lineHeight: 22,
  },
  field: {
    gap: 6,
    flex: 1,
  },
  label: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
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
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 10,
    marginBottom: space.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    paddingVertical: 0,
  },
  select: {
    backgroundColor: colors.bg,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    paddingHorizontal: space.md,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  selectText: {
    flex: 1,
    fontSize: 16,
    color: colors.ink,
    fontWeight: '600',
  },
  selectPlaceholder: {
    color: colors.muted,
    fontWeight: '400',
  },
  dateSheet: {
    backgroundColor: colors.paper,
    borderRadius: radius.lg,
    padding: space.lg,
    width: '100%',
    maxWidth: 400,
    ...shadow,
  },
  backdropBottom: {
    justifyContent: 'flex-end',
    padding: 0,
  },
  dateSheetBottom: {
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0,
    borderTopLeftRadius: radius.lg,
    borderTopRightRadius: radius.lg,
  },
  dateSheetActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: space.sm,
    gap: space.sm,
  },
  dateClear: {
    paddingVertical: 10,
    paddingHorizontal: space.md,
  },
  dateClearText: {
    color: colors.muted,
    fontSize: 16,
    fontWeight: '600',
  },
  dateDone: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: space.lg,
    marginLeft: 'auto',
  },
  dateDoneText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(22, 19, 17, 0.45)',
    justifyContent: 'center',
    padding: space.lg,
  },
  backdropMobile: {
    justifyContent: 'flex-end',
    paddingHorizontal: space.md,
    paddingBottom: space.md,
  },
  sheet: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    padding: space.md,
    maxHeight: '80%',
    ...shadow,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.sm,
    marginBottom: space.sm,
  },
  sheetTitle: {
    flex: 1,
    color: colors.ink,
    fontSize: 18,
    fontWeight: '700',
  },
  sheetHeaderAction: {
    padding: 2,
  },
  option: {
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: radius.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  optionOn: {
    backgroundColor: colors.accentSoft,
  },
  optionLabel: {
    color: colors.ink,
    fontSize: 16,
  },
  optionLabelOn: {
    fontWeight: '700',
    color: colors.accent,
  },
  primary: {
    backgroundColor: colors.accent,
    borderRadius: radius.sm,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryWithIcon: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  primaryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryLabel: {
    color: colors.paper,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  primaryLight: {
    backgroundColor: colors.paper,
  },
  primaryLabelLight: {
    color: colors.accent,
  },
  ghost: {
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.sm,
    backgroundColor: colors.paper,
  },
  ghostLabel: {
    color: colors.accentMid,
    fontSize: 16,
    fontWeight: '600',
  },
  ghostDanger: {
    borderColor: colors.danger,
    backgroundColor: colors.dangerSoft,
  },
  ghostLabelDanger: {
    color: colors.danger,
  },
  dangerFill: {
    backgroundColor: colors.danger,
  },
  error: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.86,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});

import Ionicons from '@expo/vector-icons/Ionicons';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';

import { isAfterLocalDay, startOfLocalDay } from '@/lib/format';
import { colors, radius, space } from '@/lib/theme';

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

function monthLabel(date: Date) {
  return new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(date);
}

const YEAR_PAST = 30;
const YEAR_COLUMNS = 4;
const MONTH_COLUMNS = 3;

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, month) => ({
  month,
  short: new Intl.DateTimeFormat('en-IN', { month: 'short' }).format(new Date(2024, month, 1)),
  long: new Intl.DateTimeFormat('en-IN', { month: 'long' }).format(new Date(2024, month, 1)),
}));

type CalendarPanel = 'days' | 'months' | 'years';

function monthStart(year: number, month: number) {
  return new Date(year, month, 1).getTime();
}

export function DateCalendar({
  value,
  onChange,
  width: widthProp,
  maxDate,
}: {
  value: Date;
  onChange: (date: Date) => void;
  /** Inner grid width; defaults from window minus modal padding */
  width?: number;
  /** Latest selectable day; defaults to today */
  maxDate?: Date;
}) {
  const { width: windowWidth } = useWindowDimensions();
  const [measuredWidth, setMeasuredWidth] = useState(0);

  const gridWidth =
    widthProp ??
    (measuredWidth > 0 ? measuredWidth : Math.min(360, Math.max(280, windowWidth - space.lg * 4)));
  const cellSize = Math.max(32, Math.floor(gridWidth / 7));

  const maxDay = useMemo(() => startOfLocalDay(maxDate ?? new Date()), [maxDate]);

  const [viewMonth, setViewMonth] = useState(() => {
    const capped = isAfterLocalDay(value, maxDay) ? maxDay : value;
    return new Date(capped.getFullYear(), capped.getMonth(), 1);
  });
  const [panel, setPanel] = useState<CalendarPanel>('days');

  const years = useMemo(() => {
    const anchor = maxDay.getFullYear();
    const list: number[] = [];
    for (let year = anchor; year >= anchor - YEAR_PAST; year -= 1) {
      list.push(year);
    }
    return list;
  }, [maxDay]);

  const cells = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();
    const firstWeekday = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    const items: { key: string; day: number | null }[] = [];

    for (let i = 0; i < firstWeekday; i += 1) {
      items.push({ key: `pad-${i}`, day: null });
    }
    for (let day = 1; day <= totalDays; day += 1) {
      items.push({ key: `${year}-${month}-${day}`, day });
    }
    while (items.length % 7 !== 0) {
      items.push({ key: `tail-${items.length}`, day: null });
    }
    return items;
  }, [viewMonth]);

  const weeks = useMemo(() => {
    const rows: { key: string; day: number | null }[][] = [];
    for (let index = 0; index < cells.length; index += 7) {
      rows.push(cells.slice(index, index + 7));
    }
    return rows;
  }, [cells]);

  function shiftMonth(delta: number) {
    setViewMonth((current) => {
      const next = new Date(current.getFullYear(), current.getMonth() + delta, 1);
      if (delta > 0 && monthStart(next.getFullYear(), next.getMonth()) > monthStart(maxDay.getFullYear(), maxDay.getMonth())) {
        return current;
      }
      return next;
    });
  }

  function shiftYear(delta: number) {
    setViewMonth((current) => {
      const nextYear = current.getFullYear() + delta;
      if (delta > 0 && nextYear > maxDay.getFullYear()) {
        return current;
      }
      let month = current.getMonth();
      if (nextYear === maxDay.getFullYear() && month > maxDay.getMonth()) {
        month = maxDay.getMonth();
      }
      return new Date(nextYear, month, 1);
    });
  }

  function isMonthDisabled(month: number, year: number) {
    if (year > maxDay.getFullYear()) {
      return true;
    }
    return year === maxDay.getFullYear() && month > maxDay.getMonth();
  }

  function isYearDisabled(year: number) {
    return year > maxDay.getFullYear();
  }

  function selectYear(year: number) {
    if (isYearDisabled(year)) {
      return;
    }
    setViewMonth((current) => {
      let month = current.getMonth();
      if (year === maxDay.getFullYear() && month > maxDay.getMonth()) {
        month = maxDay.getMonth();
      }
      return new Date(year, month, 1);
    });
    setPanel('days');
  }

  function selectMonth(month: number) {
    if (isMonthDisabled(month, viewYear)) {
      return;
    }
    setViewMonth((current) => new Date(current.getFullYear(), month, 1));
    setPanel('days');
  }

  function toggleMonthPanel() {
    setPanel((current) => (current === 'months' ? 'days' : 'months'));
  }

  function toggleYearPanel() {
    setPanel((current) => (current === 'years' ? 'days' : 'years'));
  }

  function selectDay(day: number) {
    const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day);
    if (isAfterLocalDay(date, maxDay)) {
      return;
    }
    onChange(date);
  }

  const today = startOfLocalDay(new Date());
  const viewYear = viewMonth.getFullYear();
  const viewMonthIndex = viewMonth.getMonth();
  const maxMonthStart = monthStart(maxDay.getFullYear(), maxDay.getMonth());
  const canGoNextMonth =
    monthStart(viewYear, viewMonthIndex + 1) <= maxMonthStart;
  const canGoNextYear = viewYear < maxDay.getFullYear();
  const calendarWidth = cellSize * 7;
  const yearCellWidth = Math.floor(calendarWidth / YEAR_COLUMNS);
  const monthCellWidth = Math.floor(calendarWidth / MONTH_COLUMNS);
  const showDayNav = panel === 'days';

  return (
    <View
      style={styles.root}
      onLayout={(event) => {
        const next = event.nativeEvent.layout.width;
        if (next > 0 && Math.abs(next - measuredWidth) > 1) {
          setMeasuredWidth(next);
        }
      }}
    >
      <View style={styles.header}>
        <View style={styles.navGroup}>
          <Pressable
            onPress={() => shiftYear(-1)}
            style={({ pressed }) => [styles.nav, pressed && styles.pressed]}
            accessibilityLabel="Previous year"
            hitSlop={6}
          >
            <Ionicons name="play-skip-back" size={16} color={colors.muted} />
          </Pressable>
          {showDayNav ? (
            <Pressable
              onPress={() => shiftMonth(-1)}
              style={({ pressed }) => [styles.nav, pressed && styles.pressed]}
              accessibilityLabel="Previous month"
              hitSlop={6}
            >
              <Ionicons name="chevron-back" size={22} color={colors.ink} />
            </Pressable>
          ) : null}
        </View>
        <View style={styles.titlePress}>
          <Text style={styles.titleLine} numberOfLines={1}>
            <Text
              onPress={toggleMonthPanel}
              style={panel === 'months' ? styles.titlePartActive : undefined}
              accessibilityRole="button"
              accessibilityLabel={
                panel === 'months'
                  ? 'Back to calendar'
                  : `${monthLabel(viewMonth)}, open month picker`
              }
            >
              {monthLabel(viewMonth)}
            </Text>
            <Text style={styles.titleGap}> </Text>
            <Text
              onPress={toggleYearPanel}
              style={panel === 'years' ? styles.titlePartActive : undefined}
              accessibilityRole="button"
              accessibilityLabel={
                panel === 'years' ? 'Back to calendar' : `${viewYear}, open year picker`
              }
            >
              {viewYear}
            </Text>
          </Text>
        </View>
        <View style={styles.navGroup}>
          {showDayNav ? (
            <Pressable
              onPress={() => shiftMonth(1)}
              disabled={!canGoNextMonth}
              style={({ pressed }) => [
                styles.nav,
                !canGoNextMonth && styles.navDisabled,
                pressed && canGoNextMonth && styles.pressed,
              ]}
              accessibilityLabel="Next month"
              hitSlop={6}
            >
              <Ionicons name="chevron-forward" size={22} color={canGoNextMonth ? colors.ink : colors.line} />
            </Pressable>
          ) : null}
          <Pressable
            onPress={() => shiftYear(1)}
            disabled={!canGoNextYear}
            style={({ pressed }) => [
              styles.nav,
              !canGoNextYear && styles.navDisabled,
              pressed && canGoNextYear && styles.pressed,
            ]}
            accessibilityLabel="Next year"
            hitSlop={6}
          >
            <Ionicons
              name="play-skip-forward"
              size={16}
              color={canGoNextYear ? colors.muted : colors.line}
            />
          </Pressable>
        </View>
      </View>

      {panel === 'months' ? (
        <View style={[styles.pickerGrid, { width: calendarWidth, alignSelf: 'center' }]}>
          {Array.from({ length: 4 }, (_, rowIndex) => (
            <View key={`month-row-${rowIndex}`} style={styles.weekRow}>
              {MONTH_OPTIONS.slice(rowIndex * MONTH_COLUMNS, rowIndex * MONTH_COLUMNS + MONTH_COLUMNS).map(
                (item) => {
                  const selected = item.month === viewMonthIndex;
                  const isThisMonth =
                    item.month === today.getMonth() && viewYear === today.getFullYear();
                  const disabled = isMonthDisabled(item.month, viewYear);
                  return (
                    <Pressable
                      key={item.month}
                      onPress={() => selectMonth(item.month)}
                      disabled={disabled}
                      style={({ pressed }) => [
                        styles.pickerCell,
                        { width: monthCellWidth, minHeight: Math.max(44, cellSize) },
                        selected && styles.daySelected,
                        isThisMonth && !selected && !disabled && styles.dayToday,
                        disabled && styles.dayDisabled,
                        pressed && !disabled && styles.pressed,
                      ]}
                      accessibilityLabel={item.long}
                      accessibilityState={{ selected, disabled }}
                    >
                      <Text
                        style={[
                          styles.pickerCellText,
                          selected && styles.dayTextSelected,
                          disabled && styles.dayTextDisabled,
                        ]}
                      >
                        {item.short}
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>
          ))}
        </View>
      ) : null}

      {panel === 'years' ? (
        <ScrollView
          style={[styles.yearScroll, { width: calendarWidth, alignSelf: 'center' }]}
          contentContainerStyle={styles.yearGrid}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator
        >
          {years.map((year) => {
            const selected = year === viewYear;
            const isThisYear = year === today.getFullYear();
            const disabled = isYearDisabled(year);
            return (
              <Pressable
                key={year}
                onPress={() => selectYear(year)}
                disabled={disabled}
                style={({ pressed }) => [
                  styles.pickerCell,
                  { width: yearCellWidth, minHeight: Math.max(40, cellSize - 4) },
                  selected && styles.daySelected,
                  isThisYear && !selected && !disabled && styles.dayToday,
                  disabled && styles.dayDisabled,
                  pressed && !disabled && styles.pressed,
                ]}
                accessibilityLabel={String(year)}
                accessibilityState={{ selected, disabled }}
              >
                <Text
                  style={[
                    styles.pickerCellText,
                    selected && styles.dayTextSelected,
                    disabled && styles.dayTextDisabled,
                  ]}
                >
                  {year}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : null}

      {panel === 'days' ? (
        <>
          <View style={[styles.weekRow, { width: calendarWidth, alignSelf: 'center' }]}>
            {WEEKDAY_LABELS.map((label) => (
              <View key={label} style={{ width: cellSize, alignItems: 'center' }}>
                <Text style={styles.weekday}>{label}</Text>
              </View>
            ))}
          </View>
          <View style={[styles.grid, { width: calendarWidth, alignSelf: 'center' }]}>
            {weeks.map((week, rowIndex) => (
              <View key={`week-${rowIndex}`} style={styles.weekRow}>
                {week.map((cell) => {
                  if (cell.day === null) {
                    return <View key={cell.key} style={{ width: cellSize, height: cellSize }} />;
                  }
                  const date = new Date(viewMonth.getFullYear(), viewMonth.getMonth(), cell.day);
                  const selected = sameDay(date, value);
                  const isToday = sameDay(date, today);
                  const disabled = isAfterLocalDay(date, maxDay);
                  return (
                    <Pressable
                      key={cell.key}
                      onPress={() => selectDay(cell.day!)}
                      disabled={disabled}
                      style={({ pressed }) => [
                        styles.day,
                        { width: cellSize, height: cellSize },
                        selected && !disabled && styles.daySelected,
                        isToday && !selected && !disabled && styles.dayToday,
                        disabled && styles.dayDisabled,
                        pressed && !disabled && styles.pressed,
                      ]}
                      accessibilityLabel={date.toDateString()}
                      accessibilityState={{ selected, disabled }}
                    >
                      <Text
                        style={[
                          styles.dayText,
                          selected && !disabled && styles.dayTextSelected,
                          disabled && styles.dayTextDisabled,
                        ]}
                      >
                        {cell.day}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    gap: space.sm,
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: space.xs,
  },
  navGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nav: {
    padding: 6,
    borderRadius: radius.sm,
  },
  navDisabled: {
    opacity: 0.45,
  },
  titlePress: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  titleLine: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '700',
    color: colors.ink,
  },
  titleGap: {
    fontWeight: '400',
  },
  titlePartActive: {
    color: colors.accent,
  },
  pickerGrid: {
    gap: 4,
  },
  yearScroll: {
    maxHeight: 280,
  },
  yearGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
  },
  pickerCell: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: radius.sm,
    paddingVertical: 6,
  },
  pickerCellText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  weekRow: {
    flexDirection: 'row',
  },
  weekday: {
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '700',
    color: colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.2,
  },
  grid: {
    gap: 2,
  },
  day: {
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dayToday: {
    borderWidth: 1,
    borderColor: colors.line,
  },
  daySelected: {
    backgroundColor: colors.accent,
  },
  dayDisabled: {
    opacity: 0.35,
  },
  dayTextDisabled: {
    color: colors.muted,
  },
  dayText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.ink,
  },
  dayTextSelected: {
    color: '#fff',
  },
});

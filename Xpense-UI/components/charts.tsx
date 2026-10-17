import { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { useMobileLayout } from '@/lib/layout';

import { buildTypePieSlices, PieChart } from '@/components/pie-chart';
import { Card, Muted } from '@/components/ui';
import { money, typeColor } from '@/lib/format';
import type { TransactionType } from '@/lib/types';
import { colors, space } from '@/lib/theme';
import { TRANSACTION_TYPES, type Transaction } from '@/lib/types';

type ActiveSegment = { categoryId: number; type: TransactionType };

export function SearchCharts({ items }: { items: Transaction[] }) {
  const { isMobile } = useMobileLayout();
  const [activeSegment, setActiveSegment] = useState<ActiveSegment | null>(null);

  function toggleSegment(categoryId: number, type: TransactionType) {
    setActiveSegment((current) =>
      current?.categoryId === categoryId && current.type === type ? null : { categoryId, type }
    );
  }

  useEffect(() => {
    if (!activeSegment) {
      return;
    }
    const timer = setTimeout(() => setActiveSegment(null), 3000);
    return () => clearTimeout(timer);
  }, [activeSegment]);

  const byType = TRANSACTION_TYPES.map((type) => ({
    ...type,
    amount: items
      .filter((item) => item.type === type.value)
      .reduce((sum, item) => sum + Number(item.amount), 0),
  }));
  const byCategory = Object.values(
    items.reduce<
      Record<
        string,
        {
          categoryId: number;
          name: string;
          total: number;
          byType: Record<TransactionType, number>;
        }
      >
    >((acc, item) => {
      const key = String(item.categoryId);
      const row = acc[key] ?? {
        categoryId: item.categoryId,
        name: item.categoryName,
        total: 0,
        byType: { NECESSITY: 0, MODERATE: 0, LUXURY: 0 },
      };
      const amount = Number(item.amount);
      row.total += amount;
      row.byType[item.type] += amount;
      acc[key] = row;
      return acc;
    }, {})
  )
    .sort((a, b) => b.total - a.total)
    .slice(0, 6);

  const maxCategory = Math.max(...byCategory.map((item) => item.total), 1);

  if (items.length === 0) {
    return (
      <Card>
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>Spending charts</Text>
        <Muted style={{ marginTop: 6 }}>Add expenses to see pie and bar breakdowns.</Muted>
      </Card>
    );
  }

  const typePie = buildTypePieSlices(byType);

  return (
    <View style={{ gap: space.sm }}>
      <Card>
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>Pie · by spend type</Text>
        <Muted style={{ marginBottom: space.md }}>Need vs moderate vs luxury</Muted>
        <PieChart slices={typePie} size={isMobile ? 136 : 168} stacked={isMobile} />
      </Card>

      <Card>
        <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '800', marginBottom: 4 }}>Bar · by category</Text>
        <Muted style={{ marginBottom: space.sm }}>
          One bar per category, split by type. Tap a colored part to see that type only.
        </Muted>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: space.md }}>
          {TRANSACTION_TYPES.map((type) => (
            <View key={type.value} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <View
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: 3,
                  backgroundColor: typeColor(type.value),
                }}
              />
              <Text style={{ color: colors.muted, fontSize: 12, fontWeight: '600' }}>{type.label}</Text>
            </View>
          ))}
        </View>
        <View style={{ gap: 12, overflow: 'visible' }}>
          {byCategory.map((item) => {
            const barWidth = Math.max(6, (item.total / maxCategory) * 100);
            const rowActive = activeSegment?.categoryId === item.categoryId;
            const activeType = rowActive
              ? TRANSACTION_TYPES.find((t) => t.value === activeSegment?.type)
              : null;
            const activeAmount = activeType ? item.byType[activeType.value] : 0;
            const activePct =
              activeType && item.total > 0 ? Math.round((activeAmount / item.total) * 100) : 0;

            let segmentStart = 0;
            if (activeType) {
              for (const type of TRANSACTION_TYPES) {
                if (type.value === activeType.value) {
                  break;
                }
                segmentStart += (item.byType[type.value] / item.total) * 100;
              }
            }
            const segmentShare = activeType && item.total > 0 ? (activeAmount / item.total) * 100 : 0;
            const calloutLeft = ((segmentStart + segmentShare / 2) * barWidth) / 100;

            return (
              <View
                key={item.categoryId}
                style={{ overflow: 'visible', zIndex: rowActive ? 20 : 0 }}
              >
                <View style={{ position: 'relative', overflow: 'visible' }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 8 }}>
                    <Text style={{ color: colors.ink, fontWeight: '600', flex: 1 }} numberOfLines={1}>
                      {item.name}
                    </Text>
                    <Text style={{ color: colors.muted, fontWeight: '700' }}>{money(item.total)}</Text>
                  </View>
                  <View style={{ position: 'relative', height: 14, marginTop: 6 }}>
                  <View
                    pointerEvents="none"
                    style={{
                      position: 'absolute',
                      left: 0,
                      top: 0,
                      width: '100%',
                      height: 14,
                      backgroundColor: colors.bg,
                      borderRadius: 99,
                    }}
                  />
                  <View style={{ flexDirection: 'row', width: `${barWidth}%`, minWidth: 8, height: 14 }}>
                    {TRANSACTION_TYPES.map((type) => {
                      const segment = item.byType[type.value];
                      if (segment <= 0) {
                        return null;
                      }
                      const share = (segment / item.total) * 100;
                      const selected =
                        activeSegment?.categoryId === item.categoryId && activeSegment.type === type.value;
                      return (
                        <Pressable
                          key={type.value}
                          onPress={() => toggleSegment(item.categoryId, type.value)}
                          style={({ pressed }) => [
                            { width: `${share}%`, height: 14 },
                            pressed && { opacity: 0.88 },
                          ]}
                        >
                          <View
                            style={{
                              flex: 1,
                              height: 14,
                              backgroundColor: typeColor(type.value),
                              opacity: selected ? 1 : 0.9,
                              borderWidth: selected ? 2 : 0,
                              borderColor: colors.ink,
                            }}
                          />
                        </Pressable>
                      );
                    })}
                  </View>
                  </View>
                  {rowActive && activeType ? (
                    <View
                      pointerEvents="none"
                      style={{
                        position: 'absolute',
                        left: `${calloutLeft}%`,
                        bottom: 20,
                        width: 112,
                        marginLeft: -56,
                        zIndex: 30,
                      }}
                    >
                      <View
                        style={{
                          backgroundColor: colors.paper,
                          borderWidth: 1,
                          borderColor: colors.line,
                          borderRadius: 8,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          shadowColor: '#1C1917',
                          shadowOpacity: 0.12,
                          shadowRadius: 8,
                          shadowOffset: { width: 0, height: 2 },
                          elevation: 4,
                        }}
                      >
                        <Text
                          style={{
                            color: typeColor(activeType.value),
                            fontSize: 10,
                            fontWeight: '800',
                            textAlign: 'center',
                          }}
                          numberOfLines={2}
                        >
                          {`${activeType.label}\n${activePct}% · ${money(activeAmount)}`}
                        </Text>
                      </View>
                    </View>
                  ) : null}
                </View>
              </View>
            );
          })}
        </View>
      </Card>
    </View>
  );
}

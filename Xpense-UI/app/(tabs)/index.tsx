import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';

import { SearchCharts } from '@/components/charts';
import { LedgerHero } from '@/components/ledger-hero';
import { RegretFab } from '@/components/regret-fab';
import { Card, DateField, Dropdown, ErrorText, Field, Muted, SearchBar, TypeBadge } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { formatDate, money, typeColor, typeLabel, typeRowAccent } from '@/lib/format';
import { useMobileLayout } from '@/lib/layout';
import { colors, shadow, space } from '@/lib/theme';
import { TRANSACTION_TYPES, type Category, type Transaction, type TransactionFilters } from '@/lib/types';

export default function LedgerScreen() {
  const { isMobile } = useMobileLayout();
  const filterRowStyle = useMemo(
    () => ({ flexDirection: isMobile ? 'column' : 'row', gap: space.sm } as const),
    [isMobile]
  );
  const { token, handleError } = useAuth();
  const [items, setItems] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [ledgerStats, setLedgerStats] = useState({ count: 0, total: 0 });

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      const hasActiveFilters = Boolean(
        filters.type ||
          filters.categoryId ||
          filters.fromDate ||
          filters.toDate ||
          filters.minAmount ||
          filters.maxAmount
      );
      let nextItems: Transaction[];
      let allItems: Transaction[];
      let nextCategories: Category[];

      if (hasActiveFilters) {
        [nextItems, allItems, nextCategories] = await Promise.all([
          api.transactions(token, filters),
          api.transactions(token, {}),
          api.categories(token),
        ]);
      } else {
        [nextItems, nextCategories] = await Promise.all([
          api.transactions(token, {}),
          api.categories(token),
        ]);
        allItems = nextItems;
      }

      setCategories(nextCategories);
      setItems(nextItems);
      setLedgerStats({
        count: allItems.length,
        total: allItems.reduce((sum, item) => sum + Number(item.amount), 0),
      });
      setError(null);
    } catch (err) {
      setError(handleError(err));
    }
  }, [filters, handleError, token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const hasFilters = Boolean(
    filters.type || filters.categoryId || filters.fromDate || filters.toDate || filters.minAmount || filters.maxAmount
  );

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter((item) => {
      const haystack = `${item.description} ${item.categoryName} ${item.amount} ${typeLabel(item.type)}`.toLowerCase();
      return haystack.includes(query);
    });
  }, [items, searchQuery]);

  function confirmDelete(item: Transaction) {
    Alert.alert('Delete transaction?', item.description, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          if (!token) {
            return;
          }
          try {
            await api.deleteTransaction(token, item.transactionId);
            await load();
          } catch (err) {
            setError(handleError(err));
          }
        },
      },
    ]);
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={visibleItems}
        extraData={`${ledgerStats.count}-${ledgerStats.total}-${items.length}`}
        keyExtractor={(item) => String(item.transactionId)}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            tintColor={colors.accent}
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await load();
              setRefreshing(false);
            }}
          />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <LedgerHero total={ledgerStats.total} count={ledgerStats.count} />

            <Pressable
              onPress={() => setFiltersOpen((open) => !open)}
              style={({ pressed }) => [styles.filterToggle, pressed && styles.pressed]}
            >
              <View style={styles.filterToggleLeft}>
                <Ionicons name="options-outline" size={18} color={colors.accent} />
                <Text style={styles.filterToggleLabel}>
                  {filtersOpen ? 'Hide filters' : 'Tune this view'}
                </Text>
              </View>
              {hasFilters ? (
                <View style={styles.filterDot}>
                  <Text style={styles.filterDotText}>On</Text>
                </View>
              ) : (
                <Ionicons
                  name={filtersOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.muted}
                />
              )}
            </Pressable>

            {filtersOpen ? (
              <Card>
                <View style={styles.filterHeader}>
                  <Text style={styles.sectionTitle}>Filters</Text>
                  {hasFilters ? (
                    <Pressable onPress={() => setFilters({})}>
                      <Text style={styles.clearFilters}>Clear</Text>
                    </Pressable>
                  ) : null}
                </View>
                <View style={{ gap: space.sm }}>
                  <View style={filterRowStyle}>
                    <Dropdown
                      label="Type"
                      value={filters.type ?? null}
                      options={[
                        { label: 'All types', value: null },
                        ...TRANSACTION_TYPES.map((item) => ({ label: item.label, value: item.value })),
                      ]}
                      onChange={(type) => setFilters((current) => ({ ...current, type: type ?? undefined }))}
                    />
                  <Dropdown
                    label="Category"
                    value={filters.categoryId ?? null}
                    searchable
                    searchPlaceholder="Search categories"
                    options={[
                      { label: 'All categories', value: null },
                      ...categories.map((item) => ({ label: item.categoryName, value: item.categoryId })),
                    ]}
                    onChange={(categoryId) =>
                      setFilters((current) => ({ ...current, categoryId: categoryId ?? undefined }))
                    }
                  />
                  </View>
                  <View style={filterRowStyle}>
                    <DateField
                      label="From"
                      value={filters.fromDate}
                      onChange={(fromDate) => setFilters((current) => ({ ...current, fromDate }))}
                    />
                    <DateField
                      label="To"
                      value={filters.toDate}
                      onChange={(toDate) => setFilters((current) => ({ ...current, toDate }))}
                    />
                  </View>
                  <View style={filterRowStyle}>
                    <Field
                      label="Min"
                      placeholder="0.00"
                      value={filters.minAmount ?? ''}
                      onChangeText={(minAmount) => setFilters((current) => ({ ...current, minAmount }))}
                      keyboardType="decimal-pad"
                    />
                    <Field
                      label="Max"
                      placeholder="0.00"
                      value={filters.maxAmount ?? ''}
                      onChangeText={(maxAmount) => setFilters((current) => ({ ...current, maxAmount }))}
                      keyboardType="decimal-pad"
                    />
                  </View>
                </View>
              </Card>
            ) : null}

            <SearchCharts items={items} />
            <ErrorText message={error} />
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search expenses, categories, amounts…"
            />
            <Text style={styles.sectionTitle}>Recent regrets</Text>
          </View>
        }
        ListEmptyComponent={
          <Card style={styles.emptyCard}>
            <Ionicons name="cloudy-night-outline" size={28} color={colors.muted} />
            <Text style={styles.emptyTitle}>
              {searchQuery.trim() ? 'No matching expenses' : 'No expenses yet'}
            </Text>
            <Muted style={styles.emptyCopy}>
              {searchQuery.trim()
                ? 'Try another search or clear the bar above.'
                : 'The ledger is peaceful for now. Tap the button below when you are ready to confess a purchase.'}
            </Muted>
          </Card>
        }
        renderItem={({ item }) => {
          const accent = typeRowAccent(item.type);
          const bigSpend = Number(item.amount) >= 3000;
          return (
            <Pressable
              onPress={() =>
                router.push({ pathname: '/transaction', params: { id: String(item.transactionId) } })
              }
              onLongPress={() => confirmDelete(item)}
            >
              <Card
                style={[
                  styles.rowCard,
                  {
                    backgroundColor: accent.cardBackground,
                    borderColor: accent.cardBorder,
                  },
                ]}
              >
                <View style={[styles.row, isMobile && styles.rowMobile]}>
                  <View
                    style={[
                      styles.stripe,
                      { backgroundColor: typeColor(item.type) },
                      bigSpend && styles.stripeHeavy,
                    ]}
                  />
                  <View style={[styles.rowMain, isMobile && styles.rowMainMobile]}>
                    <View style={styles.rowBody}>
                      <Text style={styles.rowTitle} numberOfLines={isMobile ? 2 : 1}>
                        {item.description}
                      </Text>
                      <Muted numberOfLines={isMobile ? 2 : 1}>
                        {item.categoryName} · {formatDate(item.transactionDate)}
                      </Muted>
                    </View>
                    <View style={[styles.rowEnd, isMobile && styles.rowEndMobile]}>
                      <Text style={[styles.rowAmount, { color: accent.amountColor }]}>{money(item.amount)}</Text>
                      <TypeBadge label={typeLabel(item.type)} color={typeColor(item.type)} />
                    </View>
                  </View>
                </View>
              </Card>
            </Pressable>
          );
        }}
      />
      <RegretFab onPress={() => router.push('/transaction')} />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  listContent: {
    padding: space.md,
    paddingBottom: 130,
    gap: 10,
  },
  header: {
    gap: space.md,
    marginBottom: 6,
  },
  filterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.paper,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: colors.line,
    paddingHorizontal: space.md,
    paddingVertical: 12,
  },
  filterToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  filterToggleLabel: {
    color: colors.ink,
    fontWeight: '700',
    fontSize: 15,
  },
  filterDot: {
    backgroundColor: colors.dangerSoft,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  filterDotText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: '800',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: space.sm,
  },
  clearFilters: {
    color: colors.accentMid,
    fontWeight: '700',
  },
  sectionTitle: {
    color: colors.ink,
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  emptyCard: {
    alignItems: 'center',
    gap: 8,
    paddingVertical: 28,
  },
  emptyTitle: {
    color: colors.ink,
    fontSize: 17,
    fontWeight: '800',
  },
  emptyCopy: {
    textAlign: 'center',
  },
  rowCard: {
    paddingVertical: 14,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'stretch',
  },
  rowMobile: {
    alignItems: 'flex-start',
  },
  rowMain: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  rowMainMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  stripe: {
    width: 4,
    alignSelf: 'stretch',
    borderRadius: 99,
  },
  stripeHeavy: {
    width: 5,
  },
  rowBody: {
    flex: 1,
    gap: 4,
  },
  rowTitle: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '700',
    flex: 1,
  },
  rowEnd: {
    alignItems: 'flex-end',
    gap: 8,
    flexShrink: 0,
  },
  rowEndMobile: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    justifyContent: 'space-between',
  },
  rowAmount: {
    color: colors.ink,
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.88,
  },
});

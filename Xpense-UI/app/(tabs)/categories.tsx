import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, RefreshControl, Text, View } from 'react-native';

import { ConfirmDialog, Card, ErrorText, Muted, SearchBar } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { colors, shadow, space } from '@/lib/theme';
import type { Category } from '@/lib/types';

export default function CategoriesScreen() {
  const { token, handleError } = useAuth();
  const [items, setItems] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const visibleItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) {
      return items;
    }
    return items.filter((item) => item.categoryName.toLowerCase().includes(query));
  }, [items, searchQuery]);

  const load = useCallback(async () => {
    if (!token) {
      return;
    }
    try {
      setItems(await api.categories(token));
      setError(null);
    } catch (err) {
      setError(handleError(err));
    }
  }, [handleError, token]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  async function remove() {
    if (!token || !pendingDelete) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteCategory(token, pendingDelete.categoryId);
      setPendingDelete(null);
      await load();
    } catch (err) {
      setError(handleError(err));
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <FlatList
        data={visibleItems}
        keyExtractor={(item) => String(item.categoryId)}
        contentContainerStyle={{ padding: space.md, gap: 10, paddingBottom: 120 }}
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
          <View style={{ gap: space.sm, marginBottom: 8 }}>
            <Muted>Defaults stay locked. Yours can be renamed or deleted.</Muted>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search categories…"
            />
            <ErrorText message={error} />
          </View>
        }
        ListEmptyComponent={
          <Muted>{searchQuery.trim() ? 'No categories match your search.' : 'No categories yet.'}</Muted>
        }
        renderItem={({ item }) => (
          <Pressable
            disabled={item.defaultCategory}
            onPress={() =>
              router.push({
                pathname: '/category',
                params: { id: String(item.categoryId), name: item.categoryName },
              })
            }
            onLongPress={() => {
              if (!item.defaultCategory) {
                setPendingDelete(item);
              }
            }}
          >
            <Card>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                <View
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: 14,
                    backgroundColor: item.defaultCategory ? colors.accentSoft : '#F4E7D3',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Ionicons
                    name={item.defaultCategory ? 'bookmark' : 'pricetag'}
                    size={18}
                    color={item.defaultCategory ? colors.accent : colors.gold}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: colors.ink, fontSize: 16, fontWeight: '700' }}>{item.categoryName}</Text>
                  <Muted>{item.defaultCategory ? 'Shared default' : 'Your category'}</Muted>
                </View>
                {item.defaultCategory ? null : (
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      setPendingDelete(item);
                    }}
                    hitSlop={12}
                    style={{ padding: 4 }}
                  >
                    <Ionicons name="trash-outline" size={18} color={colors.danger} />
                  </Pressable>
                )}
              </View>
            </Card>
          </Pressable>
        )}
      />
      <Pressable
        onPress={() => router.push('/category')}
        style={({ pressed }) => [
          {
            position: 'absolute',
            right: space.md,
            bottom: space.md,
            backgroundColor: colors.accent,
            width: 58,
            height: 58,
            borderRadius: 29,
            alignItems: 'center',
            justifyContent: 'center',
            ...shadow,
          },
          pressed && { opacity: 0.88 },
        ]}
      >
        <Ionicons name="add" size={30} color={colors.paper} />
      </Pressable>
      <ConfirmDialog
        visible={pendingDelete != null}
        title="Delete category?"
        message={`Open transactions in ${pendingDelete?.categoryName ?? ''} will move to Other.`}
        loading={deleting}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => void remove()}
      />
    </View>
  );
}

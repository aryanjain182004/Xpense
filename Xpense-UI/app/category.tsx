import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Text, View } from 'react-native';

import { ConfirmDialog, ErrorText, Field, GhostButton, Muted, PrimaryButton, Screen } from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { setPendingCategoryId } from '@/lib/category-pending';
import { leaveFormScreen } from '@/lib/navigation';
import { colors, space } from '@/lib/theme';

export default function CategoryFormScreen() {
  const params = useLocalSearchParams<{ id?: string; name?: string; from?: string; transactionId?: string }>();
  const rawId = Array.isArray(params.id) ? params.id[0] : params.id;
  const categoryId = rawId ? Number(rawId) : undefined;
  const canDelete = Number.isFinite(categoryId);
  const { token, handleError } = useAuth();
  const [categoryName, setCategoryName] = useState(
    Array.isArray(params.name) ? params.name[0] ?? '' : params.name ?? ''
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  async function save() {
    if (!token) {
      return;
    }
    const name = categoryName.trim();
    if (!name) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    try {
      if (canDelete && categoryId) {
        await api.updateCategory(token, categoryId, name);
        leaveFormScreen();
        return;
      }
      const created = await api.createCategory(token, name);
      const from = Array.isArray(params.from) ? params.from[0] : params.from;
      if (from === 'transaction') {
        setPendingCategoryId(created.categoryId);
        router.back();
        return;
      }
      leaveFormScreen();
    } catch (err) {
      setError(handleError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!token || !categoryId) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteCategory(token, categoryId);
      setConfirmOpen(false);
      leaveFormScreen();
    } catch (err) {
      setError(handleError(err));
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <Screen style={{ gap: space.md }}>
      <Text style={{ color: colors.ink, fontSize: 22, fontWeight: '700' }}>
        {canDelete ? 'Rename category' : 'New category'}
      </Text>
      {canDelete ? (
        <Muted>Deleting this moves open transactions to Other.</Muted>
      ) : (
        <Muted>Use a short name you will recognise in the ledger.</Muted>
      )}
      <Field label="Name" placeholder="Coffee, Gym, Gifts" value={categoryName} onChangeText={setCategoryName} />
      <ErrorText message={error} />
      <PrimaryButton
        label={canDelete ? 'Save category' : 'Add category'}
        loading={saving}
        onPress={() => void save()}
      />
      {canDelete ? (
        <View>
          <GhostButton danger label="Delete" onPress={() => setConfirmOpen(true)} />
        </View>
      ) : null}
      <ConfirmDialog
        visible={confirmOpen}
        title="Delete category?"
        message="Open transactions will move to Other."
        loading={deleting}
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void remove()}
      />
    </Screen>
  );
}

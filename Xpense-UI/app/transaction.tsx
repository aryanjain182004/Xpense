import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AmountCalculator } from '@/components/amount-calculator';
import { RegretGifIntro } from '@/components/regret-gif-panel';
import { RegretMeter } from '@/components/regret-meter';
import {
  Card,
  ConfirmDialog,
  DateField,
  Dropdown,
  ErrorText,
  Field,
  GhostButton,
  Muted,
  PrimaryButton,
  Screen,
} from '@/components/ui';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { takePendingCategoryId } from '@/lib/category-pending';
import { formatDateTime, todayIso } from '@/lib/format';
import { leaveFormScreen } from '@/lib/navigation';
import { useMobileLayout } from '@/lib/layout';
import { colors, radius, shadow, space } from '@/lib/theme';
import { TRANSACTION_TYPES, type Category, type TransactionType } from '@/lib/types';

function saveLabel(isEdit: boolean) {
  return isEdit ? 'Save changes' : 'Add to the ledger';
}

export default function TransactionFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const transactionId = id ? Number(id) : undefined;
  const isNew = !transactionId;
  const { token, handleError } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [transactionDate, setTransactionDate] = useState(todayIso());
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [type, setType] = useState<TransactionType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [regretOpen, setRegretOpen] = useState(false);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);

  const parsedAmount = Number(amount);
  const amountValue = Number.isFinite(parsedAmount) ? Math.max(0, parsedAmount) : 0;

  const { isMobile } = useMobileLayout();
  const headline = useMemo(() => (isNew ? 'New expense' : 'Edit entry'), [isNew]);

  useFocusEffect(
    useCallback(() => {
      if (!token) {
        return;
      }
      (async () => {
        try {
          const nextCategories = await api.categories(token);
          setCategories(nextCategories);
          const pendingId = takePendingCategoryId();
          if (pendingId !== null) {
            setCategoryId(pendingId);
          }
        } catch (err) {
          setError(handleError(err));
        }
      })();
    }, [handleError, token])
  );

  useEffect(() => {
    if (!token || !transactionId) {
      return;
    }
    (async () => {
      try {
        const existing = await api.transaction(token, transactionId);
        setDescription(existing.description);
        setAmount(String(existing.amount));
        setTransactionDate(existing.transactionDate);
        setCategoryId(existing.categoryId);
        setType(existing.type);
        setCreatedAt(existing.createdAt);
        setUpdatedAt(existing.updatedAt);
      } catch (err) {
        setError(handleError(err));
      }
    })();
  }, [handleError, token, transactionId]);

  function validateForm() {
    if (!description.trim()) {
      setError('Add a description');
      return false;
    }
    if (!amount.trim()) {
      setError('Enter an amount');
      return false;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) {
      setError('Enter a valid amount');
      return false;
    }
    if (parsed <= 0) {
      setError('Amount must be greater than zero');
      return false;
    }
    if (!type) {
      setError('Pick a regret level');
      return false;
    }
    if (!categoryId) {
      setError('Pick a category');
      return false;
    }
    setError(null);
    return true;
  }

  function onPressSave() {
    if (!validateForm()) {
      return;
    }
    if (isNew) {
      setError(null);
      setRegretOpen(true);
      return;
    }
    void save();
  }

  async function save() {
    if (!token) {
      setError('Session expired. Sign in again.');
      setRegretOpen(false);
      return;
    }
    if (!description.trim()) {
      setError('Add a description');
      setRegretOpen(false);
      return;
    }
    if (!amount.trim()) {
      setError('Enter an amount');
      setRegretOpen(false);
      return;
    }
    const parsed = Number(amount);
    if (!Number.isFinite(parsed)) {
      setError('Enter a valid amount');
      setRegretOpen(false);
      return;
    }
    if (parsed <= 0) {
      setError('Amount must be greater than zero');
      setRegretOpen(false);
      return;
    }
    if (!type) {
      setError('Pick a regret level');
      setRegretOpen(false);
      return;
    }
    if (!categoryId) {
      setError('Pick a category');
      setRegretOpen(false);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body = {
        description: description.trim(),
        amount: parsed,
        transactionDate,
        categoryId,
        type,
      };
      if (transactionId) {
        await api.updateTransaction(token, transactionId, body);
      } else {
        await api.createTransaction(token, body);
      }
      setRegretOpen(false);
      leaveFormScreen();
    } catch (err) {
      setError(handleError(err));
      // Keep modal open so the connection error is visible on the confirm step.
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    if (!token || !transactionId) {
      return;
    }
    setDeleting(true);
    try {
      await api.deleteTransaction(token, transactionId);
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
    <Screen style={styles.screen}>
      {isNew && type ? (
        <RegretGifIntro
          visible={regretOpen}
          type={type}
          amount={amountValue}
          confirmLabel={saveLabel(false)}
          error={error}
          loading={saving}
          onCancel={() => {
            if (!saving) {
              setRegretOpen(false);
            }
          }}
          onConfirm={() => void save()}
        />
      ) : null}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding">
        <ScrollView
          contentContainerStyle={[styles.scroll, isMobile && styles.scrollMobile]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={isNew ? styles.headline : styles.editTitle}>{headline}</Text>
          {isNew ? (
            <Text style={styles.headlineSub}>
              Fill in the details, then tap Add to the ledger to face the regret GIF.
            </Text>
          ) : null}

          {!isNew && createdAt && updatedAt ? (
            <Card style={styles.metaCard}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Created</Text>
                <Muted style={styles.metaValue}>{formatDateTime(createdAt)}</Muted>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Last modified</Text>
                <Muted style={styles.metaValue}>{formatDateTime(updatedAt)}</Muted>
              </View>
            </Card>
          ) : null}

          <View style={styles.formCard}>
            <Field
              label="What did you buy?"
              placeholder="Late-night delivery, sale item, cab…"
              value={description}
              onChangeText={setDescription}
            />
            <AmountCalculator
              label="How much did it cost?"
              placeholder="0.00"
              value={amount}
              onChange={setAmount}
            />
            {isNew && amountValue > 0 ? <RegretMeter amount={amountValue} /> : null}
            <DateField
              label="When"
              value={transactionDate}
              onChange={(date) => setTransactionDate(date ?? todayIso())}
            />
            <Dropdown
              label="Regret level"
              value={type}
              options={TRANSACTION_TYPES.map((item) => ({ label: item.label, value: item.value }))}
              onChange={setType}
            />
            <Dropdown
              label="Category"
              value={categoryId}
              searchable
              searchPlaceholder="Search categories"
              options={categories.map((item) => ({ label: item.categoryName, value: item.categoryId }))}
              onChange={setCategoryId}
              footerLabel="Add category"
              onFooterPress={() =>
                router.push({
                  pathname: '/category',
                  params: { from: 'transaction' },
                })
              }
            />
          </View>

          <ErrorText message={error} />
          <PrimaryButton
            label={saveLabel(!isNew)}
            loading={saving && !regretOpen}
            onPress={onPressSave}
          />
          {transactionId ? <GhostButton danger label="Delete" onPress={() => setConfirmOpen(true)} /> : null}
          <ConfirmDialog
            visible={confirmOpen}
            title="Delete transaction?"
            message="This hides it from your ledger."
            loading={deleting}
            onCancel={() => setConfirmOpen(false)}
            onConfirm={() => void remove()}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: {
    paddingHorizontal: 0,
  },
  scroll: {
    gap: space.md,
    paddingBottom: space.xl,
    paddingHorizontal: space.md,
    paddingTop: space.sm,
  },
  scrollMobile: {
    paddingBottom: space.xl * 2,
  },
  headline: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headlineSub: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: -6,
  },
  editTitle: {
    color: colors.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  metaCard: {
    gap: space.sm,
    paddingVertical: space.md,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: space.md,
  },
  metaLabel: {
    color: colors.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  metaValue: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flex: 1,
  },
  formCard: {
    backgroundColor: colors.paper,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.line,
    padding: space.md,
    gap: space.md,
    ...shadow,
  },
});

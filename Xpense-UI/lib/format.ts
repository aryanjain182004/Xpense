import { colors } from '@/lib/theme';
import { TRANSACTION_TYPES, type TransactionType } from '@/lib/types';

export function money(amount: number | string) {
  const value = typeof amount === 'string' ? Number(amount) : amount;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number.isFinite(value) ? value : 0);
}

export function typeLabel(type: TransactionType) {
  return TRANSACTION_TYPES.find((item) => item.value === type)?.label ?? type;
}

export function toIsoDate(date: Date) {
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${date.getFullYear()}-${month}-${day}`;
}

export function parseIsoDate(iso?: string) {
  if (!iso) {
    return null;
  }
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }
  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function todayIso() {
  return toIsoDate(new Date());
}

export function startOfLocalDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isAfterLocalDay(left: Date, right: Date) {
  return startOfLocalDay(left).getTime() > startOfLocalDay(right).getTime();
}

export function clampToMaxLocalDay(date: Date, max: Date) {
  const day = startOfLocalDay(date);
  const cap = startOfLocalDay(max);
  return day.getTime() > cap.getTime() ? cap : day;
}

export function typeColor(type: TransactionType) {
  if (type === 'NECESSITY') {
    return colors.necessity;
  }
  if (type === 'MODERATE') {
    return colors.moderate;
  }
  return colors.luxury;
}

export function typeRowAccent(type: TransactionType) {
  if (type === 'NECESSITY') {
    return {
      cardBackground: '#F4FAF8',
      cardBorder: 'rgba(11, 61, 54, 0.16)',
      amountColor: colors.necessity,
    };
  }
  if (type === 'MODERATE') {
    return {
      cardBackground: '#F5F8FC',
      cardBorder: 'rgba(29, 78, 137, 0.18)',
      amountColor: colors.moderate,
    };
  }
  return {
    cardBackground: '#FFF8F6',
    cardBorder: 'rgba(159, 18, 57, 0.22)',
    amountColor: colors.danger,
  };
}

export function formatDate(iso: string) {
  const [year, month, day] = iso.split('-').map(Number);
  if (!year || !month || !day) {
    return iso;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(year, month - 1, day));
}

export function formatDateTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(date);
}

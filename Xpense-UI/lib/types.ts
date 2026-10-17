export type TransactionType = 'NECESSITY' | 'MODERATE' | 'LUXURY';

export type User = {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type Category = {
  categoryId: number;
  categoryName: string;
  defaultCategory: boolean;
};

export type Transaction = {
  transactionId: number;
  description: string;
  amount: number;
  transactionDate: string;
  categoryId: number;
  categoryName: string;
  type: TransactionType;
  createdAt: string;
  updatedAt: string;
};

export type TransactionFilters = {
  fromDate?: string;
  toDate?: string;
  type?: TransactionType;
  categoryId?: number;
  minAmount?: string;
  maxAmount?: string;
};

export const TRANSACTION_TYPES: { value: TransactionType; label: string }[] = [
  { value: 'NECESSITY', label: 'Need' },
  { value: 'MODERATE', label: 'Moderate' },
  { value: 'LUXURY', label: 'Luxury' },
];

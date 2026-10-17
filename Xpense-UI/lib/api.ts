import { resolveApiUrl } from '@/lib/api-url';
import type {
  AuthResponse,
  Category,
  Transaction,
  TransactionFilters,
  TransactionType,
  User,
} from '@/lib/types';

const API_URL = resolveApiUrl();

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
  }
}

type RequestOptions = {
  method?: string;
  token?: string | null;
  body?: unknown;
  query?: Record<string, string | number | undefined>;
};

function parseProblemDetail(text: string): string | null {
  if (!text) {
    return null;
  }
  try {
    const data = JSON.parse(text) as { detail?: string; message?: string; title?: string };
    return data.detail ?? data.message ?? data.title ?? null;
  } catch {
    return null;
  }
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(path, `${API_URL}/`);
  Object.entries(options.query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      url.searchParams.set(key, String(value));
    }
  });

  const headers: Record<string, string> = { Accept: 'application/json' };
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? 'GET',
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      redirect: 'manual',
    });
  } catch {
    throw new NetworkError(
      `Cannot reach the server at ${API_URL}. Start the Xpense backend and check EXPO_PUBLIC_API_URL.`
    );
  }

  if (
    response.type === 'opaqueredirect' ||
    response.status === 301 ||
    response.status === 302 ||
    response.status === 303 ||
    response.status === 307 ||
    response.status === 308
  ) {
    throw new ApiError(401, 'Session expired. Sign in again.');
  }

  const text = await response.text();

  if (response.status === 204) {
    return undefined as T;
  }

  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      if (!response.ok) {
        throw new ApiError(response.status, text.slice(0, 200) || 'Request failed');
      }
      throw new NetworkError('Server returned an invalid response. Is the API running?');
    }
  }

  if (!response.ok) {
    const problem =
      (data as { detail?: string; message?: string } | null)?.detail ??
      (data as { message?: string } | null)?.message ??
      parseProblemDetail(text) ??
      'Request failed';
    throw new ApiError(response.status, problem);
  }

  return data as T;
}

function moneyAmount(amount: number) {
  return Math.round(amount * 100) / 100;
}

export const api = {
  login: (idToken: string) =>
    request<AuthResponse>('/auth/google', { method: 'POST', body: { idToken } }),

  me: (token: string) => request<User>('/users', { token }),

  categories: (token: string) => request<Category[]>('/categories', { token }),

  createCategory: (token: string, categoryName: string) =>
    request<Category>('/categories', { method: 'POST', token, body: { categoryName } }),

  updateCategory: (token: string, categoryId: number, categoryName: string) =>
    request<Category>(`/categories/${categoryId}`, {
      method: 'PUT',
      token,
      body: { categoryName },
    }),

  deleteCategory: (token: string, categoryId: number) =>
    request<void>(`/categories/${categoryId}`, { method: 'DELETE', token }),

  transaction: (token: string, transactionId: number) =>
    request<Transaction>(`/transactions/${transactionId}`, { token }),

  transactions: (token: string, filters: TransactionFilters = {}) =>
    request<Transaction[]>('/transactions', {
      token,
      query: {
        fromDate: filters.fromDate,
        toDate: filters.toDate,
        type: filters.type,
        categoryId: filters.categoryId,
        minAmount: filters.minAmount,
        maxAmount: filters.maxAmount,
      },
    }),

  createTransaction: (
    token: string,
    body: {
      description: string;
      amount: number;
      transactionDate: string;
      categoryId: number;
      type: TransactionType;
    }
  ) =>
    request<Transaction>('/transactions', {
      method: 'POST',
      token,
      body: { ...body, amount: moneyAmount(body.amount) },
    }),

  updateTransaction: (
    token: string,
    transactionId: number,
    body: {
      description: string;
      amount: number;
      transactionDate: string;
      categoryId: number;
      type: TransactionType;
    }
  ) =>
    request<Transaction>(`/transactions/${transactionId}`, {
      method: 'PUT',
      token,
      body: { ...body, amount: moneyAmount(body.amount) },
    }),

  deleteTransaction: (token: string, transactionId: number) =>
    request<void>(`/transactions/${transactionId}`, { method: 'DELETE', token }),
};

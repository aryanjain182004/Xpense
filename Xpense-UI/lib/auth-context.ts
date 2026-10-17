import { createContext } from 'react';

import type { User } from '@/lib/types';

export type AuthContextValue = {
    ready: boolean;
    token: string | null;
    user: User | null;
    signIn: (idToken: string) => Promise<void>;
    acceptToken: (token: string) => Promise<void>;
    signOut: () => Promise<void>;
    handleError: (error: unknown) => string;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
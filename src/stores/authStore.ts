import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    username: string;
    role: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    setUser: (user: User | null) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            isAuthenticated: false,
            setUser: (user) => set({ user, isAuthenticated: !!user }),
            logout: async () => {
                try {
                    await fetch('/api/auth', {
                        method: 'DELETE',
                        credentials: 'include',
                    });
                } catch (error) {
                    console.error('Logout error:', error);
                }
                set({ user: null, isAuthenticated: false });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);

export default useAuthStore;
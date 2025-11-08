import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface UserProfile {
    id?: string;
    username?: string;
    avatar_id?: string;
    nickname?: string;
}

interface UserState {
    token: string | null;
    user: UserProfile | null;
    setToken: (token: string | null) => void;
    setUser: (user: UserProfile | null) => void;
}

export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            setToken: (token) => set({ token }),
            setUser: (user) => set({ user }),
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);


import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// 定义用户信息的类型
interface UserProfile {
    id: number;
    username: string;
    avatar_id: string;
    nickname: string;
}
// 定义 Zustand 用户状态管理的接口
interface UserState {
    token: string | null;
    user: UserProfile | null;
    setToken: (token: string | null) => void;
    setUser: (user: UserProfile | null) => void;
    logout: () => void;
    
}
// 创建并导出用户状态的 Zustand store
export const useUserStore = create<UserState>()(
    persist(
        (set) => ({
            token: null,
            user: null,
            // 设置 token
            setToken: (token) => set({ token }),
            // 设置用户信息
            setUser: (user) => set({ user }),
            // 注销用户，清除 token 和用户信息,目前似乎用不到
            logout: () => set({ token: null, user: null }),
        }),
        {
            name: 'auth',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ token: state.token, user: state.user }),
        }
    )
);


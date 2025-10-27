import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';

interface Birth {
  year: string;
  month: string;
  day: string;
}

interface UserState {
  birth: Birth;
  gender: string;
  email: string;
  nickname: string;
  setBirth: (birth: Partial<Birth>) => void;
  setGender: (gender: string) => void;
  setEmail: (email: string) => void;
  setNickname: (nickname: string) => void;
  setUserInfo: (info: {
    nickname: string;
    email: string;
    gender: string;
    birth: Birth;
  }) => void;
}

const useUserStore = create<UserState>()(
  immer((set) => ({
    birth: { year: '', month: '', day: '' },
    gender: '',
    email: '',
    nickname: '',
    setBirth: (birth) =>
      set((state) => {
        Object.assign(state.birth, birth);
      }),
    setGender: (gender) =>
      set((state) => {
        state.gender = gender;
      }),
    setEmail: (email) =>
      set((state) => {
        state.email = email;
      }),
    setNickname: (nickname) =>
      set((state) => {
        state.nickname = nickname;
      }),
    setUserInfo: ({ nickname, email, gender, birth }) =>
        set({ nickname, email, gender, birth }),
  }))
);

export default useUserStore;

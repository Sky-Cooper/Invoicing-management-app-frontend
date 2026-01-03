import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1. Define what the user object looks like
interface UserInfo {
  id: string;
  name: string;
  email: string;
  token?: string;
}

// 2. Define the State interface
interface UserState {
  userInfo: UserInfo | null;
  isAuthenticated: boolean;
}

const initialState: UserState = {
  userInfo: null,
  isAuthenticated: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Use PayloadAction<Type> to define what data we expect
    login: (state, action: PayloadAction<UserInfo>) => {
      state.userInfo = action.payload;
      state.isAuthenticated = true;
    },
    logout: (state) => {
      state.userInfo = null;
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
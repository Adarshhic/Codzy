import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axiosClient from './utils/axiosClient';

/* ===========================
   REGISTER
=========================== */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/user/register', userData);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Registration failed'
      );
    }
  }
);

/* ===========================
   LOGIN
=========================== */
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const res = await axiosClient.post('/user/login', credentials);
      return res.data.user;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || 'Login failed'
      );
    }
  }
);

/* ===========================
   CHECK AUTH
=========================== */
export const checkAuth = createAsyncThunk(
  'auth/check',
  async (_, { rejectWithValue }) => {
    try {
      const res = await axiosClient.get('/user/check');
      return res.data.user;
    } catch (err) {
      if (err.response?.status === 401) {
        // USER NOT LOGGED IN (EXPECTED)
        return rejectWithValue(null);
      }
      return rejectWithValue('Authentication check failed');
    }
  }
);

/* ===========================
   LOGOUT
=========================== */
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await axiosClient.post('/user/logout');
      return null;
    } catch (err) {
      return rejectWithValue('Logout failed');
    }
  }
);

/* ===========================
   SLICE
=========================== */
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    isAuthenticated: false,
    loading: false,
    error: null
  },
  reducers: {},
  extraReducers: (builder) => {
    builder

      /* REGISTER */
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      /* LOGIN */
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.user = null;
        state.isAuthenticated = false;
      })

      /* CHECK AUTH */
      .addCase(checkAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null; // IMPORTANT: no error for 401
      })

      /* LOGOUT */
      .addCase(logoutUser.pending, (state) => {
        state.loading = true;
      })
      .addCase(logoutUser.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export default authSlice.reducer;

import authReducer, { logout, setCredentials } from '../store/slices/authSlice';

describe('Auth Slice', () => {
  const initialState = {
    user: null,
    accessToken: null,
    refreshToken: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  it('should handle logout', () => {
    const state = {
      ...initialState,
      user: { id: 1, email: 'test@example.com' },
      accessToken: 'token',
      isAuthenticated: true,
    };

    const newState = authReducer(state, logout());
    expect(newState.user).toBeNull();
    expect(newState.accessToken).toBeNull();
    expect(newState.isAuthenticated).toBe(false);
  });

  it('should handle setCredentials', () => {
    const credentials = {
      accessToken: 'new-token',
      refreshToken: 'refresh-token',
    };

    const newState = authReducer(initialState, setCredentials(credentials));
    expect(newState.accessToken).toBe('new-token');
    expect(newState.refreshToken).toBe('refresh-token');
    expect(newState.isAuthenticated).toBe(true);
  });
});

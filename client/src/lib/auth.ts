export const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem("auth_token", token);
};

export const clearAuthToken = (): void => {
  localStorage.removeItem("auth_token");
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
};

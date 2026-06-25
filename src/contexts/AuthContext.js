import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  return (
    <AuthContext.Provider value={{ usuario: true, login: () => {}, logout: () => {} }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();

export const DEMO_CREDENTIALS = {
  email: 'demo@docflow.com',
  password: 'DocFlow123',
  name: 'Demo User',
  role: 'Workspace Owner',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80'
};

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      return localStorage.getItem('docflow_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('docflow_user');
      return stored ? JSON.parse(stored) : (
        localStorage.getItem('docflow_authenticated') === 'true' ? {
          id: 'user-demo-01',
          email: DEMO_CREDENTIALS.email,
          name: DEMO_CREDENTIALS.name,
          role: DEMO_CREDENTIALS.role,
          avatar: DEMO_CREDENTIALS.avatar
        } : null
      );
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password, remember = true) => {
    setLoading(true);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const cleanEmail = (email || '').trim().toLowerCase();
        const cleanPass = (password || '').trim();

        const isDemoEmail = cleanEmail === DEMO_CREDENTIALS.email.toLowerCase() || cleanEmail === 'admin@docflow.com' || cleanEmail === 'demo';
        const isDemoPass = cleanPass === DEMO_CREDENTIALS.password || cleanPass.toLowerCase() === 'docflow123' || cleanPass.toLowerCase() === 'demo' || cleanPass.toLowerCase() === 'password';

        // Also allow any valid non-empty credentials for smooth testing if needed, or exact demo match
        if ((isDemoEmail && isDemoPass) || (cleanEmail.length > 3 && cleanPass.length >= 3)) {
          const authUser = {
            id: 'user-demo-01',
            email: cleanEmail.includes('@') ? cleanEmail : DEMO_CREDENTIALS.email,
            name: cleanEmail.includes('@') ? cleanEmail.split('@')[0].charAt(0).toUpperCase() + cleanEmail.split('@')[0].slice(1) : DEMO_CREDENTIALS.name,
            role: DEMO_CREDENTIALS.role,
            avatar: DEMO_CREDENTIALS.avatar
          };

          setIsAuthenticated(true);
          setUser(authUser);

          try {
            if (remember) {
              localStorage.setItem('docflow_authenticated', 'true');
              localStorage.setItem('docflow_user', JSON.stringify(authUser));
            } else {
              sessionStorage.setItem('docflow_authenticated', 'true');
              sessionStorage.setItem('docflow_user', JSON.stringify(authUser));
            }
          } catch (e) {
            console.warn('Storage error:', e);
          }

          setLoading(false);
          resolve(authUser);
        } else {
          setLoading(false);
          reject(new Error('Invalid email or password'));
        }
      }, 250);
    });
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    setUser(null);
    try {
      localStorage.removeItem('docflow_authenticated');
      localStorage.removeItem('docflow_user');
      localStorage.removeItem('smart_doc_token');
      sessionStorage.removeItem('docflow_authenticated');
      sessionStorage.removeItem('docflow_user');
    } catch (e) {
      console.warn('Storage error:', e);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        loading,
        login,
        logout,
        demoCredentials: DEMO_CREDENTIALS
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

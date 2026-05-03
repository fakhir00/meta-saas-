'use client';
import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('metabox_user');
    if (stored) {
      try { setUser(JSON.parse(stored)); } catch {}
    }
    setLoading(false);
  }, []);

  const signup = (name, email, password) => {
    const users = JSON.parse(localStorage.getItem('metabox_users') || '[]');
    if (users.find(u => u.email === email)) {
      return { error: 'An account with this email already exists.' };
    }
    const newUser = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      name,
      email,
      createdAt: new Date().toISOString(),
    };
    users.push({ ...newUser, password });
    localStorage.setItem('metabox_users', JSON.stringify(users));
    localStorage.setItem('metabox_user', JSON.stringify(newUser));
    setUser(newUser);
    return { success: true };
  };

  const login = (email, password) => {
    const users = JSON.parse(localStorage.getItem('metabox_users') || '[]');
    const found = users.find(u => u.email === email && u.password === password);
    if (!found) {
      return { error: 'Invalid email or password.' };
    }
    const { password: _, ...safeUser } = found;
    localStorage.setItem('metabox_user', JSON.stringify(safeUser));
    setUser(safeUser);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem('metabox_user');
    setUser(null);
  };

  // Project management
  const getProjects = () => {
    if (!user) return [];
    const all = JSON.parse(localStorage.getItem('metabox_projects') || '[]');
    return all.filter(p => p.userId === user.id);
  };

  const createProject = (name, description) => {
    if (!user) return null;
    const project = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2),
      userId: user.id,
      name,
      description,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const all = JSON.parse(localStorage.getItem('metabox_projects') || '[]');
    all.push(project);
    localStorage.setItem('metabox_projects', JSON.stringify(all));
    return project;
  };

  const deleteProject = (projectId) => {
    const all = JSON.parse(localStorage.getItem('metabox_projects') || '[]');
    const filtered = all.filter(p => !(p.id === projectId && p.userId === user?.id));
    localStorage.setItem('metabox_projects', JSON.stringify(filtered));
  };

  const updateProject = (projectId, updates) => {
    const all = JSON.parse(localStorage.getItem('metabox_projects') || '[]');
    const idx = all.findIndex(p => p.id === projectId && p.userId === user?.id);
    if (idx !== -1) {
      all[idx] = { ...all[idx], ...updates, updatedAt: new Date().toISOString() };
      localStorage.setItem('metabox_projects', JSON.stringify(all));
      return all[idx];
    }
    return null;
  };

  return (
    <AuthContext.Provider value={{ user, loading, signup, login, logout, getProjects, createProject, deleteProject, updateProject }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

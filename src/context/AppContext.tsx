'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { Lead, Portfolio, ClientProject, User, UserRole, LeadStatus, ProjectStatus, PricingTier } from '../types';
import { INITIAL_LEADS, INITIAL_PORTFOLIOS, INITIAL_PROJECTS, INITIAL_USER, INITIAL_USERS, INITIAL_PRICING_TIERS } from '../data/initialData';
import { generateAutoDocumentsForProject } from '../lib/documentGenerator';
import { DEFAULT_ROLE_PERMISSIONS } from '../lib/rbac';
import { getStageFromProgress } from '../lib/ipwStages';

interface NotificationState {
  open: boolean;
  message: string;
  severity: 'success' | 'info' | 'warning' | 'error';
}

interface AppContextType {
  themeMode: PaletteMode;
  toggleTheme: () => void;
  activeView: 'landing' | 'dashboard';
  setActiveView: (view: 'landing' | 'dashboard') => void;
  dashboardTab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'schema' | 'documents' | 'users' | 'hpp';
  setDashboardTab: (tab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'schema' | 'documents' | 'users' | 'hpp') => void;
  
  // Auth & RBAC
  currentUser: User | null;
  login: (email?: string) => boolean;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  switchUserRole: (userId: string) => void;

  // Users Management & Dynamic RBAC
  users: User[];
  addUser: (user: Omit<User, 'id' | 'createdAt'>) => Promise<User>;
  updateUser: (id: string, fields: Partial<User>) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  rolePermissions: Record<UserRole, Record<string, boolean>>;
  updateRolePermission: (role: UserRole, key: string, allowed: boolean) => void;
  resetRolePermissionsToDefault: () => void;
  hasRolePermission: (role: UserRole, key: string) => boolean;

  // Leads
  leads: Lead[];
  addLead: (lead: Omit<Lead, 'id' | 'createdAt' | 'status'>) => Promise<Lead>;
  updateLeadStatus: (id: string, status: LeadStatus) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;
  markAllLeadsRead: () => Promise<void>;
  unreadLeadsCount: number;

  // Portfolios
  portfolios: Portfolio[];
  addPortfolio: (item: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Portfolio>;
  updatePortfolio: (id: string, item: Partial<Portfolio>) => Promise<void>;
  deletePortfolio: (id: string) => Promise<void>;

  // Projects
  projects: ClientProject[];
  addProject: (proj: Omit<ClientProject, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ClientProject>;
  updateProject: (id: string, proj: Partial<ClientProject>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  updateProjectProgress: (id: string, progress: number, status?: ProjectStatus) => Promise<void>;

  // Pricing Tiers (Admin manageable)
  pricingTiers: PricingTier[];
  updatePricingTier: (id: string, tier: Partial<PricingTier>) => Promise<void>;
  resetPricingTiersToDefault: () => void;

  // Global Notification / Toast
  notification: NotificationState;
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  closeNotification: () => void;

  // Quick Action / Pre-fill contact form
  selectedServiceForInquiry: string;
  setSelectedServiceForInquiry: (service: string) => void;

  // Reset demo data
  resetAllDataToDefaults: () => void;
  refreshDataFromBackend: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  THEME: 'webdev_sys_theme',
  USER: 'webdev_sys_user',
  USERS_LIST: 'webdev_sys_users_list',
  RBAC: 'webdev_sys_rbac_permissions',
  PROJECTS: 'webdev_sys_projects',
  LEADS: 'webdev_sys_leads',
  PORTFOLIOS: 'webdev_sys_portfolios',
  PRICING: 'webdev_sys_pricing_tiers',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme Mode
  const [themeMode, setThemeMode] = useState<PaletteMode>('dark');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.THEME);
      if (saved === 'dark' || saved === 'light') {
        setThemeMode(saved);
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      try {
        localStorage.setItem(STORAGE_KEYS.THEME, next);
      } catch (e) {
        console.error(e);
      }
      return next;
    });
  };

  // Dynamic RBAC Permissions State
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Record<string, boolean>>>(DEFAULT_ROLE_PERMISSIONS);

  useEffect(() => {
    try {
      const savedPerms = localStorage.getItem(STORAGE_KEYS.RBAC);
      if (savedPerms) {
        setRolePermissions(JSON.parse(savedPerms));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const updateRolePermission = (role: UserRole, key: string, allowed: boolean) => {
    setRolePermissions((prev) => {
      const updated = {
        ...prev,
        [role]: {
          ...(prev[role] || {}),
          [key]: allowed,
        },
      };
      try {
        localStorage.setItem(STORAGE_KEYS.RBAC, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showNotification(`Hak akses '${key}' untuk role [${role}] telah diubah menjadi: ${allowed ? 'DIIZINKAN' : 'DIBLOKIR'}`, 'info');
  };

  const resetRolePermissionsToDefault = () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    try {
      localStorage.removeItem(STORAGE_KEYS.RBAC);
    } catch (e) {
      console.error(e);
    }
    showNotification('Matriks Hak Akses RBAC telah dikembalikan ke standar default.', 'success');
  };

  const hasRolePermission = (role: UserRole, key: string): boolean => {
    if (rolePermissions && rolePermissions[role] && rolePermissions[role][key] !== undefined) {
      return !!rolePermissions[role][key];
    }
    return true;
  };

  // View state
  const [activeView, setActiveView] = useState<'landing' | 'dashboard'>('landing');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'pricing' | 'leads' | 'portfolio' | 'projects' | 'schema' | 'documents' | 'users' | 'hpp'>('overview');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState('');

  // Persistent States initialized from Initial Constants (to avoid SSR/Client Hydration Mismatch)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USER);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(INITIAL_PORTFOLIOS);
  const [projects, setProjects] = useState<ClientProject[]>(INITIAL_PROJECTS);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(INITIAL_PRICING_TIERS);

  // Restore state from LocalStorage after initial mount (hydration complete)
  useEffect(() => {
    try {
      const savedUsers = localStorage.getItem(STORAGE_KEYS.USERS_LIST);
      if (savedUsers) setUsers(JSON.parse(savedUsers));

      const savedLeads = localStorage.getItem(STORAGE_KEYS.LEADS);
      if (savedLeads) setLeads(JSON.parse(savedLeads));

      const savedPortfolios = localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      if (savedPortfolios) setPortfolios(JSON.parse(savedPortfolios));

      const savedProjects = localStorage.getItem(STORAGE_KEYS.PROJECTS);
      if (savedProjects) setProjects(JSON.parse(savedProjects));

      const savedPricing = localStorage.getItem(STORAGE_KEYS.PRICING);
      if (savedPricing) setPricingTiers(JSON.parse(savedPricing));
    } catch (e) {
      console.error('Error restoring state from localStorage:', e);
    }
  }, []);

  // Helper State Setters with Automatic LocalStorage Sync
  const saveUsers = (next: User[]) => {
    setUsers(next);
    try {
      localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const saveLeads = (next: Lead[]) => {
    setLeads(next);
    try {
      localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const savePortfolios = (next: Portfolio[]) => {
    setPortfolios(next);
    try {
      localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const saveProjects = (next: ClientProject[]) => {
    setProjects(next);
    try {
      localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  const savePricingTiers = (next: PricingTier[]) => {
    setPricingTiers(next);
    try {
      localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(next));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        const existing = users.find((u) => u.id === parsed.id || u.email === parsed.email);
        if (existing) setCurrentUser(existing);
        else setCurrentUser(parsed);
      }
    } catch {
      setCurrentUser(INITIAL_USER);
    }
  }, []);

  const switchUserRole = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      setCurrentUser(targetUser);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(targetUser));
      } catch (e) {
        console.error(e);
      }
      showNotification(`Beralih simulasi ke role: ${targetUser.role} (${targetUser.name})`, 'info');
    }
  };

  const login = (email?: string) => {
    const foundUser = users.find((u) => u.email === email) || {
      ...INITIAL_USER,
      email: email || INITIAL_USER.email,
    };
    setCurrentUser(foundUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(foundUser));
    } catch (e) {
      console.error(e);
    }
    showNotification(`Berhasil login sebagai ${foundUser.name} [${foundUser.role}]`, 'success');
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error(e);
    }
    setActiveView('landing');
    showNotification('Sesi berakhir. Anda kembali ke Laman Depan.', 'info');
  };

  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newU: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveUsers([newU, ...users]);
    showNotification(`User ${newU.name} (${newU.role}) berhasil ditambahkan!`, 'success');
    return newU;
  };

  const updateUser = async (id: string, fields: Partial<User>) => {
    const nextUsers = users.map((u) => (u.id === id ? { ...u, ...fields, updatedAt: new Date().toISOString() } : u));
    saveUsers(nextUsers);
    if (currentUser?.id === id) {
      const updatedCurrent = { ...currentUser, ...fields };
      setCurrentUser(updatedCurrent);
      try {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updatedCurrent));
      } catch (e) {
        console.error(e);
      }
    }
    showNotification('Data pengguna & hak akses RBAC berhasil diperbarui!', 'success');
  };

  const deleteUser = async (id: string) => {
    saveUsers(users.filter((u) => u.id !== id));
    showNotification('Pengguna telah dihapus dari sistem', 'warning');
  };

  // Fetch initial data from Next.js API Routes (if backend is connected)
  const refreshDataFromBackend = async () => {
    try {
      const [leadsRes, portRes, projRes, pricingRes] = await Promise.all([
        fetch('/api/leads').then((res) => res.json()).catch(() => null),
        fetch('/api/portfolio').then((res) => res.json()).catch(() => null),
        fetch('/api/projects').then((res) => res.json()).catch(() => null),
        fetch('/api/pricing').then((res) => res.json()).catch(() => null),
      ]);

      if (leadsRes?.success && Array.isArray(leadsRes.data) && leadsRes.data.length > 0) saveLeads(leadsRes.data);
      if (portRes?.success && Array.isArray(portRes.data) && portRes.data.length > 0) savePortfolios(portRes.data);
      if (projRes?.success && Array.isArray(projRes.data) && projRes.data.length > 0) saveProjects(projRes.data);
      if (pricingRes?.success && Array.isArray(pricingRes.data) && pricingRes.data.length > 0) savePricingTiers(pricingRes.data);
    } catch (err) {
      console.warn('Could not fetch from backend APIs, keeping local storage state:', err);
    }
  };

  useEffect(() => {
    refreshDataFromBackend();
  }, []);

  // Leads CRUD
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> => {
    const tempLead: Lead = {
      ...leadData,
      id: `lead-${Date.now()}`,
      status: 'NEW',
      createdAt: new Date().toISOString(),
    };

    saveLeads([tempLead, ...leads]);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        saveLeads(leads.map((l) => (l.id === tempLead.id ? data.data : l)));
        showNotification('Pesan terkirim! Tersimpan di database Prisma & Supabase.', 'success');
        return data.data;
      }
    } catch (e) {
      console.error(e);
    }

    showNotification('Pesan terkirim! (Mode Lokal).', 'success');
    return tempLead;
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    saveLeads(leads.map((item) => (item.id === id ? { ...item, status } : item)));
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
    } catch (e) {
      console.error(e);
    }
    showNotification(`Status pesan #${id.slice(-4)} diubah menjadi ${status}`, 'info');
  };

  const deleteLead = async (id: string) => {
    saveLeads(leads.filter((item) => item.id !== id));
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Pesan berhasil dihapus dari database', 'warning');
  };

  const markAllLeadsRead = async () => {
    saveLeads(leads.map((item) => (item.status === 'NEW' ? { ...item, status: 'READ' } : item)));
    showNotification('Semua pesan baru telah ditandai sebagai dibaca', 'success');
  };

  const unreadLeadsCount = leads.filter((item) => item.status === 'NEW').length;

  // Portfolio CRUD
  const addPortfolio = async (item: Omit<Portfolio, 'id' | 'createdAt' | 'updatedAt'>): Promise<Portfolio> => {
    const now = new Date().toISOString();
    const tempPort: Portfolio = {
      ...item,
      id: `port-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    savePortfolios([tempPort, ...portfolios]);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success && data.data) {
        savePortfolios(portfolios.map((p) => (p.id === tempPort.id ? data.data : p)));
        showNotification('Portofolio disimpan ke database Prisma & Supabase!', 'success');
        return data.data;
      }
    } catch (e) {
      console.error(e);
    }

    showNotification('Portofolio ditambahkan (Mode Lokal).', 'success');
    return tempPort;
  };

  const updatePortfolio = async (id: string, item: Partial<Portfolio>) => {
    savePortfolios(portfolios.map((p) => (p.id === id ? { ...p, ...item, updatedAt: new Date().toISOString() } : p)));
    try {
      await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...item }),
      });
    } catch (e) {
      console.error(e);
    }
    showNotification('Data portofolio berhasil diperbarui', 'success');
  };

  const deletePortfolio = async (id: string) => {
    savePortfolios(portfolios.filter((p) => p.id !== id));
    try {
      await fetch(`/api/portfolio?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Portofolio telah dihapus dari database', 'warning');
  };

  // Projects CRUD
  const addProject = async (proj: Omit<ClientProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ClientProject> => {
    const now = new Date().toISOString();
    const tempProj: ClientProject = {
      ...proj,
      id: `proj-${Date.now()}`,
      createdAt: now,
      updatedAt: now,
    };
    saveProjects([tempProj, ...projects]);

    // Automatically generate 5 official documents (CIF, RSD, MoU, SPK, BAST)
    try {
      const autoDocs = generateAutoDocumentsForProject(tempProj);
      console.log('Auto-generated documents for project:', tempProj.id, autoDocs);
    } catch (docErr) {
      console.error('Auto document generation error:', docErr);
    }

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj),
      });
      const data = await res.json();
      if (data.success && data.data) {
        saveProjects(projects.map((p) => (p.id === tempProj.id ? data.data : p)));
        showNotification('Proyek dicatat & 5 Dokumen Operasional (CIF, RSD, MoU, SPK, BAST) dibuat otomatis!', 'success');
        return data.data;
      }
    } catch (e) {
      console.error(e);
    }

    showNotification('Proyek dicatat & 5 Dokumen Operasional (CIF, RSD, MoU, SPK, BAST) dibuat otomatis!', 'success');
    return tempProj;
  };

  const updateProject = async (id: string, proj: Partial<ClientProject>) => {
    saveProjects(projects.map((p) => (p.id === id ? { ...p, ...proj, updatedAt: new Date().toISOString() } : p)));
    try {
      await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...proj }),
      });
    } catch (e) {
      console.error(e);
    }
    showNotification('Data proyek klien berhasil diperbarui', 'success');
  };

  const deleteProject = async (id: string) => {
    saveProjects(projects.filter((p) => p.id !== id));
    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Proyek telah dihapus dari daftar manajemen', 'warning');
  };

  const updateProjectProgress = async (id: string, progress: number, status?: ProjectStatus) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    const stageCfg = getStageFromProgress(clampedProgress);
    let calculatedStatus: ProjectStatus = status || stageCfg.defaultStatus;

    saveProjects(
      projects.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          progress: clampedProgress,
          ipwStage: stageCfg.stage,
          status: calculatedStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    try {
      await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, progress: clampedProgress, ipwStage: stageCfg.stage, status: calculatedStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Pricing Tiers CRUD
  const updatePricingTier = async (id: string, updatedFields: Partial<PricingTier>) => {
    savePricingTiers(
      pricingTiers.map((tier) =>
        tier.id === id
          ? {
              ...tier,
              ...updatedFields,
              updatedAt: new Date().toISOString(),
            }
          : tier
      )
    );
    try {
      await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields }),
      });
    } catch (e) {
      console.error(e);
    }
    showNotification('Paket harga & spesifikasi diperbarui!', 'success');
  };

  const resetPricingTiersToDefault = () => {
    savePricingTiers(INITIAL_PRICING_TIERS);
    showNotification('Pricelist dikembalikan ke spesifikasi default', 'info');
  };

  // Notification Toast
  const [notification, setNotification] = useState<NotificationState>({
    open: false,
    message: '',
    severity: 'info',
  });

  const showNotification = (
    message: string,
    severity: 'success' | 'info' | 'warning' | 'error' = 'info'
  ) => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const closeNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  const resetAllDataToDefaults = () => {
    saveLeads(INITIAL_LEADS);
    savePortfolios(INITIAL_PORTFOLIOS);
    saveProjects(INITIAL_PROJECTS);
    savePricingTiers(INITIAL_PRICING_TIERS);
    saveUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USER);

    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.PORTFOLIOS);
      localStorage.removeItem(STORAGE_KEYS.PRICING);
      localStorage.removeItem(STORAGE_KEYS.USERS_LIST);
      localStorage.removeItem(STORAGE_KEYS.USER);
    } catch (e) {
      console.error(e);
    }

    showNotification('Basis data & akun pengguna berhasil direset ke data sampel awal', 'info');
  };

  return (
    <AppContext.Provider
      value={{
        themeMode,
        toggleTheme,
        activeView,
        setActiveView,
        dashboardTab,
        setDashboardTab,
        currentUser,
        login,
        logout,
        isLoginModalOpen,
        setIsLoginModalOpen,
        switchUserRole,
        users,
        addUser,
        updateUser,
        deleteUser,
        rolePermissions,
        updateRolePermission,
        resetRolePermissionsToDefault,
        hasRolePermission,
        leads,
        addLead,
        updateLeadStatus,
        deleteLead,
        markAllLeadsRead,
        unreadLeadsCount,
        portfolios,
        addPortfolio,
        updatePortfolio,
        deletePortfolio,
        projects,
        addProject,
        updateProject,
        deleteProject,
        updateProjectProgress,
        pricingTiers,
        updatePricingTier,
        resetPricingTiersToDefault,
        notification,
        showNotification,
        closeNotification,
        selectedServiceForInquiry,
        setSelectedServiceForInquiry,
        resetAllDataToDefaults,
        refreshDataFromBackend,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

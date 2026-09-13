'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { Lead, Portfolio, ClientProject, User, LeadStatus, ProjectStatus, PricingTier } from '../types';
import { INITIAL_LEADS, INITIAL_PORTFOLIOS, INITIAL_PROJECTS, INITIAL_USER, INITIAL_PRICING_TIERS } from '../data/initialData';

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
  dashboardTab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'schema';
  setDashboardTab: (tab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'schema') => void;
  
  // Auth
  currentUser: User | null;
  login: (email?: string) => boolean;
  logout: () => void;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;

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

  // View state
  const [activeView, setActiveView] = useState<'landing' | 'dashboard'>('landing');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'pricing' | 'leads' | 'portfolio' | 'projects' | 'schema'>('overview');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState('');

  // User Auth
  const [currentUser, setCurrentUser] = useState<User | null>(INITIAL_USER);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) setCurrentUser(JSON.parse(saved));
    } catch {
      setCurrentUser(INITIAL_USER);
    }
  }, []);

  const login = (email?: string) => {
    const userToSet = {
      ...INITIAL_USER,
      email: email || INITIAL_USER.email,
    };
    setCurrentUser(userToSet);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userToSet));
    } catch (e) {
      console.error(e);
    }
    showNotification(`Berhasil login sebagai ${userToSet.name}`, 'success');
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
    showNotification('Sesi admin berakhir. Anda kembali ke Laman Depan.', 'info');
  };

  // Backend state initialized with initial data
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(INITIAL_PORTFOLIOS);
  const [projects, setProjects] = useState<ClientProject[]>(INITIAL_PROJECTS);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(INITIAL_PRICING_TIERS);

  // Fetch initial data from Next.js API Routes
  const refreshDataFromBackend = async () => {
    try {
      const [leadsRes, portRes, projRes, pricingRes] = await Promise.all([
        fetch('/api/leads').then((res) => res.json()).catch(() => null),
        fetch('/api/portfolio').then((res) => res.json()).catch(() => null),
        fetch('/api/projects').then((res) => res.json()).catch(() => null),
        fetch('/api/pricing').then((res) => res.json()).catch(() => null),
      ]);

      if (leadsRes?.success && Array.isArray(leadsRes.data)) setLeads(leadsRes.data);
      if (portRes?.success && Array.isArray(portRes.data)) setPortfolios(portRes.data);
      if (projRes?.success && Array.isArray(projRes.data)) setProjects(projRes.data);
      if (pricingRes?.success && Array.isArray(pricingRes.data)) setPricingTiers(pricingRes.data);
    } catch (err) {
      console.warn('Could not fetch from backend APIs, keeping current state:', err);
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

    setLeads((prev) => [tempLead, ...prev]);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setLeads((prev) => prev.map((l) => (l.id === tempLead.id ? data.data : l)));
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
    setLeads((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
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
    setLeads((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Pesan berhasil dihapus dari database', 'warning');
  };

  const markAllLeadsRead = async () => {
    setLeads((prev) => prev.map((item) => (item.status === 'NEW' ? { ...item, status: 'READ' } : item)));
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
    setPortfolios((prev) => [tempPort, ...prev]);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setPortfolios((prev) => prev.map((p) => (p.id === tempPort.id ? data.data : p)));
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
    setPortfolios((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...item, updatedAt: new Date().toISOString() } : p))
    );
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
    setPortfolios((prev) => prev.filter((p) => p.id !== id));
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
    setProjects((prev) => [tempProj, ...prev]);

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setProjects((prev) => prev.map((p) => (p.id === tempProj.id ? data.data : p)));
        showNotification('Proyek disimpan ke Prisma & Supabase!', 'success');
        return data.data;
      }
    } catch (e) {
      console.error(e);
    }

    showNotification('Proyek klien berhasil dicatat', 'success');
    return tempProj;
  };

  const updateProject = async (id: string, proj: Partial<ClientProject>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...proj, updatedAt: new Date().toISOString() } : p))
    );
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
    setProjects((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/projects?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Proyek telah dihapus dari daftar manajemen', 'warning');
  };

  const updateProjectProgress = async (id: string, progress: number, status?: ProjectStatus) => {
    const clampedProgress = Math.max(0, Math.min(100, progress));
    let calculatedStatus: ProjectStatus = status || 'IN_PROGRESS';
    if (!status) {
      if (clampedProgress === 100) calculatedStatus = 'COMPLETED';
      else if (clampedProgress > 80) calculatedStatus = 'REVIEW';
      else if (clampedProgress > 0) calculatedStatus = 'IN_PROGRESS';
      else calculatedStatus = 'PLANNING';
    }

    setProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        return {
          ...p,
          progress: clampedProgress,
          status: calculatedStatus,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    try {
      await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, progress: clampedProgress, status: calculatedStatus }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Pricing Tiers CRUD
  const updatePricingTier = async (id: string, updatedFields: Partial<PricingTier>) => {
    setPricingTiers((prev) =>
      prev.map((tier) =>
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
    setPricingTiers(INITIAL_PRICING_TIERS);
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
    setLeads(INITIAL_LEADS);
    setPortfolios(INITIAL_PORTFOLIOS);
    setProjects(INITIAL_PROJECTS);
    setPricingTiers(INITIAL_PRICING_TIERS);
    setCurrentUser(INITIAL_USER);
    showNotification('Basis data berhasil direset ke data sampel awal', 'info');
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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { Lead, Portfolio, ClientProject, User, UserRole, LeadStatus, ProjectStatus, PricingTier, CompanyContact, Testimonial } from '../types';
import { INITIAL_LEADS, INITIAL_PORTFOLIOS, INITIAL_PROJECTS, INITIAL_USER, INITIAL_USERS, INITIAL_PRICING_TIERS, INITIAL_COMPANY_CONTACT, INITIAL_TESTIMONIALS } from '../data/initialData';
import { generateAutoDocumentsForProject } from '../lib/documentGenerator';
import { DEFAULT_ROLE_PERMISSIONS, hasPermission } from '../lib/rbac';
import { getStageFromProgress } from '../lib/ipwStages';
import { supabase } from '../lib/supabase';

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
  dashboardTab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'documents' | 'users' | 'hpp' | 'master-data' | 'contact' | 'testimonials' | 'team';
  setDashboardTab: (tab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'documents' | 'users' | 'hpp' | 'master-data' | 'contact' | 'testimonials' | 'team') => void;
  
  // Auth & RBAC
  currentUser: User | null;
  login: (email?: string, sbUser?: any) => boolean;
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

  // Company Contact (Master Data)
  companyContact: CompanyContact;
  updateCompanyContact: (data: Partial<CompanyContact>) => Promise<void>;
  resetCompanyContactToDefault: () => void;

  // Testimonials (Admin manageable)
  testimonials: Testimonial[];
  addTestimonial: (item: Omit<Testimonial, 'id'>) => Promise<Testimonial>;
  updateTestimonial: (id: string, item: Partial<Testimonial>) => Promise<void>;
  deleteTestimonial: (id: string) => Promise<void>;
  resetTestimonialsToDefault: () => void;

  // Global Notification / Toast
  notification: NotificationState;
  showNotification: (message: string, severity?: 'success' | 'info' | 'warning' | 'error') => void;
  closeNotification: () => void;

  // Quick Action / Pre-fill contact form
  selectedServiceForInquiry: string;
  setSelectedServiceForInquiry: (service: string) => void;

  // Document Navigation Selection State
  selectedDocumentProjectId: string;
  setSelectedDocumentProjectId: (id: string) => void;
  selectedDocumentType: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST';
  setSelectedDocumentType: (type: 'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST') => void;

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
  COMPANY_CONTACT: 'webdev_sys_company_contact',
  TESTIMONIALS: 'webdev_sys_testimonials',
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
    return hasPermission(role, key, rolePermissions);
  };

  // View state
  const [activeView, setActiveView] = useState<'landing' | 'dashboard'>('landing');
  const [dashboardTab, setDashboardTab] = useState<'overview' | 'pricing' | 'leads' | 'portfolio' | 'projects' | 'documents' | 'users' | 'hpp' | 'master-data' | 'contact' | 'testimonials' | 'team'>('overview');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState('');
  const [selectedDocumentProjectId, setSelectedDocumentProjectId] = useState<string>('proj-1');
  const [selectedDocumentType, setSelectedDocumentType] = useState<'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST'>('CIF');

  // Persistent States initialized from Initial Constants (to avoid SSR/Client Hydration Mismatch)
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [leads, setLeads] = useState<Lead[]>(INITIAL_LEADS);
  const [portfolios, setPortfolios] = useState<Portfolio[]>(INITIAL_PORTFOLIOS);
  const [projects, setProjects] = useState<ClientProject[]>(INITIAL_PROJECTS);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>(INITIAL_PRICING_TIERS);
  const [companyContact, setCompanyContact] = useState<CompanyContact>(INITIAL_COMPANY_CONTACT);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(INITIAL_TESTIMONIALS);

  // Restore state from LocalStorage after initial mount (hydration complete)
  useEffect(() => {
    const loadSavedState = () => {
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

        const savedContact = localStorage.getItem(STORAGE_KEYS.COMPANY_CONTACT);
        if (savedContact) setCompanyContact(JSON.parse(savedContact));

        const savedTestimonials = localStorage.getItem(STORAGE_KEYS.TESTIMONIALS);
        if (savedTestimonials) setTestimonials(JSON.parse(savedTestimonials));
      } catch (e) {
        console.error('Error restoring state from localStorage:', e);
      }
    };

    loadSavedState();

    const handleStorageChange = (e: StorageEvent) => {
      loadSavedState();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Synchronize Supabase Auth Session with App Context
  const syncSupabaseUser = (sbUser: any) => {
    if (!sbUser || !sbUser.email) return;
    const userEmail = sbUser.email;
    const metadata = sbUser.user_metadata || {};
    const existingUser = users.find((u) => u.email.toLowerCase() === userEmail.toLowerCase());

    const syncedUser: User = existingUser || {
      id: sbUser.id || `usr-${Date.now()}`,
      email: userEmail,
      name: metadata.full_name || metadata.name || userEmail.split('@')[0] || 'Pengguna Supabase',
      role: (metadata.role as UserRole) || 'CEO',
      status: 'ACTIVE',
      avatarUrl: metadata.avatar_url || '',
      createdAt: sbUser.created_at || new Date().toISOString(),
    };

    setCurrentUser(syncedUser);
    try {
      localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(syncedUser));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    // 1. Check existing session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    // 2. Real-time auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        syncSupabaseUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [users]);

  // Helper State Setters with Automatic LocalStorage Sync (using functional state updates)
  const saveUsers = (next: User[] | ((prev: User[]) => User[])) => {
    setUsers((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const saveLeads = (next: Lead[] | ((prev: Lead[]) => Lead[])) => {
    setLeads((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.LEADS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const savePortfolios = (next: Portfolio[] | ((prev: Portfolio[]) => Portfolio[])) => {
    setPortfolios((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.PORTFOLIOS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const saveProjects = (next: ClientProject[] | ((prev: ClientProject[]) => ClientProject[])) => {
    setProjects((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const savePricingTiers = (next: PricingTier[] | ((prev: PricingTier[]) => PricingTier[])) => {
    setPricingTiers((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.PRICING, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const saveCompanyContact = (next: CompanyContact | ((prev: CompanyContact) => CompanyContact)) => {
    setCompanyContact((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.COMPANY_CONTACT, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.USER);
      if (saved) {
        const parsed = JSON.parse(saved);
        const existing = users.find((u) => u.id === parsed.id || u.email?.toLowerCase() === parsed.email?.toLowerCase() || (u.role === parsed.role && ['CEO', 'CTO', 'CMO'].includes(u.role)));
        if (existing) {
          const merged = { ...parsed, ...existing };
          setCurrentUser(merged);
        } else {
          setCurrentUser(parsed);
        }
      } else {
        setCurrentUser(null);
      }
    } catch {
      setCurrentUser(null);
    }
  }, [users]);

  // Keep currentUser continuously in sync with the matching user in `users` list
  useEffect(() => {
    if (!currentUser) return;
    const matched = users.find(
      (u) =>
        u.id === currentUser.id ||
        (u.email && currentUser.email && u.email.toLowerCase() === currentUser.email.toLowerCase()) ||
        (u.role === currentUser.role && ['CEO', 'CTO', 'CMO'].includes(u.role))
    );
    if (matched) {
      if (
        matched.avatarUrl !== currentUser.avatarUrl ||
        matched.name !== currentUser.name ||
        matched.role !== currentUser.role ||
        matched.company !== currentUser.company
      ) {
        const updated = { ...currentUser, ...matched };
        setCurrentUser(updated);
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
        } catch (e) {
          console.error(e);
        }
      }
    }
  }, [users, currentUser?.id, currentUser?.email, currentUser?.role]);

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

  const login = (email?: string, sbUser?: any) => {
    if (sbUser) {
      syncSupabaseUser(sbUser);
      showNotification(`Berhasil login via Supabase Auth (${sbUser.email})`, 'success');
      return true;
    }
    const targetEmail = email || INITIAL_USER.email;
    const foundUser = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase()) || {
      ...INITIAL_USER,
      email: targetEmail,
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
      supabase.auth.signOut();
    } catch (e) {
      console.error(e);
    }
    setActiveView('landing');
    showNotification('Logout berhasil', 'info');
  };

  // User Management
  const addUser = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<User> => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    saveUsers((prev) => [...prev, newUser]);

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (data.success && data.data) {
        saveUsers((prev) => prev.map((u) => (u.email === newUser.email ? data.data : u)));
      }
    } catch (e) {
      console.error('Database user create sync error:', e);
    }

    showNotification(`Pengguna ${newUser.name} [${newUser.role}] berhasil ditambahkan`, 'success');
    return newUser;
  };

  const updateUser = async (id: string, fields: Partial<User>) => {
    saveUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...fields } : u)));
    if (
      currentUser?.id === id ||
      (currentUser?.email && fields.email && currentUser.email.toLowerCase() === fields.email.toLowerCase()) ||
      (currentUser?.role && fields.role && currentUser.role === fields.role)
    ) {
      setCurrentUser((prev) => {
        const updated = prev ? { ...prev, ...fields } : null;
        if (updated) {
          try {
            localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
          } catch (e) {
            console.error(e);
          }
        }
        return updated;
      });
    }

    try {
      await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...fields }),
      });
    } catch (e) {
      console.error('Database user update sync error:', e);
    }

    showNotification('Data pengguna & hak akses RBAC berhasil diperbarui!', 'success');
  };

  const deleteUser = async (id: string) => {
    saveUsers((prev) => prev.filter((u) => u.id !== id));
    try {
      await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Database user delete sync error:', e);
    }
    showNotification('Pengguna telah dihapus dari sistem', 'warning');
  };

  // Fetch initial data from Next.js API Routes (only if local storage is completely empty)
  const refreshDataFromBackend = async () => {
    try {
      const [leadsRes, portRes, projRes, pricingRes, usersRes] = await Promise.all([
        fetch('/api/leads').then((res) => res.json()).catch(() => null),
        fetch('/api/portfolio').then((res) => res.json()).catch(() => null),
        fetch('/api/projects').then((res) => res.json()).catch(() => null),
        fetch('/api/pricing').then((res) => res.json()).catch(() => null),
        fetch('/api/users').then((res) => res.json()).catch(() => null),
      ]);

      const hasLocalLeads = typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.LEADS);
      const hasLocalPortfolios = typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.PORTFOLIOS);
      const hasLocalProjects = typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.PROJECTS);
      const hasLocalPricing = typeof window !== 'undefined' && !!localStorage.getItem(STORAGE_KEYS.PRICING);

      if (usersRes?.success && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        saveUsers(usersRes.data);
      }

      if (!hasLocalLeads && leadsRes?.success && Array.isArray(leadsRes.data) && leadsRes.data.length > 0) {
        saveLeads(leadsRes.data);
      }

      if (!hasLocalPortfolios && portRes?.success && Array.isArray(portRes.data) && portRes.data.length > 0) {
        savePortfolios(portRes.data);
      }

      if (!hasLocalProjects && projRes?.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
        saveProjects(projRes.data);
      }

      if (!hasLocalPricing && pricingRes?.success && Array.isArray(pricingRes.data) && pricingRes.data.length > 0) {
        savePricingTiers(pricingRes.data);
      }
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

    saveLeads((prev) => [tempLead, ...prev]);

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadData),
      });
      const data = await res.json();
      if (data.success && data.data && !data.fallback) {
        saveLeads((prev) => prev.map((l) => (l.id === tempLead.id ? data.data : l)));
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
    saveLeads((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
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
    saveLeads((prev) => prev.filter((item) => item.id !== id));
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Pesan berhasil dihapus dari database', 'warning');
  };

  const markAllLeadsRead = async () => {
    saveLeads((prev) => prev.map((item) => (item.status === 'NEW' ? { ...item, status: 'READ' } : item)));
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
    savePortfolios((prev) => [tempPort, ...prev]);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success && data.data && !data.fallback) {
        savePortfolios((prev) => prev.map((p) => (p.id === tempPort.id ? data.data : p)));
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
    savePortfolios((prev) => prev.map((p) => (p.id === id ? { ...p, ...item, updatedAt: new Date().toISOString() } : p)));
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
    savePortfolios((prev) => prev.filter((p) => p.id !== id));
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
    saveProjects((prev) => [tempProj, ...prev]);

    // Auto-create CLIENT user if clientEmail does not exist in users list
    let createdClientEmail = '';
    if (proj.clientEmail && proj.clientEmail.trim()) {
      const emailLower = proj.clientEmail.trim().toLowerCase();
      const existingUser = users.find((u) => u.email.toLowerCase() === emailLower);
      if (!existingUser) {
        createdClientEmail = proj.clientEmail.trim();
        const newClientUser: User = {
          id: `usr-client-${Date.now()}`,
          email: createdClientEmail,
          name: proj.clientName.trim() || createdClientEmail.split('@')[0],
          company: proj.clientCompany || proj.clientName.trim(),
          role: 'CLIENT',
          status: 'ACTIVE',
          password: 'joinatasilabs',
          avatarUrl: '',
          createdAt: now,
        };
        saveUsers((prev) => [...prev, newClientUser]);

        // Attempt Supabase Auth registration
        try {
          supabase.auth.signUp({
            email: createdClientEmail,
            password: 'joinatasilabs',
            options: {
              data: {
                full_name: proj.clientName.trim(),
                role: 'CLIENT',
              },
            },
          });
        } catch (authErr) {
          console.error('Auto register client Supabase Auth error:', authErr);
        }
      }
    }

    // Automatically generate 5 official documents (CIF, RSD, MoU, SPK, BAST) and lock them for this project
    try {
      const autoDocs = generateAutoDocumentsForProject(tempProj);
      if (typeof window !== 'undefined') {
        const key = 'atasilabs_custom_project_documents';
        const existingStr = localStorage.getItem(key);
        const existingDocs = existingStr ? JSON.parse(existingStr) : {};
        existingDocs[tempProj.id] = autoDocs;
        localStorage.setItem(key, JSON.stringify(existingDocs));
      }
      console.log('Auto-generated & locked documents for project:', tempProj.id, autoDocs);
    } catch (docErr) {
      console.error('Auto document generation error:', docErr);
    }

    const clientMsg = createdClientEmail
      ? ` & Akun Klien [${createdClientEmail}] dibuat otomatis (Password: joinatasilabs)`
      : '';

    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(proj),
      });
      const data = await res.json();
      if (data.success && data.data && !data.fallback) {
        saveProjects((prev) => prev.map((p) => (p.id === tempProj.id ? data.data : p)));
        showNotification(`Proyek dicatat & 5 Dokumen Operasional dibuat otomatis${clientMsg}!`, 'success');
        return data.data;
      }
    } catch (e) {
      console.error(e);
    }

    showNotification(`Proyek dicatat & 5 Dokumen Operasional dibuat otomatis${clientMsg}!`, 'success');
    return tempProj;
  };

  const updateProject = async (id: string, proj: Partial<ClientProject>) => {
    saveProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...proj, updatedAt: new Date().toISOString() } : p)));
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
    saveProjects((prev) => prev.filter((p) => p.id !== id));
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

    saveProjects((prev) =>
      prev.map((p) => {
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
        body: JSON.stringify({
          id,
          progress: clampedProgress,
          status: calculatedStatus,
          ipwStage: stageCfg.stage,
        }),
      });
    } catch (e) {
      console.error(e);
    }
    showNotification(`Progress proyek diubah menjadi ${clampedProgress}% (${stageCfg.label})`, 'info');
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

  const updateCompanyContact = async (updatedFields: Partial<CompanyContact>) => {
    saveCompanyContact((prev) => ({
      ...prev,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }));
    showNotification('Data kontak perusahaan berhasil diperbarui!', 'success');
  };

  const resetCompanyContactToDefault = () => {
    saveCompanyContact(INITIAL_COMPANY_CONTACT);
    showNotification('Data kontak dikembalikan ke konfigurasi default', 'info');
  };

  // Testimonials Management
  const addTestimonial = async (item: Omit<Testimonial, 'id'>): Promise<Testimonial> => {
    const newTesti: Testimonial = {
      ...item,
      id: `testi-${Date.now()}`,
    };
    setTestimonials((prev) => {
      const updated = [newTesti, ...prev];
      try {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showNotification('Testimoni baru berhasil ditambahkan!', 'success');
    return newTesti;
  };

  const updateTestimonial = async (id: string, item: Partial<Testimonial>): Promise<void> => {
    setTestimonials((prev) => {
      const updated = prev.map((t) => (t.id === id ? { ...t, ...item } : t));
      try {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showNotification('Data testimoni berhasil diperbarui!', 'success');
  };

  const deleteTestimonial = async (id: string): Promise<void> => {
    setTestimonials((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      try {
        localStorage.setItem(STORAGE_KEYS.TESTIMONIALS, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    showNotification('Testimoni berhasil dihapus!', 'info');
  };

  const resetTestimonialsToDefault = () => {
    setTestimonials(INITIAL_TESTIMONIALS);
    try {
      localStorage.removeItem(STORAGE_KEYS.TESTIMONIALS);
    } catch (e) {
      console.error(e);
    }
    showNotification('Testimoni dikembalikan ke data default', 'info');
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
    saveCompanyContact(INITIAL_COMPANY_CONTACT);
    saveUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USER);

    try {
      localStorage.removeItem(STORAGE_KEYS.PROJECTS);
      localStorage.removeItem(STORAGE_KEYS.LEADS);
      localStorage.removeItem(STORAGE_KEYS.PORTFOLIOS);
      localStorage.removeItem(STORAGE_KEYS.PRICING);
      localStorage.removeItem(STORAGE_KEYS.COMPANY_CONTACT);
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
        companyContact,
        updateCompanyContact,
        resetCompanyContactToDefault,
        testimonials,
        addTestimonial,
        updateTestimonial,
        deleteTestimonial,
        resetTestimonialsToDefault,
        notification,
        showNotification,
        closeNotification,
        selectedServiceForInquiry,
        setSelectedServiceForInquiry,
        selectedDocumentProjectId,
        setSelectedDocumentProjectId,
        selectedDocumentType,
        setSelectedDocumentType,
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

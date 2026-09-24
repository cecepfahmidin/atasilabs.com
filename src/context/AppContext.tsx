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

  // Dynamic RBAC Permissions State (persisted via DB /api/rbac)
  const [rolePermissions, setRolePermissions] = useState<Record<UserRole, Record<string, boolean>>>(DEFAULT_ROLE_PERMISSIONS);

  const updateRolePermission = async (role: UserRole, key: string, allowed: boolean) => {
    const updated = {
      ...rolePermissions,
      [role]: {
        ...(rolePermissions[role] || {}),
        [key]: allowed,
      },
    };
    setRolePermissions(updated);

    try {
      await fetch('/api/rbac', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: updated }),
      });
    } catch (e) {
      console.error('Database update RBAC error:', e);
    }
    showNotification(`Hak akses '${key}' untuk role [${role}] telah diubah menjadi: ${allowed ? 'DIIZINKAN' : 'DIBLOKIR'}`, 'info');
  };

  const resetRolePermissionsToDefault = async () => {
    setRolePermissions(DEFAULT_ROLE_PERMISSIONS);
    try {
      await fetch('/api/rbac', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ permissions: DEFAULT_ROLE_PERMISSIONS }),
      });
    } catch (e) {
      console.error('Database reset RBAC error:', e);
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

  // Restore persisted current user on client mount
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem(STORAGE_KEYS.USER);
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed && parsed.email) {
          setCurrentUser(parsed);
        }
      }
    } catch (e) {
      console.error('Failed to load user from localStorage:', e);
    }
  }, []);

  // Always fetch fresh data directly from Database APIs on mount
  useEffect(() => {
    refreshDataFromBackend();
  }, []);

  const updateCurrentUserState = (user: User | null) => {
    setCurrentUser(user);
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(STORAGE_KEYS.USER);
      }
    } catch (e) {
      console.error(e);
    }
  };

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

    updateCurrentUserState(syncedUser);
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

  // Helper State Setters (pure state updates, DB APIs handle persistence)
  const saveUsers = (next: User[] | ((prev: User[]) => User[])) => {
    setUsers((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      try {
        localStorage.setItem(STORAGE_KEYS.USERS_LIST, JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save users list to localStorage:', e);
      }
      return updated;
    });
  };

  const saveLeads = (next: Lead[] | ((prev: Lead[]) => Lead[])) => {
    setLeads((prev) => (typeof next === 'function' ? next(prev) : next));
  };

  const savePortfolios = (next: Portfolio[] | ((prev: Portfolio[]) => Portfolio[])) => {
    setPortfolios((prev) => (typeof next === 'function' ? next(prev) : next));
  };

  const saveProjects = (next: ClientProject[] | ((prev: ClientProject[]) => ClientProject[])) => {
    setProjects((prev) => (typeof next === 'function' ? next(prev) : next));
  };

  const savePricingTiers = (next: PricingTier[] | ((prev: PricingTier[]) => PricingTier[])) => {
    setPricingTiers((prev) => (typeof next === 'function' ? next(prev) : next));
  };

  const saveCompanyContact = (next: CompanyContact | ((prev: CompanyContact) => CompanyContact)) => {
    setCompanyContact((prev) => (typeof next === 'function' ? next(prev) : next));
  };

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
        updateCurrentUserState(updated);
      }
    }
  }, [users, currentUser?.id, currentUser?.email, currentUser?.role]);

  const switchUserRole = (userId: string) => {
    const targetUser = users.find((u) => u.id === userId);
    if (targetUser) {
      updateCurrentUserState(targetUser);
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
    updateCurrentUserState(foundUser);
    showNotification(`Berhasil login sebagai ${foundUser.name} [${foundUser.role}]`, 'success');
    return true;
  };

  const logout = () => {
    updateCurrentUserState(null);
    try {
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
      setCurrentUser((prev) => (prev ? { ...prev, ...fields } : null));
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

  // Fetch initial data from Next.js API Routes (unconditionally from DB)
  const refreshDataFromBackend = async () => {
    try {
      const [leadsRes, portRes, projRes, pricingRes, usersRes, testiRes, contactRes, rbacRes] = await Promise.all([
        fetch('/api/leads').then((res) => res.json()).catch(() => null),
        fetch('/api/portfolio').then((res) => res.json()).catch(() => null),
        fetch('/api/projects').then((res) => res.json()).catch(() => null),
        fetch('/api/pricing').then((res) => res.json()).catch(() => null),
        fetch('/api/users').then((res) => res.json()).catch(() => null),
        fetch('/api/testimonials').then((res) => res.json()).catch(() => null),
        fetch('/api/contact').then((res) => res.json()).catch(() => null),
        fetch('/api/rbac').then((res) => res.json()).catch(() => null),
      ]);

      if (usersRes?.success && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
        saveUsers(usersRes.data);
      }

      if (leadsRes?.success && Array.isArray(leadsRes.data) && leadsRes.data.length > 0) {
        saveLeads(leadsRes.data);
      }

      if (portRes?.success && Array.isArray(portRes.data) && portRes.data.length > 0) {
        savePortfolios(portRes.data);
      }

      if (projRes?.success && Array.isArray(projRes.data) && projRes.data.length > 0) {
        saveProjects(projRes.data);
      }

      if (pricingRes?.success && Array.isArray(pricingRes.data) && pricingRes.data.length > 0) {
        savePricingTiers(pricingRes.data);
      }

      if (testiRes?.success && Array.isArray(testiRes.data) && testiRes.data.length > 0) {
        setTestimonials(testiRes.data);
      }

      if (contactRes?.success && contactRes.data) {
        setCompanyContact(contactRes.data);
      }

      if (rbacRes?.success && rbacRes.data) {
        setRolePermissions(rbacRes.data);
      }
    } catch (err) {
      console.warn('Could not fetch from backend APIs:', err);
    }
  };

  // Leads CRUD
  const addLead = async (leadData: Omit<Lead, 'id' | 'createdAt' | 'status'>): Promise<Lead> => {
    const emailMatch = leadData.email ? leadData.email.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/) : null;
    const cleanEmail = emailMatch ? emailMatch[0] : (leadData.email || '').trim();
    const cleanLeadData = { ...leadData, email: cleanEmail };

    const tempLead: Lead = {
      ...cleanLeadData,
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
    const unreadIds = leads.filter((item) => item.status === 'NEW').map((l) => l.id);
    saveLeads((prev) => prev.map((item) => (item.status === 'NEW' ? { ...item, status: 'READ' } : item)));

    try {
      await Promise.all(
        unreadIds.map((id) =>
          fetch('/api/leads', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, status: 'READ' }),
          })
        )
      );
    } catch (e) {
      console.error('Database markAllLeadsRead sync error:', e);
    }
    showNotification('Semua pesan baru telah ditandai sebagai dibaca & tersimpan di Database', 'success');
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
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...proj }),
      });
      const data = await res.json();
      if (data.success && data.data) {
        saveProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...data.data } : p)));
      }
    } catch (e) {
      console.error(e);
    }
    showNotification('Data proyek klien berhasil diperbarui ke Database!', 'success');
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

  const resetPricingTiersToDefault = async () => {
    savePricingTiers(INITIAL_PRICING_TIERS);
    try {
      await Promise.all(
        INITIAL_PRICING_TIERS.map((tier) =>
          fetch('/api/pricing', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(tier),
          })
        )
      );
    } catch (e) {
      console.error('Database reset pricing tiers error:', e);
    }
    showNotification('Pricelist dikembalikan ke spesifikasi default & tersimpan ke Database', 'info');
  };

  const updateCompanyContact = async (updatedFields: Partial<CompanyContact>) => {
    setCompanyContact((prev) => ({
      ...prev,
      ...updatedFields,
      updatedAt: new Date().toISOString(),
    }));
    try {
      await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      });
    } catch (e) {
      console.error('Database update contact error:', e);
    }
    showNotification('Data kontak perusahaan berhasil diperbarui ke Database!', 'success');
  };

  const resetCompanyContactToDefault = async () => {
    saveCompanyContact(INITIAL_COMPANY_CONTACT);
    try {
      await fetch('/api/contact', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(INITIAL_COMPANY_CONTACT),
      });
    } catch (e) {
      console.error('Database reset contact error:', e);
    }
    showNotification('Data kontak dikembalikan ke konfigurasi default & tersimpan ke Database', 'info');
  };

  // Testimonials Management
  const addTestimonial = async (item: Omit<Testimonial, 'id'>): Promise<Testimonial> => {
    const newTesti: Testimonial = {
      ...item,
      id: `testi-${Date.now()}`,
    };
    setTestimonials((prev) => [newTesti, ...prev]);

    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      const data = await res.json();
      if (data.success && data.data) {
        setTestimonials((prev) => prev.map((t) => (t.id === newTesti.id ? data.data : t)));
      }
    } catch (e) {
      console.error('Database add testimonial error:', e);
    }

    showNotification('Testimoni baru berhasil ditambahkan ke Database!', 'success');
    return newTesti;
  };

  const updateTestimonial = async (id: string, item: Partial<Testimonial>): Promise<void> => {
    setTestimonials((prev) => prev.map((t) => (t.id === id ? { ...t, ...item } : t)));
    try {
      await fetch('/api/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...item }),
      });
    } catch (e) {
      console.error('Database update testimonial error:', e);
    }
    showNotification('Data testimoni berhasil diperbarui ke Database!', 'success');
  };

  const deleteTestimonial = async (id: string): Promise<void> => {
    setTestimonials((prev) => prev.filter((t) => t.id !== id));
    try {
      await fetch(`/api/testimonials?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
    } catch (e) {
      console.error('Database delete testimonial error:', e);
    }
    showNotification('Testimoni berhasil dihapus dari Database!', 'info');
  };

  const resetTestimonialsToDefault = async () => {
    setTestimonials(INITIAL_TESTIMONIALS);
    try {
      await Promise.all(
        INITIAL_TESTIMONIALS.map((testi) =>
          fetch('/api/testimonials', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(testi),
          })
        )
      );
    } catch (e) {
      console.error('Database reset testimonials error:', e);
    }
    showNotification('Testimoni dikembalikan ke data default & tersimpan ke Database', 'info');
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

  const resetAllDataToDefaults = async () => {
    saveLeads(INITIAL_LEADS);
    savePortfolios(INITIAL_PORTFOLIOS);
    saveProjects(INITIAL_PROJECTS);
    savePricingTiers(INITIAL_PRICING_TIERS);
    saveCompanyContact(INITIAL_COMPANY_CONTACT);
    saveUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USER);
    try {
      await Promise.all([
        resetPricingTiersToDefault(),
        resetCompanyContactToDefault(),
        resetTestimonialsToDefault(),
        resetRolePermissionsToDefault(),
      ]);
    } catch (e) {
      console.error('Reset all data error:', e);
    }
    showNotification('Basis data & akun pengguna berhasil direset ke data sampel awal di Database', 'info');
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

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { PaletteMode } from '@mui/material';
import { Lead, Portfolio, ClientProject, User, UserRole, LeadStatus, ProjectStatus, PricingTier, CompanyContact, Testimonial } from '../types';
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
  dashboardTab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'documents' | 'payments' | 'users' | 'hpp' | 'master-data' | 'contact' | 'testimonials' | 'team' | 'freelancer-fee' | 'whatsapp';
  setDashboardTab: (tab: 'overview' | 'leads' | 'portfolio' | 'projects' | 'pricing' | 'documents' | 'payments' | 'users' | 'hpp' | 'master-data' | 'contact' | 'testimonials' | 'team' | 'freelancer-fee' | 'whatsapp') => void;
  
  // Data Loading Status
  isLoadingData: boolean;

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
  updateLead: (id: string, updates: Partial<Lead>) => Promise<void>;
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
  
  type DashboardTab = 'overview' | 'pricing' | 'leads' | 'portfolio' | 'projects' | 'documents' | 'payments' | 'users' | 'hpp' | 'master-data' | 'contact' | 'testimonials' | 'team' | 'freelancer-fee' | 'whatsapp';

  const [dashboardTab, setDashboardTabState] = useState<DashboardTab>(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedTab = localStorage.getItem('webdev_sys_dashboard_tab') as DashboardTab | null;
        if (savedTab) return savedTab;
      } catch (e) {}
    }
    return 'overview';
  });

  const setDashboardTab = (tab: DashboardTab) => {
    setDashboardTabState(tab);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('webdev_sys_dashboard_tab', tab);
      } catch (e) {}
    }
  };

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedServiceForInquiry, setSelectedServiceForInquiry] = useState('');
  const [selectedDocumentProjectId, setSelectedDocumentProjectId] = useState<string>('proj-1');
  const [selectedDocumentType, setSelectedDocumentType] = useState<'CIF' | 'RSD' | 'MOU' | 'SPK' | 'BAST'>('CIF');

  // Loading state
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  // States initialized - currentUser restored synchronously from localStorage to prevent logout on reload
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const cached = localStorage.getItem('webdev_sys_auth_user');
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {
        console.warn('Error reading cached auth user:', e);
      }
    }
    return null;
  });
  const [leads, setLeads] = useState<Lead[]>([]);
  const [portfolios, setPortfolios] = useState<Portfolio[]>([]);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [pricingTiers, setPricingTiers] = useState<PricingTier[]>([]);
  const [companyContact, setCompanyContact] = useState<CompanyContact>({
    companyName: 'Atasi Labs',
    subtitle: 'Enterprise Web & AI Studio',
    description: 'Studio pengembangan web dan software skala enterprise.',
    email: 'contact@atasilabs.com',
    phone: '081234567890',
    whatsapp: '081234567890',
    whatsappRaw: '6281234567890',
    address: 'Jakarta, Indonesia',
    workingHours: 'Senin - Jumat: 09:00 - 17:00 WIB',
    facebookUrl: '',
    instagramUrl: '',
    ndaNotice: 'Kerahasiaan data terjamin',
  });
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);

  // Always fetch fresh data directly from Database APIs on mount
  useEffect(() => {
    // Ensure no stale pricing data remains in localStorage - purely database-driven
    try {
      localStorage.removeItem('webdev_sys_pricing_tiers');
    } catch (e) {}

    refreshDataFromBackend();
  }, []);

  const updateCurrentUserState = (user: User | null) => {
    setCurrentUser(user);
    if (typeof window !== 'undefined') {
      try {
        if (user) {
          localStorage.setItem('webdev_sys_auth_user', JSON.stringify(user));
        } else {
          localStorage.removeItem('webdev_sys_auth_user');
        }
      } catch (e) {
        console.warn('Error syncing auth user to localStorage:', e);
      }
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

  // 3. Instant Real-Time WebSocket Listener for Database Changes & Cross-Tab Broadcast
  useEffect(() => {
    const realtimeChannel = supabase
      .channel('public_realtime_db_changes', {
        config: {
          broadcast: { self: false },
        },
      })
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ClientProject' },
        (payload) => {
          console.log('⚡ Supabase Realtime ClientProject change payload:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const raw = payload.new as any;
            if (raw && raw.id) {
              const formattedProject: ClientProject = {
                ...raw,
                payments: Array.isArray(raw.payments)
                  ? raw.payments
                  : typeof raw.payments === 'string'
                  ? JSON.parse(raw.payments)
                  : [],
                totalPaid: raw.totalPaid !== null && raw.totalPaid !== undefined ? Number(raw.totalPaid) : 0,
                freelancerPayments: Array.isArray(raw.freelancerPayments)
                  ? raw.freelancerPayments
                  : typeof raw.freelancerPayments === 'string'
                  ? JSON.parse(raw.freelancerPayments)
                  : [],
                freelancerTotalPaid: raw.freelancerTotalPaid !== null && raw.freelancerTotalPaid !== undefined ? Number(raw.freelancerTotalPaid) : 0,
              };

              saveProjects((prev) => {
                const index = prev.findIndex((p) => p.id === formattedProject.id);
                if (index >= 0) {
                  const copy = [...prev];
                  copy[index] = { ...copy[index], ...formattedProject };
                  return copy;
                }
                return [formattedProject, ...prev];
              });
            }
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              saveProjects((prev) => prev.filter((p) => p.id !== payload.old.id));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'Lead' },
        (payload) => {
          console.log('⚡ Supabase Realtime Lead change payload:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const rawLead = payload.new as Lead;
            if (rawLead && rawLead.id) {
              saveLeads((prev) => {
                const index = prev.findIndex(
                  (l) =>
                    l.id === rawLead.id ||
                    ((l.email || '').toLowerCase().trim() === (rawLead.email || '').toLowerCase().trim() &&
                      (l.message || '').toLowerCase().trim() === (rawLead.message || '').toLowerCase().trim())
                );
                if (index >= 0) {
                  const copy = [...prev];
                  copy[index] = { ...copy[index], ...rawLead };
                  return copy;
                }
                return [rawLead, ...prev];
              });
            }
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              saveLeads((prev) => prev.filter((l) => l.id !== payload.old.id));
            }
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'CustomDocument' },
        (payload) => {
          console.log('⚡ Supabase Realtime CustomDocument change payload:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const raw = payload.new as any;
            if (raw && raw.projectId && raw.data) {
              const dataObj = typeof raw.data === 'string' ? JSON.parse(raw.data) : raw.data;
              try {
                window.dispatchEvent(new CustomEvent('atasilabs_document_updated', { detail: { projectId: raw.projectId, data: dataObj } }));
              } catch (e) {
                console.error(e);
              }
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'PROJECT_UPDATE' },
        ({ payload }) => {
          console.log('⚡ Broadcast PROJECT_UPDATE received:', payload);
          if (payload && payload.id) {
            saveProjects((prev) => {
              const index = prev.findIndex((p) => p.id === payload.id);
              if (index >= 0) {
                const copy = [...prev];
                copy[index] = { ...copy[index], ...payload };
                return copy;
              }
              return [payload, ...prev];
            });
          }
        }
      )
      .on(
        'broadcast',
        { event: 'PROJECT_DELETE' },
        ({ payload }) => {
          console.log('⚡ Broadcast PROJECT_DELETE received:', payload);
          if (payload && payload.id) {
            saveProjects((prev) => prev.filter((p) => p.id !== payload.id));
          }
        }
      )
      .on(
        'broadcast',
        { event: 'DOCUMENT_UPDATE' },
        ({ payload }) => {
          console.log('⚡ Broadcast DOCUMENT_UPDATE received:', payload);
          if (payload && payload.projectId && payload.data) {
            try {
              window.dispatchEvent(new CustomEvent('atasilabs_document_updated', { detail: { projectId: payload.projectId, data: payload.data } }));
            } catch (e) {
              console.error(e);
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'LEAD_UPDATE' },
        ({ payload }) => {
          console.log('⚡ Broadcast LEAD_UPDATE received:', payload);
          if (payload && payload.id) {
            saveLeads((prev) => {
              const index = prev.findIndex(
                (l) =>
                  l.id === payload.id ||
                  ((l.email || '').toLowerCase().trim() === (payload.email || '').toLowerCase().trim() &&
                    (l.message || '').toLowerCase().trim() === (payload.message || '').toLowerCase().trim())
              );
              if (index >= 0) {
                const copy = [...prev];
                copy[index] = { ...copy[index], ...payload };
                return copy;
              }
              return [payload, ...prev];
            });
          }
        }
      )
      .on(
        'broadcast',
        { event: 'LEAD_DELETE' },
        ({ payload }) => {
          console.log('⚡ Broadcast LEAD_DELETE received:', payload);
          if (payload && payload.id) {
            saveLeads((prev) => prev.filter((l) => l.id !== payload.id));
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'PricingTier' },
        (payload) => {
          console.log('⚡ Supabase Realtime PricingTier change payload:', payload);
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const raw = payload.new as any;
            if (raw && raw.id) {
              const formattedTier: PricingTier = {
                ...raw,
                active: raw.active !== false,
                features: Array.isArray(raw.features)
                  ? raw.features
                  : typeof raw.features === 'string'
                  ? JSON.parse(raw.features)
                  : [],
                specs: Array.isArray(raw.specs)
                  ? raw.specs
                  : typeof raw.specs === 'string'
                  ? JSON.parse(raw.specs)
                  : [],
              };

              savePricingTiers((prev) => {
                const index = prev.findIndex((t) => t.id === formattedTier.id);
                if (index >= 0) {
                  const copy = [...prev];
                  copy[index] = { ...copy[index], ...formattedTier };
                  return copy;
                }
                return [...prev, formattedTier].sort((a, b) => a.tierNumber - b.tierNumber);
              });
            }
          } else if (payload.eventType === 'DELETE') {
            if (payload.old && payload.old.id) {
              savePricingTiers((prev) => prev.filter((t) => t.id !== payload.old.id));
            }
          }
        }
      )
      .on(
        'broadcast',
        { event: 'PRICING_UPDATE' },
        ({ payload }) => {
          console.log('⚡ Broadcast PRICING_UPDATE received:', payload);
          if (payload && payload.id) {
            savePricingTiers((prev) => {
              const index = prev.findIndex((t) => t.id === payload.id);
              if (index >= 0) {
                const copy = [...prev];
                copy[index] = { ...copy[index], ...payload, active: payload.active !== false };
                return copy;
              }
              return [...prev, { ...payload, active: payload.active !== false }].sort((a, b) => a.tierNumber - b.tierNumber);
            });
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Supabase Realtime Connection Status:', status);
      });

    // Real-time listener for cross-tab or local storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.PROJECTS && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          if (Array.isArray(parsed)) {
            setProjects(parsed);
          }
        } catch (err) {}
      }
    };

    const handleCustomProjectUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail && Array.isArray(customEvt.detail)) {
        setProjects(customEvt.detail);
      }
    };

    const handleCustomPricingUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      if (customEvt.detail && Array.isArray(customEvt.detail)) {
        setPricingTiers(customEvt.detail);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('atasilabs_projects_updated', handleCustomProjectUpdate);
    window.addEventListener('atasilabs_pricing_updated', handleCustomPricingUpdate);

    return () => {
      supabase.removeChannel(realtimeChannel);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('atasilabs_projects_updated', handleCustomProjectUpdate);
      window.removeEventListener('atasilabs_pricing_updated', handleCustomPricingUpdate);
    };
  }, []);

  // Helper State Setters (pure state updates, DB APIs handle persistence)
  const saveUsers = (next: User[] | ((prev: User[]) => User[])) => {
    setUsers((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      const seen = new Set<string>();
      const deduplicated: User[] = [];
      for (const u of updated) {
        if (u && u.id) {
          if (!seen.has(u.id)) {
            seen.add(u.id);
            deduplicated.push(u);
          }
        }
      }
      return deduplicated;
    });
  };

  const saveLeads = (next: Lead[] | ((prev: Lead[]) => Lead[])) => {
    setLeads((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      const seenIds = new Set<string>();
      const seenContentKeys = new Set<string>();
      const deduplicated: Lead[] = [];

      for (const item of updated) {
        if (!item || !item.id) continue;

        const emailKey = (item.email || '').toLowerCase().trim();
        const msgKey = (item.message || '').toLowerCase().trim();
        const contentKey = emailKey && msgKey ? `${emailKey}::${msgKey}` : '';

        // If exact ID seen before, skip
        if (seenIds.has(item.id)) {
          continue;
        }

        // If same email & message content seen before, merge/prefer real DB ID over temporary 'lead-' ID
        if (contentKey && seenContentKeys.has(contentKey)) {
          const existingIdx = deduplicated.findIndex((existing) => {
            const eK = (existing.email || '').toLowerCase().trim();
            const mK = (existing.message || '').toLowerCase().trim();
            return `${eK}::${mK}` === contentKey;
          });

          if (existingIdx >= 0) {
            const existing = deduplicated[existingIdx];
            // If existing is temporary 'lead-...' and new item is a permanent DB ID (or has more fields), replace it
            if (existing.id.startsWith('lead-') && !item.id.startsWith('lead-')) {
              seenIds.delete(existing.id);
              deduplicated[existingIdx] = item;
              seenIds.add(item.id);
            }
          }
          continue;
        }

        seenIds.add(item.id);
        if (contentKey) {
          seenContentKeys.add(contentKey);
        }
        deduplicated.push(item);
      }

      return deduplicated;
    });
  };

  const savePortfolios = (next: Portfolio[] | ((prev: Portfolio[]) => Portfolio[])) => {
    setPortfolios((prev) => (typeof next === 'function' ? next(prev) : next));
  };

  const saveProjects = (next: ClientProject[] | ((prev: ClientProject[]) => ClientProject[])) => {
    setProjects((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      const seenIds = new Set<string>();
      const seenContentKeys = new Set<string>();
      const deduplicated: ClientProject[] = [];

      for (const p of updated) {
        if (!p || !p.id) continue;

        const titleKey = (p.title || '').toLowerCase().trim();
        const clientEmailKey = (p.clientEmail || '').toLowerCase().trim();
        const clientNameKey = (p.clientName || '').toLowerCase().trim();
        const contentKey = titleKey && (clientEmailKey || clientNameKey) ? `${titleKey}::${clientEmailKey || clientNameKey}` : '';

        // If exact ID seen before, skip duplicate
        if (seenIds.has(p.id)) {
          continue;
        }

        // If same project title & client info seen before, merge object fields into existing entry
        if (contentKey && seenContentKeys.has(contentKey)) {
          const existingIdx = deduplicated.findIndex((existing) => {
            const tK = (existing.title || '').toLowerCase().trim();
            const eK = (existing.clientEmail || '').toLowerCase().trim();
            const nK = (existing.clientName || '').toLowerCase().trim();
            return `${tK}::${eK || nK}` === contentKey;
          });

          if (existingIdx >= 0) {
            deduplicated[existingIdx] = { ...deduplicated[existingIdx], ...p };
          }
          continue;
        }

        seenIds.add(p.id);
        if (contentKey) {
          seenContentKeys.add(contentKey);
        }
        deduplicated.push(p);
      }

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('atasilabs_projects_updated', { detail: deduplicated }));
      }
      return deduplicated;
    });
  };

  const savePricingTiers = (next: PricingTier[] | ((prev: PricingTier[]) => PricingTier[])) => {
    setPricingTiers((prev) => {
      const updated = typeof next === 'function' ? next(prev) : next;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('atasilabs_pricing_updated', { detail: updated }));
      }
      return updated;
    });
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
    const targetEmail = email || 'ceo@atasilabs.com';
    const foundUser = users.find((u) => u.email.toLowerCase() === targetEmail.toLowerCase()) || {
      id: `usr-${Date.now()}`,
      email: targetEmail,
      name: 'Admin User',
      role: 'ADMIN' as const,
      avatarUrl: '',
      status: 'ACTIVE' as const,
      createdAt: new Date().toISOString(),
    };
    updateCurrentUserState(foundUser);
    showNotification(`Berhasil login sebagai ${foundUser.name} [${foundUser.role}]`, 'success');
    return true;
  };

  const logout = () => {
    updateCurrentUserState(null);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('webdev_sys_auth_user');
        localStorage.removeItem('webdev_sys_last_dashboard_path');
        localStorage.removeItem('webdev_sys_dashboard_tab');
      } catch (e) {}
    }
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
    setIsLoadingData(true);

    // Fetch each independently so fast APIs like /api/pricing render immediately
    const fetchPricing = fetch('/api/pricing', { cache: 'no-store' })
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          savePricingTiers(res.data);
        }
      })
      .catch((err) => console.warn('Pricing fetch error:', err))
      .finally(() => setIsLoadingData(false));

    const fetchLeads = fetch('/api/leads')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          saveLeads(res.data);
        }
      })
      .catch((err) => console.warn('Leads fetch error:', err));

    const fetchUsers = fetch('/api/users')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          saveUsers(res.data);
        }
      })
      .catch((err) => console.warn('Users fetch error:', err));

    const fetchProjects = fetch('/api/projects')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          saveProjects(res.data);
        }
      })
      .catch((err) => console.warn('Projects fetch error:', err));

    const fetchContact = fetch('/api/contact')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res.data) {
          setCompanyContact(res.data);
        }
      })
      .catch((err) => console.warn('Contact fetch error:', err));

    const fetchTestimonials = fetch('/api/testimonials')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setTestimonials(res.data);
        }
      })
      .catch((err) => console.warn('Testimonials fetch error:', err));

    const fetchPortfolios = fetch('/api/portfolio')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          savePortfolios(res.data);
        }
      })
      .catch((err) => console.warn('Portfolios fetch error:', err));

    const fetchRbac = fetch('/api/rbac')
      .then((res) => res.json())
      .then((res) => {
        if (res?.success && res.data) {
          setRolePermissions(res.data);
        }
      })
      .catch((err) => console.warn('RBAC fetch error:', err));

    await Promise.allSettled([
      fetchPricing,
      fetchLeads,
      fetchUsers,
      fetchProjects,
      fetchContact,
      fetchTestimonials,
      fetchPortfolios,
      fetchRbac,
    ]);
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
      supabase.channel('public_realtime_db_changes').send({
        type: 'broadcast',
        event: 'LEAD_UPDATE',
        payload: tempLead,
      });
    } catch (bErr) {}

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

  const updateLead = async (id: string, updates: Partial<Lead>) => {
    saveLeads((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...updates };
        try {
          supabase.channel('public_realtime_db_changes').send({
            type: 'broadcast',
            event: 'LEAD_UPDATE',
            payload: updated,
          });
        } catch (bErr) {}
        return updated;
      })
    );
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      });
    } catch (e) {
      console.error(e);
    }
    showNotification('Data lead berhasil diperbarui', 'success');
  };

  const updateLeadStatus = async (id: string, status: LeadStatus) => {
    saveLeads((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, status };
        try {
          supabase.channel('public_realtime_db_changes').send({
            type: 'broadcast',
            event: 'LEAD_UPDATE',
            payload: updated,
          });
        } catch (bErr) {}
        return updated;
      })
    );
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
      supabase.channel('public_realtime_db_changes').send({
        type: 'broadcast',
        event: 'LEAD_DELETE',
        payload: { id },
      });
    } catch (bErr) {}
    try {
      await fetch(`/api/leads?id=${id}`, { method: 'DELETE' });
    } catch (e) {
      console.error(e);
    }
    showNotification('Pesan berhasil dihapus dari database', 'warning');
  };

  const markAllLeadsRead = async () => {
    const unreadIds = leads.filter((item) => item.status === 'NEW').map((l) => l.id);
    saveLeads((prev) =>
      prev.map((item) => {
        if (item.status !== 'NEW') return item;
        const updated = { ...item, status: 'READ' as const };
        try {
          supabase.channel('public_realtime_db_changes').send({
            type: 'broadcast',
            event: 'LEAD_UPDATE',
            payload: updated,
          });
        } catch (bErr) {}
        return updated;
      })
    );

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
        body: JSON.stringify({ ...proj, id: tempProj.id }),
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
    const updatedAt = new Date().toISOString();
    const updatedFields = { ...proj, updatedAt };

    saveProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const merged = { ...p, ...updatedFields };
        try {
          supabase.channel('public_realtime_db_changes').send({
            type: 'broadcast',
            event: 'PROJECT_UPDATE',
            payload: merged,
          });
        } catch (bErr) {
          console.error('Realtime broadcast error:', bErr);
        }
        return merged;
      })
    );

    try {
      const res = await fetch('/api/projects', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields }),
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
      supabase.channel('public_realtime_db_changes').send({
        type: 'broadcast',
        event: 'PROJECT_DELETE',
        payload: { id },
      });
    } catch (bErr) {}

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
    const updatedAt = new Date().toISOString();

    saveProjects((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p;
        const updated = {
          ...p,
          progress: clampedProgress,
          ipwStage: stageCfg.stage,
          status: calculatedStatus,
          updatedAt,
        };
        try {
          supabase.channel('public_realtime_db_changes').send({
            type: 'broadcast',
            event: 'PROJECT_UPDATE',
            payload: updated,
          });
        } catch (bErr) {}
        return updated;
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
    let updatedTier: PricingTier | null = null;
    savePricingTiers((prev) => {
      return prev.map((tier) => {
        if (tier.id === id) {
          const merged = {
            ...tier,
            ...updatedFields,
            updatedAt: new Date().toISOString(),
          };
          updatedTier = merged;
          return merged;
        }
        return tier;
      });
    });

    // 1. Broadcast immediately to any other active tabs or windows via Supabase Realtime channel
    try {
      supabase.channel('public_realtime_db_changes').send({
        type: 'broadcast',
        event: 'PRICING_UPDATE',
        payload: updatedTier || { id, ...updatedFields },
      });
    } catch (e) {
      console.error('Supabase broadcast pricing error:', e);
    }

    // 2. Direct Supabase DB update (immediate write directly to Postgres from client)
    try {
      supabase
        .from('PricingTier')
        .update({
          ...updatedFields,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', id)
        .then(({ error: sbErr }) => {
          if (sbErr) console.warn('Direct client Supabase pricing update notice:', sbErr);
        });
    } catch (sbEx) {
      console.warn('Direct client Supabase pricing exception:', sbEx);
    }

    // 3. Persist to Backend API / Database (Server-side admin update & Prisma sync)
    try {
      await fetch('/api/pricing', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updatedFields }),
        cache: 'no-store',
      });
    } catch (e) {
      console.error('Database update pricing error:', e);
    }

    showNotification('Paket harga & spesifikasi diperbarui di database!', 'success');
  };

  const resetPricingTiersToDefault = async () => {
    await refreshDataFromBackend();
    showNotification('Pricelist diperbarui dari Database Supabase', 'info');
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
    await refreshDataFromBackend();
    showNotification('Data kontak diperbarui dari Database Supabase', 'info');
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
    await refreshDataFromBackend();
    showNotification('Testimoni diperbarui dari Database Supabase', 'info');
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
    try {
      await refreshDataFromBackend();
    } catch (e) {
      console.error('Reset all data error:', e);
    }
    showNotification('Data telah direfresh dari Database Supabase', 'info');
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
        isLoadingData,
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
        updateLead,
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

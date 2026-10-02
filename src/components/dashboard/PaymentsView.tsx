'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  TextField,
  MenuItem,
  Stack,
  Alert,
  Tooltip,
  Avatar,
  Divider,
  InputAdornment,
  Tabs,
  Tab,
  LinearProgress,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  Payments as PaymentsIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Visibility as VisibilityIcon,
  CloudUpload as UploadIcon,
  Receipt as ReceiptIcon,
  HourglassTop as PendingIcon,
  CalendarToday as CalendarIcon,
  WorkOutline as ProjectIcon,
  AttachMoney as MoneyIcon,
  AutoAwesome as AutoIcon,
  VerifiedUser as SecurityIcon,
  Info as InfoIcon,
  ContentCopy as CopyIcon,
  Print as PrintIcon,
  QrCode2 as QrCodeIcon,
  AccountBalance as BankIcon,
  Search as SearchIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { ClientProject, ProjectPaymentRecord } from '../../types';
import { getFreelancerFeeForTier } from '../../lib/pricingUtils';
import { numberToWordsIDR } from '../../lib/documentGenerator';

export const PaymentsView: React.FC = () => {
  const theme = useTheme();
  const {
    projects,
    users,
    currentUser,
    updateProject,
    showNotification,
    companyContact,
  } = useApp();

  const isClientRole = currentUser?.role === 'CLIENT';

  // Filter available projects for current user
  const availableProjects = useMemo(() => {
    if (isClientRole) {
      const emailLower = currentUser?.email?.toLowerCase();
      const compLower = currentUser?.company?.toLowerCase();
      const nameLower = currentUser?.name?.toLowerCase();

      return projects.filter((p) => {
        const matchesClient =
          (emailLower && p.clientEmail?.toLowerCase() === emailLower) ||
          (compLower && p.clientName?.toLowerCase().includes(compLower)) ||
          (nameLower && p.clientName?.toLowerCase().includes(nameLower));

        return matchesClient && !p.isArchived && p.status !== 'ARCHIVED';
      });
    }
    return projects;
  }, [projects, currentUser, isClientRole]);

  // Selected Project State (Default to 'ALL' for Admin/Staff, or first project for Client)
  const [selectedProjectId, setSelectedProjectId] = useState<string>(() => {
    return isClientRole ? (availableProjects[0]?.id || '') : 'ALL';
  });

  React.useEffect(() => {
    if (availableProjects.length > 0) {
      if (!isClientRole && selectedProjectId === 'ALL') return;
      if (!selectedProjectId || (!isClientRole && selectedProjectId !== 'ALL' && !availableProjects.some((p) => p.id === selectedProjectId))) {
        setSelectedProjectId(isClientRole ? availableProjects[0].id : 'ALL');
      }
    }
  }, [availableProjects, selectedProjectId, isClientRole]);

  const isAllProjects = selectedProjectId === 'ALL' || (!selectedProjectId && !isClientRole);

  const selectedProject: ClientProject | undefined = isAllProjects
    ? availableProjects[0]
    : availableProjects.find((p) => p.id === selectedProjectId) || availableProjects[0];

  // Count pending approval payments across all available projects
  const totalPendingPaymentsCount = useMemo(() => {
    let count = 0;
    availableProjects.forEach((proj) => {
      (proj.payments || []).forEach((pay) => {
        if (pay.status === 'PENDING') count++;
      });
    });
    return count;
  }, [availableProjects]);

  // Total count of all transactions
  const allPaymentsCount = useMemo(() => {
    let count = 0;
    availableProjects.forEach((proj) => {
      count += (proj.payments || []).length;
    });
    return count;
  }, [availableProjects]);

  // Aggregated or single project payments list enriched with project title & client name
  const paymentsListWithProject = useMemo(() => {
    const list: (ProjectPaymentRecord & { projectId: string; projectTitle: string; clientName: string })[] = [];

    if (isAllProjects) {
      availableProjects.forEach((proj) => {
        (proj.payments || []).forEach((pay) => {
          list.push({
            ...pay,
            projectId: proj.id,
            projectTitle: proj.title,
            clientName: proj.clientName,
          });
        });
      });
      return list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime());
    }

    if (selectedProject) {
      (selectedProject.payments || []).forEach((pay) => {
        list.push({
          ...pay,
          projectId: selectedProject.id,
          projectTitle: selectedProject.title,
          clientName: selectedProject.clientName,
        });
      });
    }

    return list;
  }, [isAllProjects, availableProjects, selectedProject]);

  // Payment Form Dialog State
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [paymentFormData, setPaymentFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: 0,
    stage: 'DP Tahap 1 (30%)',
    notes: '',
    status: isClientRole ? ('PENDING' as const) : ('VERIFIED' as const),
    proofUrl: '',
    targetProjId: '',
  });

  // Proof Modal State for viewing proof image
  const [proofPreviewModal, setProofPreviewModal] = useState<{
    open: boolean;
    payment?: ProjectPaymentRecord & { projectTitle?: string; clientName?: string };
  }>({
    open: false,
  });

  // Filter, Search, Bank Info & Invoice Modal States
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VERIFIED' | 'PENDING' | 'FAILED'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [bankInfoDialogOpen, setBankInfoDialogOpen] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState<{
    open: boolean;
    payment?: ProjectPaymentRecord & { projectId?: string; projectTitle?: string; clientName?: string };
  }>({
    open: false,
  });
  const [printAllModalInvoices, setPrintAllModalInvoices] = useState(false);
  const [docType, setDocType] = useState<'INVOICE' | 'KWITANSI'>('KWITANSI');

  // Synchronize printing-invoice class on document.body when invoice modal is open
  useEffect(() => {
    if (invoiceModal.open) {
      document.body.classList.add('printing-invoice');
    } else {
      document.body.classList.remove('printing-invoice');
    }
    return () => {
      document.body.classList.remove('printing-invoice');
    };
  }, [invoiceModal.open]);

  // Helper to determine stage progression order (Tahap 1 = earliest, Pelunasan = latest)
  const getPaymentStageOrder = (stage?: string): number => {
    if (!stage) return 50;
    const s = stage.toLowerCase();
    if (s.includes('tahap 1') || s.includes('dp')) return 10;
    if (s.includes('tahap 2')) return 20;
    if (s.includes('tahap 3')) return 30;
    if (s.includes('tahap 4')) return 40;
    if (s.includes('tahap 5')) return 50;
    if (s.includes('pelunasan')) return 80;
    if (s.includes('tambahan') || s.includes('add-on')) return 90;
    return 50;
  };

  // Sort payments chronologically ascending (first payment paid is index 0 -> INVOICE #1)
  const sortPaymentsAscending = <T extends ProjectPaymentRecord>(payments: T[]): T[] => {
    const indexed = payments.map((item, originalIndex) => ({ item, originalIndex }));

    indexed.sort((x, y) => {
      const a = x.item;
      const b = y.item;

      // 1. Stage lifecycle sequence (Tahap 1 / DP must be earliest)
      const stageA = getPaymentStageOrder(a.stage);
      const stageB = getPaymentStageOrder(b.stage);
      if (stageA !== stageB) {
        return stageA - stageB;
      }

      // 2. Date comparison
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      if (dateA !== dateB && !isNaN(dateA) && !isNaN(dateB) && dateA > 0 && dateB > 0) {
        return dateA - dateB;
      }

      // 3. CreatedAt ISO timestamp comparison
      const createdA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const createdB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      if (createdA !== createdB && !isNaN(createdA) && !isNaN(createdB) && createdA > 0 && createdB > 0) {
        return createdA - createdB;
      }

      // 4. Numeric ID timestamp comparison (pay-174... vs pay-175...)
      const numIdA = Number((a.id || '').replace(/\D/g, ''));
      const numIdB = Number((b.id || '').replace(/\D/g, ''));
      if (numIdA && numIdB && numIdA !== numIdB) {
        return numIdA - numIdB;
      }

      // 5. Fallback: in prepended array [newest, ..., oldest], larger index was added earlier
      return y.originalIndex - x.originalIndex;
    });

    return indexed.map((x) => x.item);
  };

  // Target project total payment count
  const targetProjectPaymentCount = useMemo(() => {
    if (!invoiceModal.payment) return 1;
    const targetProjId = invoiceModal.payment.projectId;
    const targetProj = availableProjects.find((p) => p.id === targetProjId) ||
      availableProjects.find((p) => p.title === invoiceModal.payment?.projectTitle) ||
      (selectedProjectId !== 'ALL' ? selectedProject : undefined);

    return targetProj?.payments?.length || 1;
  }, [invoiceModal.payment, availableProjects, selectedProject, selectedProjectId]);

  // Computed list of payments to render in invoice modal
  const invoicePaymentsToRender = useMemo(() => {
    if (!invoiceModal.payment) return [];

    if (printAllModalInvoices) {
      const targetProjId = invoiceModal.payment.projectId;
      const targetProj = availableProjects.find((p) => p.id === targetProjId) ||
        availableProjects.find((p) => p.title === invoiceModal.payment?.projectTitle) ||
        (selectedProjectId !== 'ALL' ? selectedProject : undefined);

      if (targetProj && targetProj.payments && targetProj.payments.length > 0) {
        const list = targetProj.payments.map((p) => ({
          ...p,
          projectId: targetProj.id,
          projectTitle: targetProj.title,
          clientName: targetProj.clientName,
        }));
        return sortPaymentsAscending(list);
      }
    }

    return [invoiceModal.payment];
  }, [invoiceModal.payment, printAllModalInvoices, availableProjects, selectedProject, selectedProjectId]);

  // Target project comprehensive data for the active invoice modal
  const targetProjectData = useMemo(() => {
    if (!invoiceModal.payment) return null;
    const targetProjId = invoiceModal.payment.projectId;
    const targetProj = availableProjects.find((p) => p.id === targetProjId) ||
      availableProjects.find((p) => p.title === invoiceModal.payment?.projectTitle) ||
      (selectedProjectId !== 'ALL' ? selectedProject : undefined);

    if (!targetProj) return null;

    const rawPayments = (targetProj.payments || []).map((p) => ({
      ...p,
      projectId: targetProj.id,
      projectTitle: targetProj.title,
      clientName: targetProj.clientName,
    }));
    const payments = sortPaymentsAscending(rawPayments);

    const totalFromPayments = payments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const totalContract = (targetProj.budget && targetProj.budget > 0) ? targetProj.budget : totalFromPayments;
    const totalPaid = payments.filter((p) => p.status === 'VERIFIED').reduce((acc, p) => acc + (p.amount || 0), 0);
    const remaining = Math.max(0, totalContract - totalPaid);

    return {
      project: targetProj,
      payments,
      totalContract,
      totalPaid,
      remaining,
      totalCount: payments.length || 1,
    };
  }, [invoiceModal.payment, availableProjects, selectedProject, selectedProjectId]);
  // Admin Tab Switcher: Client Payments vs Freelancer Payouts
  const [mainTab, setMainTab] = useState<'CLIENT' | 'FREELANCER'>('CLIENT');

  // Freelancer Wage Payout Modal State for Admin
  const [freelancerPayoutDialogOpen, setFreelancerPayoutDialogOpen] = useState(false);
  const [freelancerPayoutFormData, setFreelancerPayoutFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    amount: '',
    stage: 'DP 40% SPK Signed',
    notes: '',
    status: 'VERIFIED' as 'VERIFIED' | 'PENDING',
    proofUrl: '',
    targetProjId: '',
    freelancerId: '',
  });

  // Calculate Freelancer Wage Payout Aggregates across projects
  const freelancerPayoutMetrics = useMemo(() => {
    let grandFee = 0;
    let grandPaid = 0;
    let grandRemaining = 0;
    let grandHarusDibayar = 0;

    const list: (ProjectPaymentRecord & { projectId: string; projectTitle: string; clientName: string; freelancerName: string; tierNumber?: number; totalFee: number; remainingBalance: number })[] = [];

    availableProjects.forEach((proj) => {
      const tierKey = proj.tierNumber || 3;
      const totalFee = proj.freelancerFee && proj.freelancerFee > 0 ? proj.freelancerFee : getFreelancerFeeForTier(tierKey);

      const verifiedPayments = (proj.freelancerPayments || []).filter((p) => p.status === 'VERIFIED');
      const alreadyPaid = verifiedPayments.reduce((sum, p) => sum + (p.amount || 0), 0) || proj.freelancerTotalPaid || 0;
      const remainingBalance = Math.max(0, totalFee - alreadyPaid);

      let requiredTarget = 0;
      if (proj.progress === 100 || proj.status === 'COMPLETED') {
        requiredTarget = totalFee;
      } else if (proj.progress > 0 || proj.status === 'IN_PROGRESS') {
        requiredTarget = Math.round(totalFee * 0.4);
      }
      const harusDibayarNow = Math.max(0, Math.min(remainingBalance, requiredTarget - alreadyPaid));

      grandFee += totalFee;
      grandPaid += alreadyPaid;
      grandRemaining += remainingBalance;
      grandHarusDibayar += harusDibayarNow;

      (proj.freelancerPayments || []).forEach((pay) => {
        list.push({
          ...pay,
          projectId: proj.id,
          projectTitle: proj.title,
          clientName: proj.clientName,
          freelancerName: proj.freelancerName || 'Freelancer',
          tierNumber: proj.tierNumber,
          totalFee,
          remainingBalance,
        });
      });
    });

    return {
      list: list.sort((a, b) => new Date(b.createdAt || b.date).getTime() - new Date(a.createdAt || a.date).getTime()),
      grandFee,
      grandPaid,
      grandRemaining,
      grandHarusDibayar,
    };
  }, [availableProjects]);

  const handleSaveFreelancerPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = Number(freelancerPayoutFormData.amount);
    if (!freelancerPayoutFormData.targetProjId || !amountNum || amountNum <= 0) {
      showNotification('Harap pilih proyek dan masukkan nominal upah yang valid', 'warning');
      return;
    }

    const targetProj = availableProjects.find((p) => p.id === freelancerPayoutFormData.targetProjId);
    if (!targetProj) return;

    const matchedUser = users.find((u) => u.id === freelancerPayoutFormData.freelancerId) ||
      users.find((u) => u.name === targetProj.freelancerName);
    const payeeName = matchedUser?.name || targetProj.freelancerName || 'Freelancer Developer';

    const newRecord: ProjectPaymentRecord = {
      id: `devpay-${Date.now()}`,
      date: freelancerPayoutFormData.date,
      amount: amountNum,
      stage: freelancerPayoutFormData.stage,
      notes: freelancerPayoutFormData.notes || `Pengeluaran Upah Dev (${payeeName})`,
      status: freelancerPayoutFormData.status,
      proofUrl: freelancerPayoutFormData.proofUrl || undefined,
      approvedBy: currentUser?.name || 'Admin Atasilabs',
      approvedAt: new Date().toLocaleString('id-ID'),
      createdAt: new Date().toISOString(),
    };

    const currentPayments = targetProj.freelancerPayments || [];
    const updatedPayments = [newRecord, ...currentPayments];
    const newDevTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(targetProj.id, {
      freelancerPayments: updatedPayments,
      freelancerTotalPaid: newDevTotalPaid,
      freelancerName: targetProj.freelancerName || payeeName,
    });

    setFreelancerPayoutDialogOpen(false);
    showNotification(`Catatan pengeluaran upah Rp ${amountNum.toLocaleString('id-ID')} kepada ${payeeName} (Penerima Upah) tersimpan!`, 'success');
  };

  const handleDeleteFreelancerPayout = (payId: string, projId: string) => {
    const targetProj = availableProjects.find((p) => p.id === projId);
    if (!targetProj) return;

    const currentPayments = targetProj.freelancerPayments || [];
    const updatedPayments = currentPayments.filter((p) => p.id !== payId);
    const newDevTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      freelancerPayments: updatedPayments,
      freelancerTotalPaid: newDevTotalPaid,
    });

    showNotification('Catatan transaksi upah freelancer berhasil dihapus', 'info');
  };

  const filteredPaymentsList = useMemo(() => {
    return paymentsListWithProject.filter((pay) => {
      if (statusFilter !== 'ALL' && pay.status !== statusFilter) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchStage = pay.stage?.toLowerCase().includes(q);
        const matchNotes = pay.notes?.toLowerCase().includes(q);
        const matchClient = pay.clientName?.toLowerCase().includes(q);
        const matchTitle = pay.projectTitle?.toLowerCase().includes(q);
        const matchAmount = pay.amount.toString().includes(q);
        if (!matchStage && !matchNotes && !matchClient && !matchTitle && !matchAmount) {
          return false;
        }
      }
      return true;
    });
  }, [paymentsListWithProject, statusFilter, searchQuery]);

  const handleCopyAccount = (text: string, bankLabel: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showNotification(`Nomor Rekening ${bankLabel} (${text}) berhasil disalin!`, 'success');
    }
  };

  const formatRupiah = (num: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(num || 0);
  };

  // Financial summary metrics
  const totalBudget = useMemo(() => {
    if (isAllProjects) {
      return availableProjects.reduce((sum, p) => sum + (p.budget || 0), 0);
    }
    return selectedProject?.budget || 0;
  }, [isAllProjects, availableProjects, selectedProject]);

  const verifiedPaymentsSum = useMemo(() => {
    return paymentsListWithProject
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [paymentsListWithProject]);

  const totalPaidAmount = verifiedPaymentsSum;
  const remainingBalance = Math.max(0, totalBudget - totalPaidAmount);
  const paymentProgressPct = totalBudget > 0 ? Math.min(100, Math.round((totalPaidAmount / totalBudget) * 100)) : 0;

  // Helper to extract termin percentage from stage name (e.g. "DP Tahap 1 (30%)" -> 30)
  const getTerminPercentage = (stageName: string): number | null => {
    const match = stageName.match(/(\d+)%/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  };

  // Helper to calculate nominal based on stage percentage and total project contract value
  const calculateTerminAmount = (stageName: string, budget: number, remaining?: number): number => {
    const pct = getTerminPercentage(stageName);
    if (pct !== null && budget > 0) {
      return Math.round((budget * pct) / 100);
    }
    if (remaining !== undefined && remaining > 0) {
      return remaining;
    }
    return 0;
  };

  // Helper to determine the next intelligent stage based on recorded payments
  const getNextPaymentStage = (project?: ClientProject, fallbackStage: string = 'DP Tahap 1 (30%)'): string => {
    if (!project || !project.payments || project.payments.length === 0) {
      return 'DP Tahap 1 (30%)';
    }
    const existingStages = project.payments.map((p) => p.stage);

    const hasDP30 = existingStages.some((s) => s.includes('DP Tahap 1 (30%)') || s.includes('DP Tahap 1'));
    const hasTermin2 = existingStages.some((s) => s.includes('Tahap 2') || s.includes('Termin Progress'));
    const hasPelunasan3 = existingStages.some((s) => s.includes('Tahap 3') || s.includes('Pelunasan'));

    if (!hasDP30) return 'DP Tahap 1 (30%)';
    if (!hasTermin2) return 'Termin Progress Tahap 2 (30%)';
    if (!hasPelunasan3) return 'Pelunasan Tahap 3 (40%)';

    return 'Pembayaran Tambahan / Add-on';
  };

  const handleOpenPaymentDialog = () => {
    const targetProj = (selectedProjectId !== 'ALL' ? availableProjects.find((p) => p.id === selectedProjectId) : undefined) || selectedProject || availableProjects[0];
    const targetBudget = targetProj?.budget || 15000000;

    const verifiedPayments = (targetProj?.payments || []).filter((p) => p.status === 'VERIFIED');
    const totalPaid = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const remaining = Math.max(0, targetBudget - totalPaid);

    const smartStage = getNextPaymentStage(targetProj, 'DP Tahap 1 (30%)');
    const defaultAmount = calculateTerminAmount(smartStage, targetBudget, remaining);

    setPaymentFormData({
      date: new Date().toISOString().split('T')[0],
      amount: defaultAmount,
      stage: smartStage,
      notes: 'Transfer Bank BRI a.n. PT AULIA INDOLAND GRUP',
      status: isClientRole ? 'PENDING' : 'VERIFIED',
      proofUrl: '',
      targetProjId: targetProj?.id || '',
    });
    setPaymentDialogOpen(true);
  };

  const handleFormStageChange = (newStage: string) => {
    const targetId = paymentFormData.targetProjId || selectedProject?.id || availableProjects[0]?.id;
    const targetProj = availableProjects.find((p) => p.id === targetId);
    const targetBudget = targetProj?.budget || 0;

    const verifiedPayments = (targetProj?.payments || []).filter((p) => p.status === 'VERIFIED');
    const totalPaid = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const remaining = Math.max(0, targetBudget - totalPaid);

    const newAmount = calculateTerminAmount(newStage, targetBudget, remaining);

    setPaymentFormData((prev) => ({
      ...prev,
      stage: newStage,
      amount: newAmount,
    }));
  };

  const handleFormTargetProjChange = (newProjId: string) => {
    const newProj = availableProjects.find((p) => p.id === newProjId);
    const targetBudget = newProj?.budget || 0;

    const verifiedPayments = (newProj?.payments || []).filter((p) => p.status === 'VERIFIED');
    const totalPaid = verifiedPayments.reduce((acc, p) => acc + (p.amount || 0), 0);
    const remaining = Math.max(0, targetBudget - totalPaid);

    const smartStage = getNextPaymentStage(newProj, paymentFormData.stage);
    const newAmount = calculateTerminAmount(smartStage, targetBudget, remaining);

    setPaymentFormData((prev) => ({
      ...prev,
      targetProjId: newProjId,
      stage: smartStage,
      amount: newAmount,
    }));
  };

  const currentFormProj = useMemo(() => {
    const pId = paymentFormData.targetProjId || selectedProject?.id || availableProjects[0]?.id;
    return availableProjects.find((p) => p.id === pId) || selectedProject || availableProjects[0];
  }, [paymentFormData.targetProjId, selectedProject, availableProjects]);

  const formTargetBudget = currentFormProj?.budget || 0;
  const formVerifiedPaymentsSum = useMemo(() => {
    return (currentFormProj?.payments || [])
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);
  }, [currentFormProj]);
  const formRemainingBalance = Math.max(0, formTargetBudget - formVerifiedPaymentsSum);
  const formTerminPct = getTerminPercentage(paymentFormData.stage);

  const [isUploadingR2, setIsUploadingR2] = useState(false);

  // Handle client payment file upload directly to Cloudflare R2
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('Ukuran file resi bukti transfer tidak boleh melebihi 10MB', 'warning');
      return;
    }

    setIsUploadingR2(true);
    showNotification('Mengunggah bukti pembayaran ke Cloudflare R2...', 'info');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'proofs');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setPaymentFormData((prev) => ({
          ...prev,
          proofUrl: data.url,
        }));
        showNotification('Bukti resi pembayaran berhasil disimpan ke Cloudflare R2!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const base64Str = uploadEvent.target?.result as string;
          setPaymentFormData((prev) => ({
            ...prev,
            proofUrl: base64Str,
          }));
          showNotification('Foto resi bukti transfer dimuat!', 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Bukti R2 upload error:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Str = uploadEvent.target?.result as string;
        setPaymentFormData((prev) => ({
          ...prev,
          proofUrl: base64Str,
        }));
        showNotification('Foto resi bukti transfer dimuat!', 'success');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingR2(false);
    }
  };

  // Handle freelancer payout file upload directly to Cloudflare R2
  const handleFreelancerFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      showNotification('Ukuran file bukti transfer tidak boleh melebihi 10MB', 'warning');
      return;
    }

    setIsUploadingR2(true);
    showNotification('Mengunggah bukti transfer upah ke Cloudflare R2...', 'info');

    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', file);
      uploadFormData.append('folder', 'freelancer-payouts');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: uploadFormData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        setFreelancerPayoutFormData((prev) => ({
          ...prev,
          proofUrl: data.url,
        }));
        showNotification('Bukti transfer freelancer disimpan ke Cloudflare R2!', 'success');
      } else {
        const reader = new FileReader();
        reader.onload = (uploadEvent) => {
          const base64Str = uploadEvent.target?.result as string;
          setFreelancerPayoutFormData((prev) => ({
            ...prev,
            proofUrl: base64Str,
          }));
          showNotification('Foto bukti transfer dimuat!', 'success');
        };
        reader.readAsDataURL(file);
      }
    } catch (err) {
      console.error('Freelancer payout R2 upload error:', err);
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const base64Str = uploadEvent.target?.result as string;
        setFreelancerPayoutFormData((prev) => ({
          ...prev,
          proofUrl: base64Str,
        }));
        showNotification('Foto bukti transfer dimuat!', 'success');
      };
      reader.readAsDataURL(file);
    } finally {
      setIsUploadingR2(false);
    }
  };

  const handleSavePaymentRecord = () => {
    const targetId = paymentFormData.targetProjId || selectedProject?.id || availableProjects[0]?.id;
    const targetProj = availableProjects.find((p) => p.id === targetId);

    if (!targetProj) {
      showNotification('Harap pilih proyek target untuk pencatatan pembayaran', 'warning');
      return;
    }
    if (!paymentFormData.amount || paymentFormData.amount <= 0) {
      showNotification('Harap masukkan nominal pembayaran yang valid (lebih dari 0)', 'warning');
      return;
    }

    const initialStatus = isClientRole ? 'PENDING' : paymentFormData.status;

    const newRecord: ProjectPaymentRecord = {
      id: `pay-${Date.now()}`,
      date: paymentFormData.date,
      amount: Number(paymentFormData.amount),
      stage: paymentFormData.stage,
      notes: paymentFormData.notes,
      status: initialStatus,
      proofUrl: paymentFormData.proofUrl || undefined,
      approvedBy: initialStatus === 'VERIFIED' ? (currentUser?.name || 'Admin') : undefined,
      approvedAt: initialStatus === 'VERIFIED' ? new Date().toLocaleString('id-ID') : undefined,
      createdAt: new Date().toISOString(),
    };

    const currentPayments = targetProj.payments || [];
    const updatedPayments = [newRecord, ...currentPayments];
    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(targetProj.id, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    setPaymentDialogOpen(false);
    if (initialStatus === 'PENDING') {
      showNotification(`Bukti pembayaran ${formatRupiah(paymentFormData.amount)} berhasil diunggah. Menunggu approval Admin!`, 'info');
    } else {
      showNotification(`Catatan pembayaran ${formatRupiah(paymentFormData.amount)} berhasil disimpan & disetujui!`, 'success');
    }
  };

  // Admin Approval Action: Approve
  const handleApprovePayment = (payId: string, targetProjectId?: string) => {
    const projId = targetProjectId || selectedProject?.id;
    if (!projId) return;

    const projToUpdate = availableProjects.find((p) => p.id === projId);
    if (!projToUpdate) return;

    const adminName = currentUser?.name || 'Admin Atasilabs';
    const nowStr = new Date().toLocaleString('id-ID');

    const currentPayments = projToUpdate.payments || [];
    const updatedPayments = currentPayments.map((p) => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'VERIFIED' as const,
          approvedBy: adminName,
          approvedAt: nowStr,
        };
      }
      return p;
    });

    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification(`Status Pembayaran DISUJUJU oleh Admin (${projToUpdate.clientName})!`, 'success');
  };

  // Admin Approval Action: Reject
  const handleRejectPayment = (payId: string, targetProjectId?: string) => {
    const projId = targetProjectId || selectedProject?.id;
    if (!projId) return;

    const projToUpdate = availableProjects.find((p) => p.id === projId);
    if (!projToUpdate) return;

    const currentPayments = projToUpdate.payments || [];
    const updatedPayments = currentPayments.map((p) => {
      if (p.id === payId) {
        return {
          ...p,
          status: 'FAILED' as const,
        };
      }
      return p;
    });

    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Status Pembayaran DITOLAK / INVALID.', 'warning');
  };

  const handleDeletePaymentRecord = (payId: string, targetProjectId?: string) => {
    const projId = targetProjectId || selectedProject?.id;
    if (!projId) return;

    const projToUpdate = availableProjects.find((p) => p.id === projId);
    if (!projToUpdate) return;

    const currentPayments = projToUpdate.payments || [];
    const updatedPayments = currentPayments.filter((p) => p.id !== payId);
    const newTotalPaid = updatedPayments
      .filter((p) => p.status === 'VERIFIED')
      .reduce((sum, p) => sum + p.amount, 0);

    updateProject(projId, {
      payments: updatedPayments,
      totalPaid: newTotalPaid,
    });

    showNotification('Catatan pembayaran berhasil dihapus', 'info');
  };

  if (availableProjects.length === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 5,
          textAlign: 'center',
          borderRadius: 3.5,
          border: `1px dashed ${theme.palette.divider}`,
          mt: 2,
        }}
      >
        <PaymentsIcon sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
        <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
          Belum Ada Proyek Aktif untuk Manajemen Pembayaran
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Silakan buat atau pilih proyek aktif terlebih dahulu untuk mencatat rincian transaksi pembayaran.
        </Typography>
      </Paper>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alert Banner for Pending Admin Approvals */}
      {!isClientRole && totalPendingPaymentsCount > 0 && (
        <Alert
          severity="warning"
          variant="filled"
          action={
            <Button color="inherit" size="small" variant="outlined" onClick={() => setSelectedProjectId('ALL')} sx={{ fontWeight: 800, borderColor: '#fff', color: '#fff' }}>
              Lihat Semua ({totalPendingPaymentsCount})
            </Button>
          }
          sx={{ mb: 3, borderRadius: 3, fontWeight: 700, boxShadow: '0 4px 14px rgba(245, 158, 11, 0.3)' }}
        >
          🔔 TERDETEKSI <strong>{totalPendingPaymentsCount} Pembayaran Baru DARI KLIEN</strong> MENUNGGU VERIFIKASI & APPROVAL ADMIN!
        </Alert>
      )}

      {/* Title Header (Matching Dokumentasi view) */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', mb: 0.5, fontSize: { xs: '1.1rem', sm: '1.3rem', md: '1.5rem' } }}>
          Manajemen & Input Pembayaran Proyek
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap', mt: 1 }}>
          <Chip
            icon={<SecurityIcon sx={{ fontSize: '16px !important' }} />}
            label="Verifikasi & Transaksi Real-time"
            color="success"
            size="small"
            sx={{ fontWeight: 700, fontSize: '0.72rem' }}
          />
          <Typography variant="caption" color="text.secondary">
            Pencatatan termin pembayaran, upload resi transfer, & verifikasi otomatis status pelunasan proyek.
          </Typography>
        </Box>
      </Box>

      {/* Admin Tab Switcher: Client Payments vs Freelancer Payouts */}
      {!isClientRole && (
        <Paper elevation={0} sx={{ p: 0.8, mb: 3, borderRadius: 3, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', border: `1px solid ${theme.palette.divider}` }}>
          <Tabs
            value={mainTab}
            onChange={(e, val) => setMainTab(val)}
            variant="fullWidth"
            textColor="primary"
            indicatorColor="primary"
          >
            <Tab
              icon={<PaymentsIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              iconPosition="start"
              label={
                <>
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                    1. Pembayaran Masuk
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    1. Pembayaran Masuk (dari Klien)
                  </Box>
                </>
              }
              value="CLIENT"
              sx={{
                fontWeight: 800,
                textTransform: 'none',
                fontSize: { xs: '0.74rem', sm: '0.82rem', md: '0.88rem' },
                py: { xs: 1, sm: 1.5 },
                px: { xs: 0.8, sm: 2 },
                minHeight: { xs: 44, sm: 48 },
              }}
            />
            <Tab
              icon={<MoneyIcon sx={{ fontSize: { xs: 18, sm: 20 } }} />}
              iconPosition="start"
              label={
                <>
                  <Box component="span" sx={{ display: { xs: 'inline', md: 'none' } }}>
                    2. Upah Freelancer
                  </Box>
                  <Box component="span" sx={{ display: { xs: 'none', md: 'inline' } }}>
                    2. Pengeluaran Upah Freelancer (Penerima Upah)
                  </Box>
                </>
              }
              value="FREELANCER"
              sx={{
                fontWeight: 800,
                textTransform: 'none',
                fontSize: { xs: '0.74rem', sm: '0.82rem', md: '0.88rem' },
                py: { xs: 1, sm: 1.5 },
                px: { xs: 0.8, sm: 2 },
                minHeight: { xs: 44, sm: 48 },
              }}
            />
          </Tabs>
        </Paper>
      )}

      {/* FREELANCER WAGE PAYOUT SECTION FOR ADMIN */}
      {mainTab === 'FREELANCER' && !isClientRole && (
        <Box>
          <Paper variant="outlined" sx={{ p: { xs: 2.5, md: 3 }, mb: 3, borderRadius: 3.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 900, display: 'flex', alignItems: 'center', gap: 1 }}>
                  <MoneyIcon color="secondary" /> Transaksi Pengeluaran Upah Developer (Penerima Upah)
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Fitur Admin Management: Kelola transaksi transfer upah kepada mitra developer sesuai acuan Upah Dev pada HPP Financial Matrix.
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="secondary"
                startIcon={<AddIcon />}
                onClick={() => {
                  const defaultProj = availableProjects[0];
                  const devFee = defaultProj ? (defaultProj.freelancerFee || getFreelancerFeeForTier(defaultProj.tierNumber || 3)) : 0;
                  setFreelancerPayoutFormData({
                    date: new Date().toISOString().split('T')[0],
                    amount: String(Math.round(devFee * 0.4)),
                    stage: 'DP 40% SPK Signed',
                    notes: '',
                    status: 'VERIFIED',
                    proofUrl: '',
                    targetProjId: defaultProj?.id || '',
                    freelancerId: users.find((u) => u.role === 'FREELANCER')?.id || '',
                  });
                  setFreelancerPayoutDialogOpen(true);
                }}
                sx={{ borderRadius: 2.5, fontWeight: 800, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}
              >
                Catat Pengeluaran Upah Freelancer
              </Button>
            </Box>

            {/* KPI Cards */}
            <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.08)' : 'rgba(139, 92, 246, 0.04)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block' }}>
                    1. TOTAL UPAH DEV (HPP TIER)
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#8b5cf6' }}>
                    {formatRupiah(freelancerPayoutMetrics.grandFee)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(16, 185, 129, 0.04)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block' }}>
                    2. SUDAH DIBAYAR KE FREELANCER
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981' }}>
                    {formatRupiah(freelancerPayoutMetrics.grandPaid)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(245, 158, 11, 0.04)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block' }}>
                    3. SISA UPAH BELUM DIBAYAR
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#f59e0b' }}>
                    {formatRupiah(freelancerPayoutMetrics.grandRemaining)}
                  </Typography>
                </Paper>
              </Grid>

              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <Paper elevation={0} sx={{ p: 2, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: theme.palette.mode === 'dark' ? 'rgba(239, 68, 68, 0.08)' : 'rgba(239, 68, 68, 0.04)' }}>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, display: 'block' }}>
                    4. HARUS DIBAYAR SEKARANG
                  </Typography>
                  <Typography variant="h6" sx={{ fontWeight: 900, color: '#ef4444' }}>
                    {formatRupiah(freelancerPayoutMetrics.grandHarusDibayar)}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Table of Freelancer Payouts */}
            {/* Desktop Table View */}
            <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 3, display: { xs: 'none', md: 'block' } }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 800 }}>Tanggal</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Penerima Upah (Freelancer)</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Proyek & Tier HPP</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Tahap SPK/BAST</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Nominal Upah Dibayar</TableCell>
                    <TableCell sx={{ fontWeight: 800 }}>Status Transfer</TableCell>
                    <TableCell sx={{ fontWeight: 800, textAlign: 'right' }}>Aksi Admin</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {freelancerPayoutMetrics.list.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                        <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                          Belum ada catatan transaksi pengeluaran upah kepada freelancer.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    freelancerPayoutMetrics.list.map((pay) => (
                      <TableRow key={pay.id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{pay.date}</TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 28, height: 28, fontSize: '0.75rem', bgcolor: '#8b5cf6' }}>
                              {pay.freelancerName[0]?.toUpperCase()}
                            </Avatar>
                            <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                              {pay.freelancerName}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 700 }}>
                            {pay.projectTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            Upah Dev: {formatRupiah(pay.totalFee)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip label={pay.stage} size="small" color="secondary" sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell sx={{ fontWeight: 900, color: '#10b981' }}>
                          {formatRupiah(pay.amount)}
                        </TableCell>
                        <TableCell>
                          <Chip label={pay.status} size="small" color={pay.status === 'VERIFIED' ? 'success' : 'warning'} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                        </TableCell>
                        <TableCell align="right">
                          {pay.proofUrl && (
                            <IconButton
                              size="small"
                              color="info"
                              onClick={() => setProofPreviewModal({ open: true, payment: pay })}
                              title="Lihat Bukti Transfer R2"
                              sx={{ mr: 0.5 }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          )}
                          <IconButton size="small" color="error" onClick={() => handleDeleteFreelancerPayout(pay.id, pay.projectId)} title="Hapus Catatan Upah">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Mobile Card View */}
            <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mt: 2 }}>
              {freelancerPayoutMetrics.list.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                    Belum ada catatan transaksi pengeluaran upah kepada freelancer.
                  </Typography>
                </Paper>
              ) : (
                freelancerPayoutMetrics.list.map((pay) => (
                  <Paper
                    key={pay.id}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderRadius: 3,
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.015)',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        <Avatar sx={{ width: 34, height: 34, fontSize: '0.8rem', bgcolor: '#8b5cf6', fontWeight: 800 }}>
                          {pay.freelancerName[0]?.toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                            {pay.freelancerName}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {pay.date}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip label={pay.status} size="small" color={pay.status === 'VERIFIED' ? 'success' : 'warning'} sx={{ fontWeight: 800, fontSize: '0.65rem' }} />
                    </Box>

                    <Box sx={{ mb: 1.5, p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc' }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5 }}>
                        {pay.projectTitle}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <Typography variant="caption" color="text.secondary">Tahap:</Typography>
                          <Chip label={pay.stage} size="small" color="secondary" sx={{ fontWeight: 800, fontSize: '0.65rem', height: 20 }} />
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          Upah Dev: <strong>{formatRupiah(pay.totalFee)}</strong>
                        </Typography>
                      </Box>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary" display="block">
                          Nominal Upah Dibayar:
                        </Typography>
                        <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#10b981' }}>
                          {formatRupiah(pay.amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        {pay.proofUrl && (
                          <IconButton
                            size="small"
                            color="info"
                            onClick={() => setProofPreviewModal({ open: true, payment: pay })}
                            title="Lihat Bukti Transfer R2"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                        )}
                        <IconButton size="small" color="error" onClick={() => handleDeleteFreelancerPayout(pay.id, pay.projectId)} title="Hapus Catatan Upah">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </Paper>
                ))
              )}
            </Stack>
          </Paper>
        </Box>
      )}

      {/* Main Payment Container Card for Client Inbound (Active when mainTab === 'CLIENT') */}
      {(mainTab === 'CLIENT' || isClientRole) && (
        <Paper
          variant="outlined"
          sx={{
            p: { xs: 2.5, md: 3 },
            mb: 3,
            borderRadius: 3.5,
            backgroundColor: theme.palette.background.paper,
          }}
        >
          {/* Project Selection Banner */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2.5 }}>
            <Grid size={{ xs: 12, sm: 7 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5 }}>
                Pilih Proyek Klien (Laporan Pembayaran):
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              >
                {!isClientRole && (
                  <MenuItem value="ALL">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: 'primary.main' }}>
                        🌟 Semua Proyek & Transaksi Klien ({allPaymentsCount})
                      </Typography>
                      {totalPendingPaymentsCount > 0 && (
                        <Chip label={`${totalPendingPaymentsCount} PENDING`} size="small" color="warning" sx={{ fontWeight: 800, ml: 1, height: 20, fontSize: '0.65rem' }} />
                      )}
                    </Box>
                  </MenuItem>
                )}
                {availableProjects.map((p) => {
                  const pPending = (p.payments || []).filter((pay) => pay.status === 'PENDING').length;
                  return (
                    <MenuItem key={p.id} value={p.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                        <Box>
                          <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                            {p.clientName} — {p.title} ({formatRupiah(p.budget)})
                          </Typography>
                        </Box>
                        {pPending > 0 && (
                          <Chip label={`${pPending} ⏳`} size="small" color="warning" sx={{ fontWeight: 800, ml: 1, height: 18, fontSize: '0.6rem' }} />
                        )}
                      </Box>
                    </MenuItem>
                  );
                })}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 5 }} textAlign={{ sm: 'right' }}>
              <Box sx={{ display: 'flex', gap: 1, justifyContent: { sm: 'flex-end' }, flexWrap: { xs: 'nowrap', sm: 'wrap' }, mt: { xs: 1, sm: 2.5 } }}>
                <Button
                  variant="outlined"
                  color="info"
                  size="medium"
                  startIcon={<BankIcon />}
                  onClick={() => setBankInfoDialogOpen(true)}
                  sx={{ fontWeight: 800, borderRadius: 2.5, px: 2, py: 1, textTransform: 'none', flex: { xs: 1, sm: 'initial' }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}
                >
                  Info Rekening
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<AddIcon />}
                  onClick={handleOpenPaymentDialog}
                  sx={{ fontWeight: 800, borderRadius: 2.5, px: 2.5, py: 1, textTransform: 'none', flex: { xs: 1, sm: 'initial' }, fontSize: { xs: '0.75rem', sm: '0.875rem' }, whiteSpace: 'nowrap' }}
                >
                  <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Pembayaran Baru</Box>
                  <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>Pembayaran</Box>
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Info Alert Box */}
          <Alert severity="info" icon={<InfoIcon />} sx={{ borderRadius: 2, mb: 3, fontSize: '0.84rem' }}>
            {isAllProjects ? (
              <>Menampilkan gabungan laporan pembayaran untuk <strong>{availableProjects.length} Proyek Klien Aktif</strong>. Seluruh catatan transaksi & resi tersimpan permanen per proyek.</>
            ) : (
              <>Pembayaran saat ini untuk <strong>{selectedProject?.clientName}</strong> ({selectedProject?.title} — Budget: <strong>{formatRupiah(selectedProject?.budget || 0)}</strong>). Seluruh catatan transaksi & resi tersimpan permanen per proyek.</>
            )}
          </Alert>

          {/* 3 Financial Summary Cards with Enhanced Progress Bar */}
          <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  border: `1px solid ${theme.palette.divider}`,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.8 }}>
                    {isAllProjects ? 'TOTAL KONTRAK SEMUA PROYEK' : 'TOTAL NILAI KONTRAK'}
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary' }}>
                    {formatRupiah(totalBudget)}
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1.5, fontWeight: 600 }}>
                  Nilai total kontrak yang telah disepakati
                </Typography>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: 'rgba(16, 185, 129, 0.08)',
                  borderColor: 'rgba(16, 185, 129, 0.3)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                }}
              >
                <Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.8 }}>
                    <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', color: '#10b981' }}>
                      TOTAL TERBAYAR
                    </Typography>
                    <Chip label={`${paymentProgressPct}% LUNAS`} size="small" color="success" sx={{ fontWeight: 800, height: 20, fontSize: '0.65rem' }} />
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: '#10b981' }}>
                    {formatRupiah(totalPaidAmount)}
                  </Typography>
                </Box>
                <Box sx={{ mt: 1.5 }}>
                  <LinearProgress
                    variant="determinate"
                    value={paymentProgressPct}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'rgba(16,185,129,0.2)',
                      '& .MuiLinearProgress-bar': { bgcolor: '#10b981', borderRadius: 4 },
                    }}
                  />
                </Box>
              </Paper>
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: remainingBalance > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
                  borderColor: remainingBalance > 0 ? 'rgba(245, 158, 11, 0.3)' : 'rgba(16, 185, 129, 0.3)',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                }}
              >
                <Box>
                  <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', display: 'block', mb: 0.8, color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                    SISA PELUNASAN KONTRAK
                  </Typography>
                  <Typography variant="h5" sx={{ fontWeight: 800, color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                    {remainingBalance > 0 ? formatRupiah(remainingBalance) : 'LUNAS 100% ✅'}
                  </Typography>
                </Box>
                <Typography variant="caption" sx={{ mt: 1.5, fontWeight: 700, color: remainingBalance > 0 ? '#f59e0b' : '#10b981' }}>
                  {remainingBalance > 0 ? 'Menunggu pembayaran termin berikutnya' : 'Seluruh kewajiban pembayaran telah selesai'}
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          {/* Filter Tabs & Quick Search Bar */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2, mb: 2.5 }}>
            {/* Mobile View: 2 Kolom x 2 Baris */}
            <Box
              sx={{
                display: { xs: 'grid', md: 'none' },
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1,
                width: '100%',
              }}
            >
              {[
                { id: 'ALL' as const, shortLabel: `Semua (${paymentsListWithProject.length})`, fullLabel: `Semua (${paymentsListWithProject.length})` },
                { id: 'VERIFIED' as const, shortLabel: `Terverifikasi (${paymentsListWithProject.filter((p) => p.status === 'VERIFIED').length})`, fullLabel: `Terverifikasi (${paymentsListWithProject.filter((p) => p.status === 'VERIFIED').length})` },
                { id: 'PENDING' as const, shortLabel: `Pending (${paymentsListWithProject.filter((p) => p.status === 'PENDING').length})`, fullLabel: `Pending Approval (${paymentsListWithProject.filter((p) => p.status === 'PENDING').length})` },
                { id: 'FAILED' as const, shortLabel: `Ditolak (${paymentsListWithProject.filter((p) => p.status === 'FAILED').length})`, fullLabel: `Ditolak (${paymentsListWithProject.filter((p) => p.status === 'FAILED').length})` },
              ].map((tab) => {
                const isSelected = statusFilter === tab.id;
                return (
                  <Button
                    key={tab.id}
                    size="small"
                    variant={isSelected ? 'contained' : 'outlined'}
                    onClick={() => setStatusFilter(tab.id)}
                    sx={{
                      borderRadius: 2,
                      py: 0.75,
                      px: 1,
                      fontWeight: 800,
                      fontSize: '0.74rem',
                      textTransform: 'none',
                      whiteSpace: 'nowrap',
                      borderColor: isSelected ? 'primary.main' : theme.palette.divider,
                      bgcolor: isSelected ? 'primary.main' : 'transparent',
                      color: isSelected ? '#fff' : 'text.secondary',
                      '&:hover': {
                        bgcolor: isSelected ? 'primary.dark' : 'rgba(0,0,0,0.04)',
                      },
                    }}
                  >
                    {tab.shortLabel}
                  </Button>
                );
              })}
            </Box>

            {/* Desktop View: Horizontal Tabs */}
            <Box sx={{ display: { xs: 'none', md: 'block' } }}>
              <Tabs
                value={statusFilter}
                onChange={(_, val) => setStatusFilter(val)}
                sx={{
                  minHeight: 38,
                  '& .MuiTab-root': {
                    minHeight: 38,
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    textTransform: 'none',
                    borderRadius: 2,
                    px: 2,
                    mr: 1,
                  },
                }}
              >
                <Tab label={`Semua (${paymentsListWithProject.length})`} value="ALL" />
                <Tab label={`Terverifikasi (${paymentsListWithProject.filter((p) => p.status === 'VERIFIED').length})`} value="VERIFIED" />
                <Tab label={`Pending Approval (${paymentsListWithProject.filter((p) => p.status === 'PENDING').length})`} value="PENDING" />
                <Tab label={`Ditolak (${paymentsListWithProject.filter((p) => p.status === 'FAILED').length})`} value="FAILED" />
              </Tabs>
            </Box>

            <TextField
              size="small"
              placeholder="Cari transaksi / termin / catatan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ width: { xs: '100%', sm: 280 }, '& .MuiOutlinedInput-root': { borderRadius: 2.5 } }}
            />
          </Box>

          {/* Transactions Table */}
          {/* Desktop Table View */}
          <TableContainer component={Box} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 2.5, display: { xs: 'none', md: 'block' } }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f8fafc' }}>
                  <TableCell sx={{ fontWeight: 800 }}>Tanggal</TableCell>
                  {isAllProjects && <TableCell sx={{ fontWeight: 800 }}>Proyek & Klien</TableCell>}
                  <TableCell sx={{ fontWeight: 800 }}>Tahap / Termin Pembayaran</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Nominal (IDR)</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Bukti Pembayaran</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Catatan & Ref Transfer</TableCell>
                  <TableCell sx={{ fontWeight: 800 }}>Status Approval Admin</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 800 }}>Aksi / Invoice</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPaymentsList.length > 0 ? (
                  filteredPaymentsList.map((pay) => (
                    <TableRow key={`${pay.projectId}-${pay.id}`} hover sx={{ bgcolor: pay.status === 'PENDING' ? (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.05)' : '#fffbe6') : 'transparent' }}>
                      <TableCell sx={{ fontWeight: 700 }}>{pay.date}</TableCell>
                      {isAllProjects && (
                        <TableCell>
                          <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.84rem' }}>
                            {pay.projectTitle}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block">
                            {pay.clientName}
                          </Typography>
                        </TableCell>
                      )}
                      <TableCell>
                        <Chip label={pay.stage} size="small" variant="outlined" color="primary" sx={{ fontWeight: 700, fontSize: '0.72rem' }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 800, color: '#10b981', fontSize: '0.95rem' }}>
                        {formatRupiah(pay.amount)}
                      </TableCell>
                      <TableCell>
                        {pay.proofUrl ? (
                          <Button
                            size="small"
                            variant="outlined"
                            color="info"
                            startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                            onClick={() => setProofPreviewModal({ open: true, payment: pay })}
                            sx={{ fontSize: '0.72rem', py: 0.3, fontWeight: 700, textTransform: 'none' }}
                          >
                            Lihat Resi
                          </Button>
                        ) : (
                          <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            Tanpa Resi
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>
                        {pay.notes || '-'}
                      </TableCell>
                      <TableCell>
                        {pay.status === 'VERIFIED' && (
                          <Tooltip title={pay.approvedBy ? `Disetujui oleh ${pay.approvedBy} (${pay.approvedAt || pay.date})` : 'Disetujui Admin'}>
                            <Chip
                              icon={<CheckCircleIcon sx={{ fontSize: '14px !important' }} />}
                              label="DISUTUJU ADMIN ✅"
                              size="small"
                              color="success"
                              sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                            />
                          </Tooltip>
                        )}
                        {pay.status === 'PENDING' && (
                          <Tooltip title="Menunggu verifikasi persetujuan (approval) oleh Tim Admin Atasilabs">
                            <Chip
                              icon={<PendingIcon sx={{ fontSize: '14px !important' }} />}
                              label="MENUNGGU APPROVAL ⏳"
                              size="small"
                              color="warning"
                              sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                            />
                          </Tooltip>
                        )}
                        {pay.status === 'FAILED' && (
                          <Chip
                            icon={<CancelIcon sx={{ fontSize: '14px !important' }} />}
                            label="DITOLAK ❌"
                            size="small"
                            color="error"
                            sx={{ fontWeight: 800, fontSize: '0.7rem', height: 24 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={0.8} justifyContent="flex-end" alignItems="center">
                          <Button
                            size="small"
                            variant="outlined"
                            color="secondary"
                            startIcon={<ReceiptIcon sx={{ fontSize: 13 }} />}
                            onClick={() => {
                              setDocType('INVOICE');
                              setInvoiceModal({ open: true, payment: pay });
                              setPrintAllModalInvoices(false);
                            }}
                            sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 800, textTransform: 'none' }}
                          >
                            Invoice
                          </Button>
                          <Button
                            size="small"
                            variant="contained"
                            color="primary"
                            startIcon={<ReceiptIcon sx={{ fontSize: 13 }} />}
                            onClick={() => {
                              setDocType('KWITANSI');
                              setInvoiceModal({ open: true, payment: pay });
                              setPrintAllModalInvoices(false);
                            }}
                            sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 800, textTransform: 'none' }}
                          >
                            Kwitansi
                          </Button>
                          {!isClientRole && pay.status === 'PENDING' && (
                            <>
                              <Button
                                size="small"
                                variant="contained"
                                color="success"
                                startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                onClick={() => handleApprovePayment(pay.id, pay.projectId)}
                                sx={{ fontSize: '0.7rem', py: 0.3, px: 1.2, fontWeight: 800 }}
                              >
                                Approve
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                startIcon={<CancelIcon sx={{ fontSize: 13 }} />}
                                onClick={() => handleRejectPayment(pay.id, pay.projectId)}
                                sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 700 }}
                              >
                                Tolak
                              </Button>
                            </>
                          )}
                          <IconButton size="small" color="error" onClick={() => handleDeletePaymentRecord(pay.id, pay.projectId)} title="Hapus transaksi">
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={isAllProjects ? 8 : 7} align="center" sx={{ py: 4, color: 'text.secondary', fontSize: '0.9rem' }}>
                      Belum ada riwayat transaksi pembayaran yang dicatat. Klik <strong>"Pembayaran Baru"</strong> di atas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Mobile Card View */}
          <Stack spacing={2} sx={{ display: { xs: 'flex', md: 'none' }, mt: 2 }}>
            {filteredPaymentsList.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 3, textAlign: 'center', borderRadius: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  Belum ada riwayat transaksi pembayaran yang dicatat. Klik <strong>"Pembayaran Baru"</strong> di atas.
                </Typography>
              </Paper>
            ) : (
              filteredPaymentsList.map((pay) => (
                <Paper
                  key={`${pay.projectId}-${pay.id}`}
                  variant="outlined"
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${theme.palette.divider}`,
                    bgcolor: pay.status === 'PENDING'
                      ? (theme.palette.mode === 'dark' ? 'rgba(245, 158, 11, 0.06)' : '#fffbe6')
                      : (theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.01)'),
                  }}
                >
                  {/* Header Pembayaran (1 Kolom Vertikal Rapi) */}
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', mb: 1.5, gap: 0.8, width: '100%' }}>
                    {/* Baris 1: Tanggal & Status Chip */}
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        {pay.date}
                      </Typography>
                      {pay.status === 'VERIFIED' && (
                        <Chip
                          icon={<CheckCircleIcon sx={{ fontSize: '13px !important' }} />}
                          label="DISETUJUI ✅"
                          size="small"
                          color="success"
                          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                        />
                      )}
                      {pay.status === 'PENDING' && (
                        <Chip
                          icon={<PendingIcon sx={{ fontSize: '13px !important' }} />}
                          label="PENDING ⏳"
                          size="small"
                          color="warning"
                          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                        />
                      )}
                      {pay.status === 'FAILED' && (
                        <Chip
                          icon={<CancelIcon sx={{ fontSize: '13px !important' }} />}
                          label="DITOLAK ❌"
                          size="small"
                          color="error"
                          sx={{ fontWeight: 800, fontSize: '0.68rem', height: 22 }}
                        />
                      )}
                    </Box>

                    {/* Baris 2: Stage Chip */}
                    <Chip
                      label={pay.stage}
                      size="small"
                      variant="outlined"
                      color="primary"
                      sx={{ fontWeight: 700, fontSize: '0.68rem', height: 22 }}
                    />

                    {/* Baris 3: Judul Proyek & Klien */}
                    {isAllProjects && (
                      <Box sx={{ width: '100%', mt: 0.2 }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.92rem', lineHeight: 1.35 }}>
                          {pay.projectTitle}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" display="block" sx={{ fontSize: '0.74rem', mt: 0.2 }}>
                          {pay.clientName}
                        </Typography>
                      </Box>
                    )}
                  </Box>

                  <Box sx={{ my: 1.5, p: 1.5, borderRadius: 2, bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Nominal Pembayaran:
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 900, color: '#10b981', fontSize: '1.05rem' }}>
                        {formatRupiah(pay.amount)}
                      </Typography>
                    </Box>
                    {pay.proofUrl ? (
                      <Button
                        size="small"
                        variant="outlined"
                        color="info"
                        startIcon={<VisibilityIcon sx={{ fontSize: 13 }} />}
                        onClick={() => setProofPreviewModal({ open: true, payment: pay })}
                        sx={{ fontSize: '0.72rem', py: 0.4, fontWeight: 700, textTransform: 'none', borderRadius: 2 }}
                      >
                        Lihat Resi
                      </Button>
                    ) : (
                      <Typography variant="caption" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                        Tanpa Resi
                      </Typography>
                    )}
                  </Box>

                  {pay.notes && (
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5, fontStyle: 'italic' }}>
                      Catatan: {pay.notes}
                    </Typography>
                  )}

                  <Box sx={{ pt: 1, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
                    <Stack direction="row" spacing={0.8}>
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        startIcon={<ReceiptIcon sx={{ fontSize: 13 }} />}
                        onClick={() => {
                          setDocType('INVOICE');
                          setInvoiceModal({ open: true, payment: pay });
                          setPrintAllModalInvoices(false);
                        }}
                        sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
                      >
                        Invoice
                      </Button>
                      <Button
                        size="small"
                        variant="contained"
                        color="primary"
                        startIcon={<ReceiptIcon sx={{ fontSize: 13 }} />}
                        onClick={() => {
                          setDocType('KWITANSI');
                          setInvoiceModal({ open: true, payment: pay });
                          setPrintAllModalInvoices(false);
                        }}
                        sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 800, textTransform: 'none', borderRadius: 2 }}
                      >
                        Kwitansi
                      </Button>
                    </Stack>

                    <Stack direction="row" spacing={0.5} alignItems="center">
                      {!isClientRole && pay.status === 'PENDING' && (
                        <>
                          <Button
                            size="small"
                            variant="contained"
                            color="success"
                            startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleApprovePayment(pay.id, pay.projectId)}
                            sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 800, borderRadius: 2 }}
                          >
                            Approve
                          </Button>
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<CancelIcon sx={{ fontSize: 13 }} />}
                            onClick={() => handleRejectPayment(pay.id, pay.projectId)}
                            sx={{ fontSize: '0.7rem', py: 0.3, px: 1, fontWeight: 700, borderRadius: 2 }}
                          >
                            Tolak
                          </Button>
                        </>
                      )}
                      <IconButton size="small" color="error" onClick={() => handleDeletePaymentRecord(pay.id, pay.projectId)} title="Hapus transaksi">
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Stack>
                  </Box>
                </Paper>
              ))
            )}
          </Stack>
        </Paper>
      )}

      {/* Dialog Modal: Catat Pengeluaran Upah Freelancer (Fitur Admin) */}
      <Drawer
        anchor="right"
        open={freelancerPayoutDialogOpen}
        onClose={() => setFreelancerPayoutDialogOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 540, md: 620 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        <form onSubmit={handleSaveFreelancerPayout} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <Box sx={{ p: 2.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: (t) => `1px solid ${t.palette.divider}` }}>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>
              Catat Pengeluaran Upah Freelancer
            </Typography>
            <IconButton size="small" onClick={() => setFreelancerPayoutDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
            <Stack spacing={2.5}>
              {/* Select Freelancer (Penerima Upah) */}
              <TextField
                select
                fullWidth
                size="small"
                label="Penerima Upah (Freelancer)"
                value={freelancerPayoutFormData.freelancerId}
                onChange={(e) => setFreelancerPayoutFormData((prev) => ({ ...prev, freelancerId: e.target.value }))}
                required
              >
                {users
                  .filter((u) => u.role === 'FREELANCER' || u.role === 'DEVELOPER')
                  .map((u) => (
                    <MenuItem key={u.id} value={u.id}>
                      {u.name} ({u.role}) — {u.email}
                    </MenuItem>
                  ))}
              </TextField>

              {/* Select Project */}
              <TextField
                select
                fullWidth
                size="small"
                label="Pilih Proyek Target"
                value={freelancerPayoutFormData.targetProjId}
                onChange={(e) => {
                  const pid = e.target.value;
                  const proj = availableProjects.find((p) => p.id === pid);
                  const devFee = proj ? (proj.freelancerFee || getFreelancerFeeForTier(proj.tierNumber || 3)) : 0;
                  setFreelancerPayoutFormData((prev) => ({
                    ...prev,
                    targetProjId: pid,
                    amount: prev.amount || String(Math.round(devFee * 0.4)),
                  }));
                }}
                required
              >
                {availableProjects.map((p) => {
                  const devFee = p.freelancerFee || getFreelancerFeeForTier(p.tierNumber || 3);
                  return (
                    <MenuItem key={p.id} value={p.id}>
                      {p.title} ({p.clientName}) — Upah Dev: {formatRupiah(devFee)}
                    </MenuItem>
                  );
                })}
              </TextField>

              {/* Amount Paid */}
              <TextField
                fullWidth
                size="small"
                type="number"
                label="Nominal Upah Dibayar (Rp)"
                placeholder="misal: 1400000"
                value={freelancerPayoutFormData.amount}
                onChange={(e) => setFreelancerPayoutFormData((prev) => ({ ...prev, amount: e.target.value }))}
                required
              />

              {/* Stage / Termin */}
              <TextField
                select
                fullWidth
                size="small"
                label="Tahap / Skema Pembayaran Upah"
                value={freelancerPayoutFormData.stage}
                onChange={(e) => setFreelancerPayoutFormData((prev) => ({ ...prev, stage: e.target.value }))}
              >
                <MenuItem value="DP 40% SPK Signed">DP 40% (Tahap Rilis SPK)</MenuItem>
                <MenuItem value="Pelunasan 60% BAST">Pelunasan 60% (Tahap Closure BAST)</MenuItem>
                <MenuItem value="Pembayaran Gradual / Termin">Pembayaran Gradual / Termin</MenuItem>
                <MenuItem value="Bonus / Insentif Dev">Bonus / Insentif Dev</MenuItem>
              </TextField>

              {/* Date */}
              <TextField
                fullWidth
                size="small"
                type="date"
                label="Tanggal Transfer Upah"
                value={freelancerPayoutFormData.date}
                onChange={(e) => setFreelancerPayoutFormData((prev) => ({ ...prev, date: e.target.value }))}
                slotProps={{ inputLabel: { shrink: true } }}
              />

              {/* Dedicated Cloudflare R2 Image Upload Box */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.04)' : '#fcfaff',
                  border: `1.5px dashed ${theme.palette.mode === 'dark' ? 'rgba(139, 92, 246, 0.3)' : 'rgba(139, 92, 246, 0.4)'}`,
                  textAlign: 'center',
                  transition: 'all 0.2s',
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, color: '#8b5cf6', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <UploadIcon fontSize="small" /> Upload Bukti Resi Gambar (Cloudflare R2)
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Pilih foto/resi transfer bank (PNG, JPG, WebP - Maks 10MB). Gambar otomatis diunggah ke Cloudflare R2.
                </Typography>

                {freelancerPayoutFormData.proofUrl ? (
                  <Box sx={{ textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={freelancerPayoutFormData.proofUrl}
                      alt="Bukti Resi Transfer"
                      sx={{
                        maxHeight: 180,
                        maxWidth: '100%',
                        objectFit: 'contain',
                        borderRadius: 2.5,
                        border: '1px solid rgba(16,185,129,0.4)',
                        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                        mb: 1.5,
                        mx: 'auto',
                        display: 'block',
                      }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'center' }}>
                      <Button
                        variant="outlined"
                        component="label"
                        color="secondary"
                        size="small"
                        disabled={isUploadingR2}
                        startIcon={<UploadIcon />}
                        sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}
                      >
                        {isUploadingR2 ? 'Mengunggah ke R2...' : 'Ganti Gambar Resi'}
                        <input type="file" accept="image/*" hidden onChange={handleFreelancerFileUpload} />
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => setFreelancerPayoutFormData((prev) => ({ ...prev, proofUrl: '' }))}
                        sx={{ fontWeight: 800, borderRadius: 2, textTransform: 'none' }}
                      >
                        Hapus Gambar
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <Button
                    variant="contained"
                    component="label"
                    disabled={isUploadingR2}
                    startIcon={<UploadIcon />}
                    sx={{
                      fontWeight: 800,
                      borderRadius: 2.5,
                      px: 3,
                      py: 1.2,
                      textTransform: 'none',
                      bgcolor: '#8b5cf6',
                      '&:hover': { bgcolor: '#7c3aed' },
                      boxShadow: '0 4px 14px rgba(139, 92, 246, 0.35)',
                    }}
                  >
                    {isUploadingR2 ? 'Mengunggah ke Cloudflare R2...' : '📷 Pilih Gambar Resi Transfer'}
                    <input type="file" accept="image/*" hidden onChange={handleFreelancerFileUpload} />
                  </Button>
                )}
              </Paper>

              {/* Notes */}
              <TextField
                fullWidth
                size="small"
                multiline
                rows={2}
                label="Catatan Pembayaran Upah"
                placeholder="Catatan transfer fee developer..."
                value={freelancerPayoutFormData.notes}
                onChange={(e) => setFreelancerPayoutFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </Stack>
          </Box>

          <Box sx={{ p: 2, px: 3, borderTop: (t) => `1px solid ${t.palette.divider}`, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: 'background.paper' }}>
            <Button onClick={() => setFreelancerPayoutDialogOpen(false)} sx={{ fontWeight: 700 }}>
              Batal
            </Button>
            <Button type="submit" variant="contained" color="secondary" sx={{ fontWeight: 800, borderRadius: 2, bgcolor: '#8b5cf6', '&:hover': { bgcolor: '#7c3aed' } }}>
              Simpan Pengeluaran Upah
            </Button>
          </Box>
        </form>
      </Drawer>

      {/* Form Drawer Input Pembayaran */}
      <Drawer
        anchor="right"
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 540, md: 640 },
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: theme.palette.background.paper,
          },
        }}
      >
        <Box sx={{ p: 2.5, px: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar
              sx={{
                width: 44,
                height: 44,
                bgcolor: 'primary.main',
                boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
              }}
            >
              <PaymentsIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                {isClientRole ? 'Upload Bukti Transfer Pembayaran' : 'Catat & Input Pembayaran Proyek'}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {isClientRole ? 'Kirimkan bukti transfer untuk verifikasi tim admin' : 'Kelola transaksi penerimaan transfer & termin pembayaran proyek'}
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setPaymentDialogOpen(false)} size="small" sx={{ borderRadius: 2 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 3 }}>
          <Alert severity="info" sx={{ mb: 3, borderRadius: 2.5, fontSize: '0.84rem' }}>
            {isClientRole ? (
              <>
                Upload bukti transfer pembayaran untuk proyek <strong>{currentFormProj?.title}</strong>. Total Nilai Kontrak: <strong>{formatRupiah(formTargetBudget)}</strong>.
                {formTerminPct && (
                  <> Termin: <strong>{paymentFormData.stage}</strong> ({formTerminPct}% = <strong>{formatRupiah(paymentFormData.amount)}</strong>).</>
                )}
              </>
            ) : (
              <>
                Catat pembayaran untuk proyek <strong>{currentFormProj?.title}</strong>. Total Kontrak: <strong>{formatRupiah(formTargetBudget)}</strong>.
                {formTerminPct && (
                  <> Termin: <strong>{paymentFormData.stage}</strong> ({formTerminPct}% = <strong>{formatRupiah(paymentFormData.amount)}</strong>).</>
                )}
              </>
            )}
          </Alert>

          <Grid container spacing={2.5}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                label="Target Proyek Klien"
                value={paymentFormData.targetProjId}
                onChange={(e) => handleFormTargetProjChange(e.target.value)}
              >
                {availableProjects.map((p) => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.title} — {p.clientName} ({formatRupiah(p.budget)})
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                type="date"
                label="Tanggal Pembayaran / Transfer"
                InputLabelProps={{ shrink: true }}
                value={paymentFormData.date}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, date: e.target.value }))}
                required
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                select
                fullWidth
                label="Tahap / Termin Pembayaran"
                value={paymentFormData.stage}
                onChange={(e) => handleFormStageChange(e.target.value)}
              >
                <MenuItem value="DP Tahap 1 (30%)">
                  DP Tahap 1 (30%) - Penandatanganan MoU {formTargetBudget > 0 ? `(${formatRupiah(Math.round(formTargetBudget * 0.3))})` : ''}
                </MenuItem>
                <MenuItem value="Termin Progress Tahap 2 (30%)">
                  Termin Progress Tahap 2 (30%) - Desain / Mid Dev {formTargetBudget > 0 ? `(${formatRupiah(Math.round(formTargetBudget * 0.3))})` : ''}
                </MenuItem>
                <MenuItem value="Pelunasan Tahap 3 (40%)">
                  Pelunasan Tahap 3 (40%) - Sebelum Live Deployment {formTargetBudget > 0 ? `(${formatRupiah(Math.round(formTargetBudget * 0.4))})` : ''}
                </MenuItem>
                <MenuItem value="DP Tahap 1 (50%)">
                  DP Tahap 1 (50%) - Tier 1-2 {formTargetBudget > 0 ? `(${formatRupiah(Math.round(formTargetBudget * 0.5))})` : ''}
                </MenuItem>
                <MenuItem value="Pelunasan Tahap 2 (50%)">
                  Pelunasan Tahap 2 (50%) - Tier 1-2 {formTargetBudget > 0 ? `(${formatRupiah(Math.round(formTargetBudget * 0.5))})` : ''}
                </MenuItem>
                <MenuItem value="Pembayaran Tambahan / Add-on">
                  Pembayaran Tambahan / Add-on {formRemainingBalance > 0 ? `(Sisa: ${formatRupiah(formRemainingBalance)})` : ''}
                </MenuItem>
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: isClientRole ? 12 : 6 }}>
              <TextField
                fullWidth
                type="number"
                label="Nominal Pembayaran (IDR)"
                value={paymentFormData.amount || ''}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, amount: Number(e.target.value) }))}
                helperText={
                  formTerminPct
                    ? `Otomatis ${formTerminPct}% dari nilai proyek ${formatRupiah(formTargetBudget)} | Terbilang: Rp ${(paymentFormData.amount || 0).toLocaleString('id-ID')}`
                    : `Terbilang: Rp ${(paymentFormData.amount || 0).toLocaleString('id-ID')}`
                }
                slotProps={{
                  input: {
                    startAdornment: <InputAdornment position="start">Rp</InputAdornment>,
                    endAdornment: formTerminPct ? (
                      <InputAdornment position="end">
                        <Chip
                          label={`${formTerminPct}% Kontrak`}
                          size="small"
                          color="success"
                          variant="outlined"
                          sx={{ fontWeight: 800, fontSize: '0.72rem', height: 24 }}
                        />
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
                required
              />
            </Grid>

            {!isClientRole && (
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  select
                  fullWidth
                  label="Status Verifikasi / Approval Admin"
                  value={paymentFormData.status}
                  onChange={(e) => setPaymentFormData((prev: any) => ({ ...prev, status: e.target.value }))}
                >
                  <MenuItem value="VERIFIED">TERVERIFIKASI / DISUTUJU (LUNAS)</MenuItem>
                  <MenuItem value="PENDING">PENDING (Menunggu Verifikasi Admin)</MenuItem>
                  <MenuItem value="FAILED">GAGAL / DITOLAK</MenuItem>
                </TextField>
              </Grid>
            )}

            {/* Upload Bukti Pembayaran Box (Style LeadsView) */}
            <Grid size={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  borderRadius: 3,
                  backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  border: `1.5px dashed ${theme.palette.divider}`,
                  textAlign: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    borderColor: theme.palette.primary.main,
                    bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.05)' : 'rgba(99,102,241,0.02)',
                  },
                }}
              >
                <Typography variant="subtitle2" sx={{ fontWeight: 800, mb: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
                  <UploadIcon color="primary" fontSize="small" /> Unggah Bukti Transfer / Resi Pembayaran
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Format file PNG/JPG (Maks 5MB). Diperlukan untuk verifikasi admin.
                </Typography>

                <Button
                  variant="outlined"
                  component="label"
                  startIcon={<UploadIcon />}
                  sx={{ fontWeight: 700, borderRadius: 2.5, px: 3, py: 0.8, textTransform: 'none' }}
                >
                  Pilih Foto Resi Bukti Transfer
                  <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                </Button>

                {paymentFormData.proofUrl && (
                  <Box sx={{ mt: 2, p: 2, borderRadius: 2.5, bgcolor: theme.palette.mode === 'dark' ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.3)', display: 'inline-block', maxWidth: '100%' }}>
                    <Typography variant="caption" sx={{ fontWeight: 700, color: '#10b981', display: 'block', mb: 1 }}>
                      ✓ Pratinjau Resi Terunggah:
                    </Typography>
                    <Box
                      component="img"
                      src={paymentFormData.proofUrl}
                      alt="Pratinjau Bukti Pembayaran"
                      sx={{ maxHeight: 160, maxWidth: '100%', objectFit: 'contain', borderRadius: 2, border: `1px solid ${theme.palette.divider}`, mx: 'auto' }}
                    />
                  </Box>
                )}
              </Paper>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Catatan & Referensi Bank (No. Rekening / Ref Transfer)"
                placeholder="Contoh: Transfer Bank BRI Ref #88219 a.n. PT AULIA INDOLAND GRUP"
                value={paymentFormData.notes}
                onChange={(e) => setPaymentFormData((prev) => ({ ...prev, notes: e.target.value }))}
              />
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ p: 2, px: 3, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'flex-end', gap: 1.5, bgcolor: theme.palette.background.paper }}>
          <Button onClick={() => setPaymentDialogOpen(false)} variant="outlined" color="inherit" sx={{ fontWeight: 700, borderRadius: 2.5, px: 2.5, textTransform: 'none' }}>
            Batal
          </Button>
          <Button variant="contained" color="primary" onClick={handleSavePaymentRecord} sx={{ fontWeight: 800, borderRadius: 2.5, px: 3.5, py: 1, textTransform: 'none' }}>
            {isClientRole ? 'Kirim Bukti Pembayaran' : 'Simpan Pembayaran'}
          </Button>
        </Box>
      </Drawer>

      {/* Rincian & Resi Pembayaran Modal (Exact LeadsView Detail Modal Layout) */}
      <Dialog
        open={proofPreviewModal.open}
        onClose={() => setProofPreviewModal({ open: false })}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              p: 1,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        {proofPreviewModal.payment && (
          <>
            <DialogTitle component="div" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: 'primary.main',
                    boxShadow: '0 4px 14px rgba(99,102,241,0.3)',
                  }}
                >
                  <ReceiptIcon />
                </Avatar>
                <Box>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                    Rincian & Bukti Resi Pembayaran Proyek
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    ID Transaksi: #{proofPreviewModal.payment.id} &bull; Tanggal: {proofPreviewModal.payment.date}
                  </Typography>
                </Box>
              </Box>
              <IconButton onClick={() => setProofPreviewModal({ open: false })} size="small" sx={{ borderRadius: 2 }}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ p: 3 }}>
              {/* Payment Details 4-Card Grid (Matching LeadsView Detail Sender Grid) */}
              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(248, 250, 252, 1)',
                  border: `1px solid ${theme.palette.divider}`,
                  mb: 3,
                }}
              >
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2.5,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(99,102,241,0.1)', color: '#6366f1' }}>
                      <ProjectIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Proyek & Klien
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {proofPreviewModal.payment.projectTitle || selectedProject?.title || 'Proyek Klien'}
                      </Typography>
                      <Typography variant="caption" color="primary" sx={{ fontWeight: 600 }}>
                        {proofPreviewModal.payment.clientName || selectedProject?.clientName || '-'}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
                      <MoneyIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Nominal Transaksi
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#10b981', fontSize: '1.05rem' }}>
                        {formatRupiah(proofPreviewModal.payment.amount)}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>
                      <CalendarIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tanggal Pembayaran
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {proofPreviewModal.payment.date}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5 }}>
                    <Avatar sx={{ width: 34, height: 34, bgcolor: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>
                      <AutoIcon sx={{ fontSize: 18 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Tahap / Termin
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {proofPreviewModal.payment.stage}
                      </Typography>
                    </Box>
                  </Box>
                </Box>
              </Paper>

              {/* Resi Image Box (Matching LeadsView Message Box) */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                  📷 Lampiran Bukti Transfer / Resi:
                </Typography>
                {proofPreviewModal.payment.proofUrl && (
                  <Button
                    size="small"
                    component="a"
                    href={proofPreviewModal.payment.proofUrl}
                    target="_blank"
                    startIcon={<VisibilityIcon sx={{ fontSize: 14 }} />}
                    sx={{ fontSize: '0.75rem', textTransform: 'none', fontWeight: 700 }}
                  >
                    Buka Ukuran Penuh
                  </Button>
                )}
              </Box>

              <Paper
                elevation={0}
                sx={{
                  p: 2.5,
                  borderRadius: 3,
                  backgroundColor:
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#f8fafc',
                  border: `1px solid ${theme.palette.divider}`,
                  textAlign: 'center',
                  mb: 3,
                }}
              >
                {proofPreviewModal.payment.proofUrl ? (
                  <Box
                    component="img"
                    src={proofPreviewModal.payment.proofUrl}
                    alt="Resi Bukti Pembayaran"
                    sx={{
                      maxWidth: '100%',
                      maxHeight: 380,
                      objectFit: 'contain',
                      borderRadius: 2.5,
                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                      border: `1px solid ${theme.palette.divider}`,
                    }}
                  />
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ py: 3, fontStyle: 'italic' }}>
                    Lampiran resi gambar tidak diunggah untuk transaksi ini.
                  </Typography>
                )}
              </Paper>

              {/* Status & Notes Bar (Matching LeadsView Status Selector Bar) */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 2,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)',
                  border: `1px solid ${theme.palette.divider}`,
                  flexWrap: 'wrap',
                  gap: 1.5,
                }}
              >
                <Box sx={{ maxWidth: '60%' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700 }}>
                    Catatan & Referensi Bank:
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700 }}>
                    {proofPreviewModal.payment.notes || 'Tidak ada catatan tambahan.'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'right' }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, mb: 0.5 }}>
                    Status Approval:
                  </Typography>
                  <Chip
                    label={
                      proofPreviewModal.payment.status === 'VERIFIED'
                        ? 'VERIFIED / LUNAS'
                        : proofPreviewModal.payment.status === 'FAILED'
                          ? 'GAGAL / DITOLAK'
                          : 'PENDING VERIFIKASI'
                    }
                    size="small"
                    color={
                      proofPreviewModal.payment.status === 'VERIFIED'
                        ? 'success'
                        : proofPreviewModal.payment.status === 'FAILED'
                          ? 'error'
                          : 'warning'
                    }
                    sx={{ fontWeight: 800, fontSize: '0.75rem' }}
                  />
                </Box>
              </Box>
            </DialogContent>

            <DialogActions sx={{ p: 2.5, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button onClick={() => setProofPreviewModal({ open: false })} variant="contained" color="primary" sx={{ borderRadius: 2.5, fontWeight: 800, px: 3, textTransform: 'none' }}>
                Tutup Rincian
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Informasi Rekening Bank & QRIS Modal */}
      <Dialog
        open={bankInfoDialogOpen}
        onClose={() => setBankInfoDialogOpen(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 4,
              p: 1,
              backgroundColor: theme.palette.background.paper,
              backgroundImage: 'none',
              boxShadow: '0 24px 48px rgba(0,0,0,0.2)',
            },
          },
        }}
      >
        <DialogTitle component="div" sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 44, height: 44, bgcolor: 'primary.main', boxShadow: '0 4px 14px rgba(99,102,241,0.3)' }}>
              <BankIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                Informasi Rekening Resmi & QRIS
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Metode Pembayaran Resmi PT AULIA INDOLAND GRUP
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={() => setBankInfoDialogOpen(false)} size="small" sx={{ borderRadius: 2 }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
          <Alert severity="success" icon={<SecurityIcon />} sx={{ mb: 2.5, borderRadius: 2.5, fontSize: '0.84rem' }}>
            Pastikan seluruh transfer pembayaran ditujukan ke rekening resmi atas nama <strong>PT AULIA INDOLAND GRUP</strong>.
          </Alert>

          <Stack spacing={2}>
            {/* BRI Card (Satu-satunya Rekening Resmi) */}
            <Paper
              variant="outlined"
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 3,
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row' },
                alignItems: { xs: 'stretch', sm: 'center' },
                justifyContent: 'space-between',
                gap: { xs: 2, sm: 2 },
                bgcolor: theme.palette.mode === 'dark' ? 'rgba(99,102,241,0.05)' : '#f8fafc',
                border: `1.5px solid ${theme.palette.primary.main}`,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', color: '#ffffff', fontWeight: 900, fontSize: '0.85rem', width: 44, height: 44, flexShrink: 0 }}>
                  BRI
                </Avatar>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                    BANK BRI (BANK RAKYAT INDONESIA)
                  </Typography>
                  <Typography
                    variant="subtitle1"
                    sx={{
                      fontWeight: 900,
                      fontFamily: 'monospace',
                      letterSpacing: { xs: 0.5, sm: 1 },
                      color: 'primary.main',
                      fontSize: { xs: '1.05rem', sm: '1.15rem' },
                      whiteSpace: 'nowrap',
                      my: 0.2,
                    }}
                  >
                    4388-01-0000-25-56-7
                  </Typography>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600, fontSize: '0.75rem' }}>
                    Atas Nama: <strong>PT AULIA INDOLAND GRUP</strong>
                  </Typography>
                </Box>
              </Box>
              <Button
                size="small"
                variant="contained"
                color="primary"
                startIcon={<CopyIcon sx={{ fontSize: 15 }} />}
                onClick={() => handleCopyAccount('4388-01-0000-25-56-7', 'BRI')}
                sx={{
                  fontWeight: 800,
                  borderRadius: 2.5,
                  textTransform: 'none',
                  fontSize: '0.8rem',
                  py: { xs: 1, sm: 0.8 },
                  px: 2.5,
                  width: { xs: '100%', sm: 'auto' },
                  whiteSpace: 'nowrap',
                }}
              >
                Salin Rekening
              </Button>
            </Paper>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: { xs: 2, sm: 2.5 }, px: { xs: 2, sm: 3 } }}>
          <Button onClick={() => setBankInfoDialogOpen(false)} variant="contained" color="primary" sx={{ fontWeight: 800, borderRadius: 2.5, px: 3, textTransform: 'none', width: { xs: '100%', sm: 'auto' } }}>
            Tutup Informasi Bank
          </Button>
        </DialogActions>
      </Dialog>

      {/* Official Printable Invoice Modal / Drawer */}
      <Drawer
        anchor="right"
        open={invoiceModal.open}
        onClose={() => setInvoiceModal({ open: false })}
        className="invoice-drawer-root"
        PaperProps={{
          className: 'invoice-drawer-paper',
          sx: {
            width: { xs: '100%', sm: 600, md: 720 },
            boxSizing: 'border-box',
            backgroundColor: theme.palette.background.paper,
            backgroundImage: 'none',
            display: 'flex',
            flexDirection: 'column',
          },
        }}
      >
        {invoiceModal.payment && (
          <>


            <Box className="no-print" sx={{ p: 2.5, px: 3, borderBottom: `1px solid ${theme.palette.divider}` }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Avatar sx={{ width: 44, height: 44, bgcolor: 'secondary.main', boxShadow: '0 4px 14px rgba(139,92,246,0.3)' }}>
                    <ReceiptIcon />
                  </Avatar>
                  <Box>
                    <Typography variant="h6" component="h2" sx={{ fontWeight: 800, lineHeight: 1.2 }}>
                      {docType === 'KWITANSI' ? 'Kwitansi / Faktur Pembayaran' : 'Official Invoice Tagihan'}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {docType === 'KWITANSI'
                        ? 'Bukti Tanda Terima Pembayaran Resmi & Sah Atasilabs'
                        : 'Dokumen Tagihan Resmi & Rincian Termin Atasilabs'}
                    </Typography>
                  </Box>
                </Box>
                <IconButton onClick={() => setInvoiceModal({ open: false })} size="small" sx={{ borderRadius: 2 }}>
                  <CloseIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Document Type Switcher Tabs */}
              <Tabs
                value={docType}
                onChange={(_, val) => setDocType(val)}
                textColor="secondary"
                indicatorColor="secondary"
                sx={{ minHeight: 38, mt: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}
              >
                <Tab
                  value="KWITANSI"
                  label="Faktur Pembayaran"
                  sx={{ minHeight: 38, py: 0.5, fontWeight: 800, fontSize: '0.78rem', textTransform: 'none' }}
                />
                <Tab
                  value="INVOICE"
                  label="Invoice"
                  sx={{ minHeight: 38, py: 0.5, fontWeight: 800, fontSize: '0.78rem', textTransform: 'none' }}
                />
              </Tabs>

              {targetProjectPaymentCount > 1 && (
                <Stack direction="row" spacing={1} sx={{ mt: 1.5 }}>
                  <Button
                    size="small"
                    variant={!printAllModalInvoices ? 'contained' : 'outlined'}
                    color="primary"
                    onClick={() => setPrintAllModalInvoices(false)}
                    sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2 }}
                  >
                    {docType === 'KWITANSI' ? 'Kwitansi Pembayaran Ini' : 'Invoice Pembayaran Ini'} (1 Halaman)
                  </Button>
                  <Button
                    size="small"
                    variant={printAllModalInvoices ? 'contained' : 'outlined'}
                    color="secondary"
                    onClick={() => setPrintAllModalInvoices(true)}
                    sx={{ textTransform: 'none', fontWeight: 800, fontSize: '0.72rem', borderRadius: 2 }}
                  >
                    Semua {docType === 'KWITANSI' ? 'Kwitansi' : 'Invoice'} ({targetProjectPaymentCount} Halaman)
                  </Button>
                </Stack>
              )}
            </Box>

            <Box id="invoice-scroll-area" sx={{ flexGrow: 1, overflowY: 'auto', p: { xs: 2.5, md: 3 } }}>
              <Box id="printable-invoice-container">
                {invoicePaymentsToRender.map((payItem, idx) => {
                  const allChronologicalPayments = targetProjectData?.payments || [payItem];
                  const paymentIndex = allChronologicalPayments.findIndex((p) => p.id === payItem.id);
                  const resolvedIndex = paymentIndex >= 0 ? paymentIndex : idx;
                  const paymentNumber = resolvedIndex + 1;
                  const totalPaymentsCount = allChronologicalPayments.length || invoicePaymentsToRender.length || 1;
                  const totalContractAmount = targetProjectData?.totalContract || payItem.amount;

                  // Payments recorded up to this invoice (inclusive)
                  const paymentsUpToThisInvoice = allChronologicalPayments.slice(0, resolvedIndex + 1);
                  const cumulativePaidThisInvoice = paymentsUpToThisInvoice.reduce((acc, p) => acc + (p.amount || 0), 0);
                  const remainingAfterThisInvoice = Math.max(0, totalContractAmount - cumulativePaidThisInvoice);

                  return (
                    <Box key={payItem.id || idx} className="printable-invoice-wrapper" sx={{ mb: idx < invoicePaymentsToRender.length - 1 ? 4 : 0 }}>
                      {invoicePaymentsToRender.length > 1 && (
                        <Typography className="no-print" variant="caption" sx={{ fontWeight: 800, color: 'primary.main', display: 'block', mb: 1, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                          📄 INVOICE #{paymentNumber} (Halaman {idx + 1} dari {invoicePaymentsToRender.length}) — Pembayaran ke-{paymentNumber} dari {totalPaymentsCount}: {payItem.stage} ({payItem.date})
                        </Typography>
                      )}
                      {/* Printable Invoice Document Sheet */}
                      <Paper
                        className="printable-invoice-sheet"
                        elevation={0}
                        sx={{
                          p: 0,
                          borderRadius: 0,
                          bgcolor: '#ffffff',
                          color: '#0f172a',
                          border: `1px solid ${theme.palette.divider}`,
                          position: 'relative',
                          overflow: 'hidden',
                          fontFamily: 'Inter, Arial, sans-serif',
                        }}
                      >
                        {/* Full-bleed Background Header SVG (absolute positioned behind content) */}
                        <Box className="repeat-page-header-bg" sx={{ position: 'absolute', top: 0, left: 0, right: 0, width: '100%', zIndex: 0, pointerEvents: 'none' }}>
                          <Box
                            component="img"
                            src="/header.svg"
                            alt="Header Background Atasilabs"
                            sx={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                            }}
                          />
                        </Box>

                        {docType === 'KWITANSI' ? (
                          /* Kwitansi / Faktur Pembayaran Body Content */
                          <Box
                            className="invoice-body-content"
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              pt: { xs: '95px', sm: '110px', md: '120px' },
                              pb: { xs: '80px', sm: '90px', md: '100px' },
                              px: { xs: 2.5, md: 4 },
                            }}
                          >
                            {/* Title & Metadata */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2, pb: 1.5, borderBottom: '1.5px solid #000000' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip
                                  label="KWITANSI PEMBAYARAN"
                                  color="success"
                                  sx={{ fontWeight: 900, letterSpacing: 1, fontSize: '0.82rem', height: 30 }}
                                />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#000000' }}>
                                  #KW-ATL-2026-{(payItem.id || '').replace('pay-', '').replace('devpay-', '')}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                                  Tanggal: <strong>{payItem.date}</strong>
                                </Typography>
                              </Box>
                            </Box>

                            {/* Kwitansi Form Fields (Table-like classical style) */}
                            <Box sx={{ border: '1px solid #000000', borderRadius: 0, bgcolor: '#ffffff', mb: 2 }}>
                              {/* Row 1: Telah Diterima Dari */}
                              <Box sx={{ p: 1.4, borderBottom: '1px solid #000000', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000000', minWidth: 180 }}>
                                  TELAH DITERIMA DARI:
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 900, color: '#000000' }}>
                                  {payItem.clientName || selectedProject?.clientName || 'Klien Atasilabs'}
                                </Typography>
                              </Box>

                              {/* Row 2: Uang Sejumlah (Terbilang) */}
                              <Box sx={{ p: 1.4, borderBottom: '1px solid #000000', bgcolor: '#f8fafc', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'center' }, gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000000', minWidth: 180 }}>
                                  UANG SEJUMLAH:
                                </Typography>
                                <Typography sx={{ fontWeight: 800, fontStyle: 'italic', color: '#000000', fontSize: '0.92rem' }}>
                                  # {numberToWordsIDR(payItem.amount)} #
                                </Typography>
                              </Box>

                              {/* Row 3: Untuk Pembayaran */}
                              <Box sx={{ p: 1.4, display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, alignItems: { sm: 'flex-start' }, gap: 1 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000000', minWidth: 180, pt: 0.2 }}>
                                  UNTUK PEMBAYARAN:
                                </Typography>
                                <Box sx={{ flexGrow: 1 }}>
                                  <Typography variant="body2" sx={{ fontWeight: 800, color: '#000000' }}>
                                    {payItem.stage} — Pembayaran ke-{paymentNumber} dari {totalPaymentsCount}
                                  </Typography>
                                  <Typography variant="body2" sx={{ color: '#000000' }}>
                                    Proyek: <strong>{payItem.projectTitle || selectedProject?.title || 'Pengembangan Perangkat Lunak'}</strong>
                                  </Typography>
                                  <Typography variant="caption" sx={{ color: '#000000', display: 'block', mt: 0.3 }}>
                                    Ref / Catatan: {payItem.notes || 'Pembayaran Termin Sah Proyek'}
                                  </Typography>
                                </Box>
                              </Box>
                            </Box>

                            {/* Nominal Box & Status */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2 }}>
                              <Box sx={{ p: 1.2, px: 2.2, border: '2px solid #000000', bgcolor: '#f1f5f9' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000000', display: 'block' }}>
                                  TERBILANG (JUMLAH NOMINAL):
                                </Typography>
                                <Typography variant="h5" sx={{ fontWeight: 900, color: '#000000', fontFamily: 'monospace' }}>
                                  {formatRupiah(payItem.amount)},-
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, textTransform: 'uppercase', letterSpacing: 0.5, color: '#000000', display: 'block', mb: 0.5 }}>
                                  STATUS TRANSAKSI:
                                </Typography>
                                <Chip
                                  label={
                                    payItem.status === 'VERIFIED'
                                      ? 'LUNAS / TERVERIFIKASI ✅'
                                      : payItem.status === 'FAILED'
                                        ? 'DITOLAK ❌'
                                        : 'PENDING APPROVAL ⏳'
                                  }
                                  color={
                                    payItem.status === 'VERIFIED'
                                      ? 'success'
                                      : payItem.status === 'FAILED'
                                        ? 'error'
                                        : 'warning'
                                  }
                                  sx={{ fontWeight: 900, fontSize: '0.85rem', px: 1 }}
                                />
                              </Box>
                            </Box>

                            {/* Table Status Rekapitulasi Kontrak Proyek */}
                            <TableContainer component={Box} sx={{ border: '1px solid #000000', borderRadius: 0, mb: 2 }}>
                              <Table size="small" sx={{ borderCollapse: 'collapse', width: '100%' }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableCell sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000', py: 0.8, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', width: '65%' }}>
                                      STATUS REKAPITULASI PEMBAYARAN KONTRAK
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', py: 0.8, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', width: '35%' }}>
                                      RINCIAN NILAI (IDR)
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000', py: 0.8, fontSize: '0.85rem' }}>
                                      Total Keseluruhan (Harus Dibayar)
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', py: 0.8, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      {formatRupiah(totalContractAmount)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000', py: 0.8, fontSize: '0.85rem' }}>
                                      Total yang Sudah Dibayar (s/d Kwitansi Ini)
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', py: 0.8, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      {formatRupiah(cumulativePaidThisInvoice)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000', borderRight: '1px solid #000000', py: 0.8, fontSize: '0.85rem' }}>
                                      Sisa yang Belum Dibayar
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', py: 0.8, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      {formatRupiah(remainingAfterThisInvoice)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* Footer Stamp & Signatures */}
                            <Box sx={{ pt: 1.5, borderTop: '1px dashed #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" display="block" sx={{ color: '#000000' }}>
                                  Kwitansi ini diterbitkan secara sah dan elektronik oleh PT Atasilabs Digital Indonesia.
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ color: '#000000' }}>
                                  Bukti tanda terima pembayaran resmi dan sah tanpa tanda tangan basah fisik.
                                </Typography>
                              </Box>
                              <Chip
                                icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />}
                                label="VERIFIED DIGITAL STAMP - PT ATASILABS"
                                variant="outlined"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                              />
                            </Box>
                          </Box>
                        ) : (
                          /* Invoice Body Content Container */
                          <Box
                            className="invoice-body-content"
                            sx={{
                              position: 'relative',
                              zIndex: 1,
                              pt: { xs: '95px', sm: '110px', md: '120px' },
                              pb: { xs: '80px', sm: '90px', md: '100px' },
                              px: { xs: 2.5, md: 4 },
                            }}
                          >
                            {/* Invoice Title & Meta Bar (Clean, no redundant company block because header.svg has the logo) */}
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 1.5, mb: 2.5, pb: 1.5, borderBottom: '1.5px solid #000000' }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                <Chip
                                  label={`INVOICE #${paymentNumber}`}
                                  color="primary"
                                  sx={{ fontWeight: 900, letterSpacing: 1, fontSize: '0.85rem', height: 30 }}
                                />
                                <Typography variant="subtitle2" sx={{ fontWeight: 800, fontFamily: 'monospace', color: '#000000' }}>
                                  #INV-ATL-2026-{(payItem.id || '').replace('pay-', '').replace('devpay-', '')}
                                </Typography>
                              </Box>
                              <Box sx={{ textAlign: { xs: 'left', sm: 'right' } }}>
                                <Typography variant="body2" sx={{ color: '#000000', fontWeight: 600 }}>
                                  Tanggal: <strong>{payItem.date}</strong>
                                </Typography>
                              </Box>
                            </Box>

                            {/* Bill To & Project Info */}
                            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                              <Grid size={{ xs: 12, sm: 6 }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5, color: '#000000' }}>
                                  DITUJUKAN KEPADA (BILL TO):
                                </Typography>
                                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#000000' }}>
                                  {payItem.clientName || selectedProject?.clientName || 'Klien Atasilabs'}
                                </Typography>
                                <Typography variant="body2" sx={{ color: '#000000' }}>
                                  Proyek: <strong>{payItem.projectTitle || selectedProject?.title || 'Pengembangan Perangkat Lunak'}</strong>
                                </Typography>
                              </Grid>
                              <Grid size={{ xs: 12, sm: 6 }} textAlign={{ sm: 'right' }}>
                                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: 0.5, textTransform: 'uppercase', display: 'block', mb: 0.5, color: '#000000' }}>
                                  STATUS & TAHAP PEMBAYARAN:
                                </Typography>
                                <Box sx={{ display: 'flex', gap: 0.8, justifyContent: { xs: 'flex-start', sm: 'flex-end' }, mb: 0.8, flexWrap: 'wrap' }}>
                                  <Chip
                                    label={
                                      payItem.status === 'VERIFIED'
                                        ? 'PAID / TERVERIFIKASI ✅'
                                        : payItem.status === 'FAILED'
                                          ? 'CANCELLED / DITOLAK ❌'
                                          : 'PENDING APPROVAL ⏳'
                                    }
                                    color={
                                      payItem.status === 'VERIFIED'
                                        ? 'success'
                                        : payItem.status === 'FAILED'
                                          ? 'error'
                                          : 'warning'
                                    }
                                    sx={{ fontWeight: 900, px: 1 }}
                                  />
                                </Box>
                                <Typography variant="body2" sx={{ color: '#000000' }}>
                                  Termin: <strong>{payItem.stage}</strong>
                                </Typography>
                              </Grid>
                            </Grid>

                            {/* Itemized Table */}
                            <TableContainer component={Box} sx={{ border: '1px solid #000000', borderRadius: 0, mb: 2 }}>
                              <Table sx={{ borderCollapse: 'collapse', width: '100%' }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableCell sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000' }}>Deskripsi Item / Termin</TableCell>
                                    <TableCell sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000' }}>Tanggal Pembayaran</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000' }}>Jumlah (IDR)</TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000' }}>
                                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#000000' }}>
                                        {payItem.stage} — Pembayaran ke-{paymentNumber} dari {totalPaymentsCount}
                                      </Typography>
                                      <Typography variant="caption" sx={{ color: '#000000' }}>
                                        Ref: {payItem.notes || 'Pembayaran Termin Proyek'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontWeight: 700, color: '#000000' }}>{payItem.date}</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 900, color: '#000000', fontSize: '1rem' }}>
                                      {formatRupiah(payItem.amount)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* Project Payment Status & Financial Summary Table */}
                            <TableContainer component={Box} sx={{ border: '1px solid #000000', borderRadius: 0, mb: 2 }}>
                              <Table size="small" sx={{ borderCollapse: 'collapse', width: '100%' }}>
                                <TableHead>
                                  <TableRow sx={{ bgcolor: '#f1f5f9' }}>
                                    <TableCell sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000', py: 0.8, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', width: '65%' }}>
                                      STATUS PEMBAYARAN PROYEK
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', py: 0.8, textTransform: 'uppercase', letterSpacing: 0.5, fontSize: '0.8rem', width: '35%' }}>
                                      RINCIAN NILAI (IDR)
                                    </TableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000', py: 0.8, fontSize: '0.85rem' }}>
                                      Total Keseluruhan (Harus Dibayar)
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', py: 0.8, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      {formatRupiah(totalContractAmount)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000', borderBottom: '1px solid #000000', borderRight: '1px solid #000000', py: 0.8, fontSize: '0.85rem' }}>
                                      Total yang Sudah Dibayar
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', borderBottom: '1px solid #000000', py: 0.8, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      {formatRupiah(cumulativePaidThisInvoice)}
                                    </TableCell>
                                  </TableRow>
                                  <TableRow>
                                    <TableCell sx={{ color: '#000000', borderRight: '1px solid #000000', py: 0.8, fontSize: '0.85rem' }}>
                                      Sisa yang Belum Dibayar
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 800, color: '#000000', py: 0.8, fontSize: '0.85rem', whiteSpace: 'nowrap' }}>
                                      {formatRupiah(remainingAfterThisInvoice)}
                                    </TableCell>
                                  </TableRow>
                                </TableBody>
                              </Table>
                            </TableContainer>

                            {/* Footer Stamp & Notes */}
                            <Box sx={{ pt: 2, borderTop: '1px dashed #000000', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                              <Box>
                                <Typography variant="caption" display="block" sx={{ color: '#000000' }}>
                                  Terima kasih atas kepercayaan Anda bermitra dengan Atasilabs.
                                </Typography>
                                <Typography variant="caption" display="block" sx={{ color: '#000000' }}>
                                  Dokumen ini diterbitkan secara otomatis dan sah tanpa tanda tangan basah.
                                </Typography>
                              </Box>
                              <Chip
                                icon={<SecurityIcon sx={{ fontSize: '14px !important' }} />}
                                label="VERIFIED DIGITAL STAMP - PT ATASILABS"
                                variant="outlined"
                                color="success"
                                size="small"
                                sx={{ fontWeight: 800, fontSize: '0.68rem' }}
                              />
                            </Box>
                          </Box>
                        )}

                        {/* Full-bleed Background Footer SVG (absolute positioned behind content) */}
                        <Box className="repeat-page-footer-bg" sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, width: '100%', zIndex: 0, pointerEvents: 'none' }}>
                          <Box
                            component="img"
                            src="/footer.svg"
                            alt="Footer Background Atasilabs"
                            sx={{
                              width: '100%',
                              height: 'auto',
                              display: 'block',
                            }}
                          />
                        </Box>
                      </Paper>
                    </Box>
                  );
                })}
              </Box>
            </Box>

            <Box className="no-print" sx={{ p: 2, px: 3, gap: 1.5, borderTop: `1px solid ${theme.palette.divider}`, display: 'flex', justifyContent: 'flex-end', bgcolor: theme.palette.background.paper }}>
              <Button onClick={() => setInvoiceModal({ open: false })} variant="outlined" color="inherit" sx={{ fontWeight: 700, borderRadius: 2.5, px: 2.5, textTransform: 'none' }}>
                Tutup
              </Button>
              <Button
                variant="contained"
                color="secondary"
                startIcon={<PrintIcon />}
                onClick={() => {
                  if (typeof window !== 'undefined') {
                    document.body.classList.add('printing-invoice');
                    window.print();
                  }
                }}
                sx={{ fontWeight: 800, borderRadius: 2.5, px: { xs: 2.5, sm: 3 }, py: 1, textTransform: 'none' }}
              >
                <Box component="span" sx={{ display: { xs: 'inline', sm: 'none' } }}>
                  Cetak
                </Box>
                <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>
                  Cetak / Unduh {docType === 'KWITANSI' ? 'Kwitansi' : 'Invoice'} PDF ({invoicePaymentsToRender.length} Halaman)
                </Box>
              </Button>
            </Box>
          </>
        )}
      </Drawer>
    </Box>
  );
};

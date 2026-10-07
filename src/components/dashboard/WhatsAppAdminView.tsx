'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Avatar,
  CircularProgress,
  Alert,
  Tooltip,
  Divider,
  Tabs,
  Tab,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  useTheme,
  Card,
  InputAdornment,
  Popover,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import Grid from '@mui/material/Grid2';
import {
  WhatsApp as WhatsAppIcon,
  Refresh as RefreshIcon,
  PowerSettingsNew as PowerIcon,
  QrCode2 as QrCodeIcon,
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  WarningAmber as WarningIcon,
  HourglassEmpty as HourglassIcon,
  PhoneIphone as PhoneIcon,
  DeleteSweep as ClearIcon,
  AutoAwesome as TemplateIcon,
  Chat as ChatIcon,
  History as HistoryIcon,
  PlayArrow as PlayIcon,
  Check as CheckIcon,
  DoneAll as DoneAllIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
  Lock as LockIcon,
  Email as EmailIcon,
  WorkOutline as ProjectIcon,
  AddComment as AddCommentIcon,
  MoreVert as MoreVertIcon,
  InsertEmoticon as EmojiIcon,
  AttachFile as AttachFileIcon,
  Image as ImageIcon,
  Description as DocumentIcon,
  Download as DownloadIcon,
  Close as CloseIcon,
  Dialpad as DialpadIcon,
  PersonAdd as PersonAddIcon,
  OpenInNew as OpenInNewIcon,
  DeleteOutline as DeleteOutlineIcon,
  Group as GroupIcon,
} from '@mui/icons-material';
import { useApp } from '../../context/AppContext';
import { supabase } from '@/lib/supabase';

interface WAInfo {
  wid?: string;
  phone?: string;
  pushname?: string;
  platform?: string;
  connectedAt?: string;
}

interface WALog {
  id: string;
  direction: 'SYSTEM' | 'INCOMING' | 'OUTGOING';
  target: string;
  body: string;
  status: string;
  timestamp: string;
  formattedNumber?: string;
}

interface WAMessage {
  id: string;
  body: string;
  from?: string;
  to?: string;
  fromMe: boolean;
  timestamp: number;
  type?: string;
  hasMedia?: boolean;
  mediaUrl?: string | null;
  mediaKey?: string | null;
  mediaName?: string | null;
  mediaMime?: string | null;
  mediaSize?: number | null;
  ack?: number;
  author?: string;
  authorName?: string | null;
}

interface WAChat {
  id: string;
  name: string;
  unreadCount: number;
  timestamp: number;
  isGroup: boolean;
  avatarUrl?: string | null;
  phone?: string;
  category?: 'LEAD' | 'CLIENT' | 'WHATSAPP' | 'CUSTOM';
  meta?: any;
  lastMessage?: {
    id?: string;
    body: string;
    timestamp: number;
    fromMe: boolean;
    type?: string;
    mediaUrl?: string | null;
    mediaName?: string | null;
  } | null;
}

interface WAStatusResponse {
  success?: boolean;
  serviceOnline: boolean;
  status: 'INITIALIZING' | 'QR_READY' | 'AUTHENTICATING' | 'READY' | 'DISCONNECTED' | 'SERVICE_STOPPED' | 'ERROR';
  qrDataUrl?: string | null;
  info?: WAInfo | null;
  error?: string | null;
  logs?: WALog[];
  uptime?: number;
  message?: string;
}

const WhatsAppAvatar: React.FC<{
  chatId: string;
  avatarUrl?: string | null;
  name: string;
  isGroup: boolean;
  category?: string;
  size?: number;
}> = ({ chatId, avatarUrl, name, isGroup, category, size = 46 }) => {
  const isSkipAvatar = !chatId || chatId === '0@c.us' || chatId.startsWith('0@') || chatId === 'admin';
  const proxyUrl = !isSkipAvatar
    ? `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(chatId)}`
    : null;

  // Prefer direct avatarUrl if available, otherwise server streaming proxy
  const [imgSrc, setImgSrc] = useState<string | null>(isSkipAvatar ? null : (avatarUrl || proxyUrl));

  useEffect(() => {
    if (isSkipAvatar) {
      setImgSrc(null);
    } else {
      setImgSrc(avatarUrl || proxyUrl);
    }
  }, [avatarUrl, proxyUrl, isSkipAvatar]);

  const handleImgError = () => {
    // If the direct CDN link failed (e.g. CORS/referrer/expiry), fall back to proxy
    if (imgSrc && imgSrc !== proxyUrl && proxyUrl) {
      setImgSrc(proxyUrl);
    } else {
      // Both direct and proxy failed, or no avatar exists
      setImgSrc(null);
    }
  };

  return (
    <Avatar
      key={`${chatId}-${imgSrc || 'fallback'}`}
      src={imgSrc || undefined}
      imgProps={{
        referrerPolicy: 'no-referrer',
        onError: handleImgError,
        loading: 'lazy',
      }}
      sx={{
        width: size,
        height: size,
        bgcolor: isGroup
          ? '#0284c7'
          : category === 'LEAD'
          ? '#f59e0b'
          : category === 'CLIENT'
          ? '#3b82f6'
          : '#25D366',
        color: '#ffffff',
        fontWeight: 700,
        fontSize: size > 40 ? '1rem' : '0.85rem',
        flexShrink: 0,
      }}
    >
      {isGroup ? <GroupIcon sx={{ fontSize: size > 40 ? 24 : 20 }} /> : (name?.charAt(0) || 'W')}
    </Avatar>
  );
};

export const WhatsAppAdminView: React.FC = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const { leads, projects, setDashboardTab } = useApp();

  const [statusData, setStatusData] = useState<WAStatusResponse>({
    serviceOnline: false,
    status: 'SERVICE_STOPPED',
  });
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0: Inbox WhatsApp, 1: Kirim Cepat, 2: Koneksi & QR, 3: Log

  // Inbox & Chat State
  const [chats, setChats] = useState<WAChat[]>([]);
  const [loadingChats, setLoadingChats] = useState(false);
  const [selectedChat, setSelectedChat] = useState<WAChat | null>(null);
  const [messages, setMessages] = useState<WAMessage[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [chatInputText, setChatInputText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'UNREAD' | 'LEADS' | 'PROJECTS'>('ALL');
  const [mobileShowChat, setMobileShowChat] = useState(false);

  // New Chat Dialog / Menu
  const [anchorNewChat, setAnchorNewChat] = useState<null | HTMLElement>(null);

  // Quick Composer Form State
  const [targetPhone, setTargetPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [selectedRecipientId, setSelectedRecipientId] = useState('');
  const [messageText, setMessageText] = useState('');
  const [sendingQuickMessage, setSendingQuickMessage] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [serviceActionLoading, setServiceActionLoading] = useState(false);

  // Custom Number Modal State
  const [openNewNumberModal, setOpenNewNumberModal] = useState(false);
  const [newNumberPhone, setNewNumberPhone] = useState('');
  const [newNumberName, setNewNumberName] = useState('');
  const [newNumberInitialMessage, setNewNumberInitialMessage] = useState('');

  // File Attachment State
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachedPreviewUrl, setAttachedPreviewUrl] = useState<string | null>(null);
  const [attachedType, setAttachedType] = useState<'image' | 'document' | null>(null);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const [anchorAttachMenu, setAnchorAttachMenu] = useState<null | HTMLElement>(null);

  // Delete State
  const [deleteChatConfirmOpen, setDeleteChatConfirmOpen] = useState(false);
  const [chatToDelete, setChatToDelete] = useState<WAChat | null>(null);
  const [deletingChat, setDeletingChat] = useState(false);
  const [deleteMsgConfirmOpen, setDeleteMsgConfirmOpen] = useState(false);
  const [msgToDelete, setMsgToDelete] = useState<WAMessage | null>(null);
  const [deletingMsg, setDeletingMsg] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const selectedChatRef = useRef<WAChat | null>(selectedChat);

  useEffect(() => {
    selectedChatRef.current = selectedChat;
  }, [selectedChat]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Fetch status from API
  const fetchStatus = useCallback(async (quiet = false) => {
    if (!quiet) setLoadingStatus(true);
    try {
      const res = await fetch('/api/whatsapp', { cache: 'no-store' });
      const data: WAStatusResponse = await res.json();
      setStatusData(data);
    } catch {
      setStatusData({
        serviceOnline: false,
        status: 'SERVICE_STOPPED',
        message: 'Gagal menghubungi endpoint internal /api/whatsapp.',
      });
    } finally {
      if (!quiet) setLoadingStatus(false);
    }
  }, []);

  // Fetch chats list
  const fetchChats = useCallback(async () => {
    try {
      setLoadingChats(true);
      const res = await fetch('/api/whatsapp?endpoint=chats', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.chats)) {
        setChats(data.chats);
        setSelectedChat((prev) => {
          if (!prev) return null;
          const fresh = data.chats.find((c: any) => c.id === prev.id);
          return fresh ? { ...prev, ...fresh } : prev;
        });
      }
    } catch (err) {
      console.warn('Error fetching chats:', err);
    } finally {
      setLoadingChats(false);
    }
  }, []);

  // Fetch messages for active chat
  const fetchMessages = useCallback(async (chatId: string, quiet = false) => {
    if (!chatId) return;
    try {
      if (!quiet) setLoadingMessages(true);
      const res = await fetch(`/api/whatsapp?endpoint=messages&chatId=${encodeURIComponent(chatId)}&limit=60`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.messages)) {
        setMessages((prev) => {
          const serverMsgs: WAMessage[] = data.messages;
          const pendingOptimistic = prev.filter(
            (p) =>
              p.id?.startsWith('temp-') &&
              !serverMsgs.some(
                (s) =>
                  s.fromMe === p.fromMe &&
                  (s.body || '').trim() === (p.body || '').trim() &&
                  Math.abs((s.timestamp || 0) - (p.timestamp || 0)) < 15000
              )
          );
          return [...serverMsgs, ...pendingOptimistic];
        });
      }
    } catch (err) {
      console.warn('Error fetching messages:', err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  }, []);

  // ⚡ Supabase Realtime WebSocket Listener - Instant live updates, zero periodic message polling
  useEffect(() => {
    const channel = supabase
      .channel('whatsapp_gateway', {
        config: { broadcast: { self: true } },
      })
      .on('broadcast', { event: 'NEW_MESSAGE' }, ({ payload }) => {
        if (!payload || !payload.message) return;
        const msg: WAMessage = payload.message;
        const activeId = selectedChatRef.current?.id;

        // If message belongs to active chat, append or update in messages
        if (
          activeId &&
          (payload.chatId === activeId ||
            msg.from === activeId ||
            msg.to === activeId)
        ) {
          setMessages((prev) => {
            const filtered = prev.filter(
              (m) =>
                !(
                  m.id?.startsWith('temp-') &&
                  m.fromMe === msg.fromMe &&
                  (m.body || '').trim() === (msg.body || '').trim() &&
                  Math.abs((m.timestamp || 0) - (msg.timestamp || 0)) < 15000
                )
            );
            if (msg.id && filtered.some((m) => m.id === msg.id)) {
              return filtered.map((m) => (m.id === msg.id ? msg : m));
            }
            return [...filtered, msg];
          });
        }

        // Update chats list in real-time
        setChats((prevChats) => {
          const matchIndex = prevChats.findIndex(
            (c) => c.id === payload.chatId || c.phone === payload.chatId
          );
          if (matchIndex >= 0) {
            const updated = [...prevChats];
            const target = { ...updated[matchIndex] };
            target.lastMessage = {
              id: msg.id,
              body: msg.body,
              timestamp: msg.timestamp,
              fromMe: msg.fromMe,
              type: msg.type,
            };
            target.timestamp = msg.timestamp;
            if (!msg.fromMe && activeId !== target.id) {
              target.unreadCount = (target.unreadCount || 0) + 1;
            }
            updated[matchIndex] = target;
            return updated.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          } else {
            fetchChats();
            return prevChats;
          }
        });
      })
      .on('broadcast', { event: 'MESSAGE_UPDATE' }, ({ payload }) => {
        if (!payload || !payload.message) return;
        const msg: WAMessage = payload.message;
        const activeId = selectedChatRef.current?.id;
        if (
          activeId &&
          (payload.chatId === activeId ||
            msg.from === activeId ||
            msg.to === activeId)
        ) {
          setMessages((prev) =>
            prev.map((m) => (m.id === msg.id ? { ...m, ...msg } : m))
          );
        }
      })
      .on('broadcast', { event: 'CHAT_UPDATE' }, ({ payload }) => {
        if (!payload || !payload.chat) return;
        const chat = payload.chat;
        setChats((prev) => {
          const idx = prev.findIndex((c) => c.id === chat.id);
          if (idx >= 0) {
            const copy = [...prev];
            copy[idx] = { ...copy[idx], ...chat };
            return copy.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
          }
          return [chat, ...prev].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
        });
      })
      .on('broadcast', { event: 'CHAT_DELETED' }, ({ payload }) => {
        if (!payload || !payload.chatId) return;
        const targetChatId = payload.chatId;
        setChats((prev) => prev.filter((c) => c.id !== targetChatId));
        if (selectedChatRef.current?.id === targetChatId) {
          setSelectedChat(null);
          setMessages([]);
        }
      })
      .on('broadcast', { event: 'MESSAGE_DELETED' }, ({ payload }) => {
        if (!payload || !payload.messageId) return;
        const { messageId, chatId } = payload;
        const activeId = selectedChatRef.current?.id;
        if (!chatId || (activeId && chatId === activeId)) {
          setMessages((prev) => prev.filter((m) => m.id !== messageId));
        }
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === chatId && c.lastMessage?.id === messageId) {
              return { ...c, lastMessage: null };
            }
            return c;
          })
        );
      })
      .on('broadcast', { event: 'STATUS_UPDATE' }, ({ payload }) => {
        if (payload) {
          setStatusData((prev) => ({
            ...prev,
            status: payload.status ?? prev.status,
            info: payload.info !== undefined ? payload.info : prev.info,
            qrDataUrl: payload.qrDataUrl !== undefined ? payload.qrDataUrl : prev.qrDataUrl,
            error: payload.error !== undefined ? payload.error : prev.error,
          }));
          if (payload.status === 'READY') {
            fetchChats();
          }
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchChats]);

  // Initial status and chats fetch on component mount - ZERO periodic polling! Updates arrive via Webhook & Supabase Realtime
  useEffect(() => {
    fetchStatus();
    fetchChats();

    // Check if redirected from Leads with targetLead / chatPhone
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const targetPhone = searchParams.get('chatPhone');
      const targetName = searchParams.get('chatName');
      const leadId = searchParams.get('leadId');
      if (targetPhone || leadId) {
        let clean = (targetPhone || '').replace(/\D/g, '');
        if (clean.startsWith('0')) clean = '62' + clean.slice(1);
        else if (clean.startsWith('8')) clean = '62' + clean;
        const jid = clean ? `${clean}@c.us` : `lead-${leadId}`;
        const newChat: WAChat = {
          id: jid,
          name: targetName || 'Klien Lead',
          phone: clean || targetPhone || '',
          unreadCount: 0,
          timestamp: Date.now(),
          isGroup: false,
          category: 'LEAD',
          lastMessage: null,
        };
        setSelectedChat(newChat);
        setActiveTab(0);
        setMobileShowChat(true);
        setChatInputText(
          `Halo Kak ${targetName || ''},\n\nTerima kasih telah menghubungi ATASILABS. Kami ingin menindaklanjuti inquiry proyek Anda. Apakah berkenan untuk berdiskusi sekarang?`
        );
      }
    }
  }, [fetchStatus, fetchChats]);

  // Handle opening a chat: instantly clear unread badge in UI & server
  const handleSelectChat = useCallback((chat: WAChat) => {
    setSelectedChat({ ...chat, unreadCount: 0 });
    setChats((prev) =>
      prev.map((c) => (c.id === chat.id ? { ...c, unreadCount: 0 } : c))
    );
    if (chat.unreadCount > 0) {
      fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'mark_read', chatId: chat.id }),
      }).catch(() => {});
    }
  }, []);

  // When selectedChat changes, fetch messages and scroll
  useEffect(() => {
    if (selectedChat?.id) {
      setMessages([]);
      fetchMessages(selectedChat.id);
      setMobileShowChat(true);
    }
  }, [selectedChat?.id, fetchMessages]);

  // Deduplicate messages by ID and content + timestamp bucket
  const deduplicatedMessages = useMemo(() => {
    const seenIds = new Set<string>();
    const result: WAMessage[] = [];

    for (const msg of messages) {
      if (!msg) continue;
      const mId = msg.id;
      if (mId && seenIds.has(mId)) continue;

      const normBody = (msg.body || '').trim();
      const isMedia = Boolean(msg.hasMedia || msg.type === 'image' || msg.type === 'document' || msg.mediaUrl);

      // Check if duplicate of an existing message in result
      const dupIndex = result.findIndex((existing) => {
        if (existing.fromMe !== msg.fromMe) return false;
        const timeDiff = Math.abs((existing.timestamp || 0) - (msg.timestamp || 0));
        if (timeDiff < 15000) {
          const existingIsMedia = Boolean(existing.hasMedia || existing.type === 'image' || existing.type === 'document' || existing.mediaUrl);
          if (isMedia && existingIsMedia) return true;
          if (normBody && (existing.body || '').trim() === normBody) return true;
        }
        return false;
      });

      if (dupIndex === -1) {
        if (mId) seenIds.add(mId);
        result.push(msg);
      } else {
        const existing = result[dupIndex];
        const isExistingTemp = !existing.id || existing.id.startsWith('temp-') || existing.id.startsWith('msg-');
        const isNewReal = mId && !mId.startsWith('temp-') && !mId.startsWith('msg-');
        if (isExistingTemp && isNewReal) {
          if (existing.id) seenIds.delete(existing.id);
          existing.id = mId;
          seenIds.add(mId);
        }
        if (msg.mediaUrl && !existing.mediaUrl) {
          existing.mediaUrl = msg.mediaUrl;
        }
        if (msg.mediaName && !existing.mediaName) {
          existing.mediaName = msg.mediaName;
        }
        if (msg.ack && (!existing.ack || msg.ack > existing.ack)) {
          existing.ack = msg.ack;
        }
      }
    }

    return result.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
  }, [messages]);

  useEffect(() => {
    scrollToBottom();
  }, [deduplicatedMessages]);

  // Handle service start / restart / logout
  const handleServiceAction = async (action: 'start_service' | 'restart' | 'logout' | 'clear_logs') => {
    setServiceActionLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({ type: 'success', message: data.message || 'Aksi berhasil dieksekusi.' });
      } else {
        setFeedback({ type: 'error', message: data.error || 'Aksi gagal dieksekusi.' });
      }
      await fetchStatus(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi error';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setServiceActionLoading(false);
    }
  };

  // Pre-made Templates
  const templates = [
    {
      title: 'Sambutan Lead',
      text: (name: string) =>
        `Halo Kak ${name || 'Klien'},\n\nTerima kasih telah mempercayakan permohonan pengembangan web kepada ATASILABS Studio.\n\nApakah berkenan untuk diskusi atau call singkat sekitar 15 menit hari ini?\n\nSalam hangat,\nAdmin ATASILABS`,
    },
    {
      title: 'Pengingat Invoice',
      text: (name: string) =>
        `Halo Kak ${name || 'Klien'},\n\nKami menginformasikan bahwa invoice termin proyek Anda telah diterbitkan di sistem ATASILABS. Silakan akses portal klien untuk mengunduh dokumen penagihan dan detail rekening resmi kami.\n\nMohon konfirmasi setelah melakukan pembayaran ya kak. Terima kasih! 🙏`,
    },
    {
      title: 'Update Milestone',
      text: (name: string) =>
        `Halo Kak ${name || 'Klien'},\n\nKabar baik! Tahapan milestone pengerjaan sistem Anda telah selesai diuji dan siap ditinjau di staging server ATASILABS.\n\nSilakan cek pratinjau dan kami siap menjadwalkan sesi walkthrough penyerahan Berita Acara Serah Terima (BAST).\n\nSalam hangat,\nATASILABS Dev Team`,
    },
    {
      title: 'Kwitansi Lunas',
      text: (name: string) =>
        `Halo Kak ${name || 'Klien'},\n\nPembayaran untuk proyek Anda telah berhasil kami verifikasi dan tercatat LUNAS di database Atasilabs. Kwitansi resmi bertanda tangan digital telah siap diunduh di dashboard.\n\nTerima kasih atas kerja samanya! 🙌`,
    },
  ];

  // Select Image handler
  const handleSelectImageFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: 'Harap pilih file gambar (JPG, PNG, WebP, GIF).' });
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran gambar maksimal 20MB.' });
      return;
    }
    const preview = URL.createObjectURL(file);
    setAttachedFile(file);
    setAttachedPreviewUrl(preview);
    setAttachedType('image');
    setAnchorAttachMenu(null);
    if (e.target) e.target.value = '';
  };

  // Select Document handler
  const handleSelectDocFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setFeedback({ type: 'error', message: 'Ukuran dokumen maksimal 50MB.' });
      return;
    }
    setAttachedFile(file);
    setAttachedPreviewUrl(null);
    setAttachedType('document');
    setAnchorAttachMenu(null);
    if (e.target) e.target.value = '';
  };

  // Clear Attachment
  const handleClearAttachment = () => {
    if (attachedPreviewUrl && attachedPreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(attachedPreviewUrl);
    }
    setAttachedFile(null);
    setAttachedPreviewUrl(null);
    setAttachedType(null);
  };

  // Send message from chat window with optional attachment (sent directly via WhatsApp Web)
  const handleSendChatMessage = async () => {
    if ((!chatInputText.trim() && !attachedFile) || !selectedChat || sendingChat) return;

    const textToSend = chatInputText.trim();
    const currentAttachedFile = attachedFile;
    const currentAttachedType = attachedType;
    const currentPreviewUrl = attachedPreviewUrl;

    const tempId = `temp-${Date.now()}`;
    const optimisticMessage: WAMessage = {
      id: tempId,
      body: textToSend || (currentAttachedType === 'image' ? '[Foto]' : `[Dokumen: ${currentAttachedFile?.name || 'file'}]`),
      fromMe: true,
      timestamp: Date.now(),
      type: currentAttachedType || 'chat',
      hasMedia: Boolean(currentAttachedFile),
      mediaUrl: currentPreviewUrl || undefined,
      mediaName: currentAttachedFile?.name,
      mediaSize: currentAttachedFile?.size,
      mediaMime: currentAttachedFile?.type,
      ack: 1,
    };

    setMessages((prev) => [...prev, optimisticMessage]);
    setChatInputText('');
    setAttachedFile(null);
    setAttachedPreviewUrl(null);
    setAttachedType(null);
    setSendingChat(true);

    try {
      let uploadedMediaUrl: string | null = null;
      let uploadedMediaKey: string | null = null;
      let fileBase64: string | null = null;

      if (currentAttachedFile) {
        setUploadingMedia(true);

        // 1. Read base64 for WhatsApp client
        try {
          fileBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const res = (reader.result as string) || '';
              const b64 = res.includes(',') ? res.split(',')[1] : res;
              resolve(b64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(currentAttachedFile);
          });
        } catch (readErr) {
          console.warn('Failed reading file to base64:', readErr);
        }
      }

      // 2. Send message directly via WhatsApp Web (no R2 storage needed)
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          chatId: selectedChat.id,
          to: selectedChat.phone || selectedChat.id,
          message: textToSend,
          ...(currentAttachedFile
            ? {
                mediaName: currentAttachedFile.name,
                mediaMime: currentAttachedFile.type,
                mediaSize: currentAttachedFile.size,
                mediaBase64: fileBase64,
                type: currentAttachedType,
                caption: textToSend,
              }
            : {}),
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setFeedback({ type: 'error', message: data.error || 'Gagal mengirim pesan.' });
        setChatInputText(textToSend);
        setMessages((prev) => prev.filter((m) => m.id !== tempId));
      } else {
        if (data.sentMessage) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempId
                ? {
                    ...data.sentMessage,
                    mediaUrl: data.sentMessage.mediaUrl || currentPreviewUrl || m.mediaUrl,
                  }
                : m
            )
          );
        }
        fetchMessages(selectedChat.id, true);
        fetchChats();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi error';
      setFeedback({ type: 'error', message: msg });
      setChatInputText(textToSend);
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      setSendingChat(false);
      setUploadingMedia(false);
    }
  };

  // Start chat with a custom phone number input
  const handleStartChatWithCustomNumber = async () => {
    if (!newNumberPhone.trim()) {
      setFeedback({ type: 'error', message: 'Nomor WhatsApp tujuan wajib diisi!' });
      return;
    }

    let cleanPhone = newNumberPhone.replace(/[^\d]/g, '');
    if (cleanPhone.startsWith('0')) {
      cleanPhone = '62' + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith('8')) {
      cleanPhone = '62' + cleanPhone;
    }

    if (cleanPhone.length < 9) {
      setFeedback({ type: 'error', message: 'Nomor WhatsApp tidak valid (terlalu pendek).' });
      return;
    }

    const jid = `${cleanPhone}@c.us`;
    const nameToUse = newNumberName.trim() || `+${cleanPhone}`;
    const initialText = newNumberInitialMessage.trim();

    try {
      await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_chat',
          phone: cleanPhone,
          name: nameToUse,
          message: initialText || 'Percakapan baru dibuat',
        }),
      });
    } catch (err) {
      console.warn('create_chat error:', err);
    }

    const newChatObj: WAChat = {
      id: jid,
      name: nameToUse,
      phone: cleanPhone,
      unreadCount: 0,
      timestamp: Date.now(),
      isGroup: false,
      category: 'CUSTOM',
      lastMessage: initialText
        ? {
            body: initialText,
            timestamp: Date.now(),
            fromMe: true,
            type: 'chat',
          }
        : null,
    };

    setChats((prev) => {
      if (prev.some((c) => c.id === jid || c.phone === cleanPhone)) {
        return prev.map((c) => (c.id === jid || c.phone === cleanPhone ? { ...c, name: nameToUse } : c));
      }
      return [newChatObj, ...prev];
    });

    setSelectedChat(newChatObj);
    setActiveTab(0);
    setMobileShowChat(true);
    setOpenNewNumberModal(false);
    setNewNumberPhone('');
    setNewNumberName('');
    setNewNumberInitialMessage('');

    if (initialText) {
      try {
        setSendingChat(true);
        const sendRes = await fetch('/api/whatsapp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'send',
            chatId: jid,
            to: cleanPhone,
            message: initialText,
          }),
        });
        const sendData = await sendRes.json();
        if (!sendData.success) {
          setFeedback({ type: 'error', message: sendData.error || 'Gagal mengirim pesan pembuka.' });
        }
        fetchMessages(jid, true);
        fetchChats();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : 'Koneksi error';
        setFeedback({ type: 'error', message: msg });
      } finally {
        setSendingChat(false);
      }
    }
  };

  // Delete Entire Chat
  const handleDeleteChat = async () => {
    const targetChat = chatToDelete || selectedChat;
    if (!targetChat?.id) return;
    setDeletingChat(true);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_chat',
          chatId: targetChat.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setChats((prev) => prev.filter((c) => c.id !== targetChat.id));
        if (selectedChat?.id === targetChat.id) {
          setSelectedChat(null);
          setMessages([]);
          setMobileShowChat(false);
        }
        setFeedback({
          type: 'success',
          message: `Percakapan dengan ${targetChat.name || targetChat.id} berhasil dihapus.`,
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Gagal menghapus percakapan.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus percakapan.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setDeletingChat(false);
      setDeleteChatConfirmOpen(false);
      setChatToDelete(null);
    }
  };

  // Delete Individual Message
  const handleDeleteMessage = async () => {
    if (!msgToDelete?.id || !selectedChat?.id) return;
    setDeletingMsg(true);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_message',
          messageId: msgToDelete.id,
          chatId: selectedChat.id,
          everyone: true,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMessages((prev) => prev.filter((m) => m.id !== msgToDelete.id));
        setChats((prev) =>
          prev.map((c) => {
            if (c.id === selectedChat.id && c.lastMessage?.id === msgToDelete.id) {
              return { ...c, lastMessage: null };
            }
            return c;
          })
        );
        setFeedback({
          type: 'success',
          message: 'Pesan berhasil dihapus.',
        });
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Gagal menghapus pesan.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menghapus pesan.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setDeletingMsg(false);
      setDeleteMsgConfirmOpen(false);
      setMsgToDelete(null);
    }
  };

  // Quick message sender (Tab 1)
  const handleSendQuickMessage = async () => {
    if (!targetPhone.trim()) {
      setFeedback({ type: 'error', message: 'Nomor WhatsApp tujuan wajib diisi!' });
      return;
    }
    if (!messageText.trim()) {
      setFeedback({ type: 'error', message: 'Pesan teks tidak boleh kosong!' });
      return;
    }

    setSendingQuickMessage(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'send',
          to: targetPhone,
          message: messageText,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Pesan berhasil terkirim ke ${targetPhone}!`,
        });
        setMessageText('');
        fetchStatus(true);
        fetchChats();
      } else {
        setFeedback({
          type: 'error',
          message: data.error || 'Gagal mengirim pesan via WhatsApp.',
        });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Koneksi error';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setSendingQuickMessage(false);
    }
  };

  // Start chat with a specific Lead or Project
  const handleStartChatWithContact = (contact: {
    id: string;
    name: string;
    phone: string;
    category: 'LEAD' | 'CLIENT';
    company?: string;
  }) => {
    setAnchorNewChat(null);
    let targetPhone = contact.phone.replace(/[^\d]/g, '');
    if (targetPhone.startsWith('0')) {
      targetPhone = '62' + targetPhone.substring(1);
    } else if (targetPhone.startsWith('8')) {
      targetPhone = '62' + targetPhone;
    }

    const jid = targetPhone ? `${targetPhone}@c.us` : `contact-${contact.id}`;
    const newChatObj: WAChat = {
      id: jid,
      name: contact.name,
      phone: targetPhone,
      unreadCount: 0,
      timestamp: Date.now(),
      isGroup: false,
      category: contact.category,
      meta: contact,
      lastMessage: null,
    };

    setSelectedChat(newChatObj);
    setActiveTab(0);
    setMobileShowChat(true);

    // Pre-fill intro template
    setChatInputText(
      `Halo Kak ${contact.name},\n\nTerima kasih telah mempercayakan permohonan pengembangan sistem Anda kepada ATASILABS. Apakah ada waktu luang untuk berdiskusi singkat hari ini?`
    );
  };

  // Filtered chats list
  const filteredChats = useMemo(() => {
    let result = chats.filter((c) => !c.id?.includes('@broadcast'));

    // Merge Leads that haven't been chatted with yet into view if requested
    if (filterType === 'LEADS') {
      const existingIds = new Set(result.map((c) => c.phone));
      leads.forEach((l) => {
        let cleanPhone = (l.phone || '').replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = '62' + cleanPhone.slice(1);
        else if (cleanPhone.startsWith('8')) cleanPhone = '62' + cleanPhone;

        const chatId = cleanPhone ? `${cleanPhone}@c.us` : `lead-${l.id}`;
        if (!cleanPhone || !existingIds.has(cleanPhone)) {
          result.push({
            id: chatId,
            name: `${l.name} (${l.company || 'Inquiry'})`,
            unreadCount: l.status === 'NEW' ? 1 : 0,
            phone: cleanPhone || l.phone,
            timestamp: new Date(l.createdAt).getTime(),
            isGroup: false,
            category: 'LEAD',
            meta: l,
            lastMessage: {
              body: l.message,
              timestamp: new Date(l.createdAt).getTime(),
              fromMe: false,
              type: 'chat',
            },
          });
        }
      });
    } else if (filterType === 'PROJECTS') {
      const existingIds = new Set(result.map((c) => c.phone));
      projects.forEach((p) => {
        const cleanPhone = (p.clientPhone || '').replace(/\D/g, '');
        if (cleanPhone && !existingIds.has(cleanPhone)) {
          result.push({
            id: `${cleanPhone}@c.us`,
            name: `${p.clientName} - ${p.title}`,
            unreadCount: 0,
            phone: cleanPhone,
            timestamp: new Date(p.updatedAt || p.createdAt).getTime(),
            isGroup: false,
            category: 'CLIENT',
            meta: p,
            lastMessage: {
              body: `Proyek: ${p.title} (Progress: ${p.progress}%)`,
              timestamp: new Date(p.updatedAt || p.createdAt).getTime(),
              fromMe: true,
              type: 'chat',
            },
          });
        }
      });
    } else if (filterType === 'UNREAD') {
      result = result.filter((c) => c.unreadCount > 0);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.id.toLowerCase().includes(q) ||
          c.lastMessage?.body.toLowerCase().includes(q)
      );
    }

    return result.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  }, [chats, filterType, searchQuery, leads, projects]);

  // Status Badge Configuration
  const statusConfig = useMemo(() => {
    switch (statusData.status) {
      case 'READY':
        return {
          label: 'TERHUBUNG (READY)',
          color: 'success' as const,
          icon: <CheckCircleIcon sx={{ fontSize: 18 }} />,
          bg: isDark ? 'rgba(16, 185, 129, 0.15)' : '#ecfdf5',
          border: '#10b981',
          text: '#10b981',
          desc: 'WhatsApp Web terhubung dan siap mengirim & menerima pesan real-time.',
        };
      case 'QR_READY':
        return {
          label: 'MENUNGGU SCAN QR',
          color: 'warning' as const,
          icon: <QrCodeIcon sx={{ fontSize: 18 }} />,
          bg: isDark ? 'rgba(245, 158, 11, 0.15)' : '#fffbeb',
          border: '#f59e0b',
          text: '#f59e0b',
          desc: 'Buka WhatsApp di ponsel > Perangkat Tertaut > Scan QR Code.',
        };
      case 'AUTHENTICATING':
        return {
          label: 'MEMVERIFIKASI SESI',
          color: 'info' as const,
          icon: <HourglassIcon sx={{ fontSize: 18 }} />,
          bg: isDark ? 'rgba(59, 130, 246, 0.15)' : '#eff6ff',
          border: '#3b82f6',
          text: '#3b82f6',
          desc: 'Sedang menyelesaikan login sesi...',
        };
      case 'INITIALIZING':
        return {
          label: 'MEMULAI BROWSER...',
          color: 'info' as const,
          icon: <CircularProgress size={16} color="inherit" />,
          bg: isDark ? 'rgba(59, 130, 246, 0.12)' : '#eff6ff',
          border: '#60a5fa',
          text: '#3b82f6',
          desc: 'Memulai Chromium headless di background server...',
        };
      case 'DISCONNECTED':
        return {
          label: 'TERPUTUS / LOGOUT',
          color: 'error' as const,
          icon: <WarningIcon sx={{ fontSize: 18 }} />,
          bg: isDark ? 'rgba(239, 68, 68, 0.12)' : '#fef2f2',
          border: '#ef4444',
          text: '#ef4444',
          desc: 'Sesi WhatsApp telah keluar atau terputus.',
        };
      case 'ERROR':
        return {
          label: 'SERVICE ERROR',
          color: 'error' as const,
          icon: <WarningIcon sx={{ fontSize: 18 }} />,
          bg: isDark ? 'rgba(239, 68, 68, 0.15)' : '#fef2f2',
          border: '#ef4444',
          text: '#ef4444',
          desc: statusData.error || 'Terjadi kendala pada background service WhatsApp.',
        };
      case 'SERVICE_STOPPED':
      default:
        return {
          label: 'SERVICE OFFLINE',
          color: 'default' as const,
          icon: <PowerIcon sx={{ fontSize: 18 }} />,
          bg: isDark ? 'rgba(156, 163, 175, 0.12)' : '#f3f4f6',
          border: '#9ca3af',
          text: isDark ? '#d1d5db' : '#4b5563',
          desc: 'Background service WhatsApp Gateway belum dijalankan.',
        };
    }
  }, [statusData.status, statusData.error, isDark]);

  return (
    <Box sx={{ width: '100%', pb: 6 }}>
      {/* Top Header Card */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 2.5, md: 3 },
          mb: 2.5,
          borderRadius: 3,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          background: isDark
            ? 'linear-gradient(135deg, rgba(37, 211, 102, 0.09) 0%, rgba(18, 18, 18, 0.95) 100%)'
            : 'linear-gradient(135deg, rgba(37, 211, 102, 0.07) 0%, #ffffff 100%)',
        }}
      >
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          alignItems={{ xs: 'flex-start', md: 'center' }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                backgroundColor: '#25D366',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(37, 211, 102, 0.35)',
              }}
            >
              <WhatsAppIcon sx={{ fontSize: 30 }} />
            </Avatar>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 0.3 }}>
                <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
                  WhatsApp Web Studio
                </Typography>
                <Chip
                  icon={statusConfig.icon}
                  label={statusConfig.label}
                  size="small"
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    backgroundColor: statusConfig.bg,
                    color: statusConfig.text,
                    border: `1px solid ${statusConfig.border}`,
                  }}
                />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                {statusData.status === 'READY' && statusData.info
                  ? `Terhubung sebagai ${statusData.info.pushname || 'Admin'} (+${statusData.info.phone})`
                  : statusData.info?.phone
                  ? `Sesi tersimpan: ${statusData.info.pushname || 'Admin'} (+${statusData.info.phone})`
                  : 'Komunikasi langsung dengan Klien & Leads melalui integrasi resmi WhatsApp Web.'}
              </Typography>
            </Box>
          </Box>

          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="outlined"
              size="small"
              onClick={() => {
                fetchStatus();
                fetchChats();
                if (selectedChat?.id) fetchMessages(selectedChat.id);
              }}
              disabled={loadingStatus}
              startIcon={loadingStatus ? <CircularProgress size={16} /> : <RefreshIcon />}
              sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
            >
              Segarkan
            </Button>

            {statusData.serviceOnline ? (
              <>
                <Button
                  variant="outlined"
                  color="warning"
                  size="small"
                  onClick={() => handleServiceAction('restart')}
                  disabled={serviceActionLoading}
                  startIcon={<RefreshIcon />}
                  sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                >
                  Restart
                </Button>
                {statusData.status === 'READY' && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleServiceAction('logout')}
                    disabled={serviceActionLoading}
                    startIcon={<PowerIcon />}
                    sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                  >
                    Logout
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="contained"
                size="small"
                onClick={() => handleServiceAction('start_service')}
                disabled={serviceActionLoading}
                startIcon={serviceActionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
                sx={{
                  borderRadius: 2,
                  textTransform: 'none',
                  fontWeight: 700,
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  '&:hover': { backgroundColor: '#1ebe57' },
                }}
              >
                Nyalakan Service
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Global Alerts / Feedback */}
      {feedback && (
        <Alert
          severity={feedback.type}
          onClose={() => setFeedback(null)}
          sx={{ mb: 2.5, borderRadius: 2, fontWeight: 500 }}
        >
          {feedback.message}
        </Alert>
      )}

      {/* Tabs */}
      <Paper
        elevation={0}
        sx={{
          mb: 2.5,
          borderRadius: 2,
          border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          backgroundColor: isDark ? '#18181b' : '#fafafa',
        }}
      >
        <Tabs
          value={activeTab}
          onChange={(_, val) => setActiveTab(val)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            '& .MuiTab-root': {
              textTransform: 'none',
              fontWeight: 700,
              fontSize: '0.9rem',
              minHeight: 46,
            },
          }}
        >
          <Tab icon={<ChatIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Inbox & Chat WhatsApp" />
          <Tab icon={<SendIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Kirim Pesan Cepat & Template" />
          <Tab icon={<QrCodeIcon sx={{ fontSize: 20 }} />} iconPosition="start" label="Koneksi & Tautan Sesi" />
          <Tab icon={<HistoryIcon sx={{ fontSize: 20 }} />} iconPosition="start" label={`Log Sistem (${statusData.logs?.length || 0})`} />
        </Tabs>
      </Paper>

      {/* TAB 0: INBOX / CHAT SEPERTI WHATSAPP WEB */}
      {activeTab === 0 && (
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.1)',
            overflow: 'hidden',
            height: { xs: 'calc(100vh - 220px)', md: '720px' },
            display: 'flex',
            backgroundColor: isDark ? '#111b21' : '#f0f2f5',
          }}
        >
          {/* Service not ready notice inside Inbox */}
          {statusData.status !== 'READY' ? (
            <Box
              sx={{
                width: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                p: 4,
                textAlign: 'center',
                gap: 2,
              }}
            >
              <Avatar sx={{ width: 68, height: 68, bgcolor: statusConfig.bg, color: statusConfig.text }}>
                <WhatsAppIcon sx={{ fontSize: 38 }} />
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 800 }}>
                WhatsApp Web Belum Terhubung
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
                {statusData.status === 'SERVICE_STOPPED'
                  ? 'Background service WhatsApp Gateway sedang tidak aktif. Silakan nyalakan service untuk memuat percakapan.'
                  : 'Silakan pindai QR Code di tab "Koneksi & Tautan Sesi" menggunakan aplikasi WhatsApp ponsel Anda.'}
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                {statusData.status === 'SERVICE_STOPPED' ? (
                  <Button
                    variant="contained"
                    onClick={() => handleServiceAction('start_service')}
                    disabled={serviceActionLoading}
                    startIcon={serviceActionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
                    sx={{
                      backgroundColor: '#25D366',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Nyalakan Service Sekarang
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={() => setActiveTab(2)}
                    startIcon={<QrCodeIcon />}
                    sx={{
                      backgroundColor: '#25D366',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Buka Halaman Scan QR Code
                  </Button>
                )}
              </Stack>
            </Box>
          ) : (
            <>
              {/* LEFT COLUMN: CHAT LIST SIDEBAR */}
              <Box
                sx={{
                  width: { xs: '100%', md: '360px', lg: '400px' },
                  borderRight: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                  display: { xs: mobileShowChat ? 'none' : 'flex', md: 'flex' },
                  flexDirection: 'column',
                  backgroundColor: isDark ? '#111b21' : '#ffffff',
                  height: '100%',
                }}
              >
                {/* Sidebar Header */}
                <Box
                  sx={{
                    p: 2,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                    backgroundColor: isDark ? '#202c33' : '#f0f2f5',
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="center">
                    <WhatsAppAvatar
                      chatId={statusData.info?.wid || 'admin'}
                      avatarUrl={statusData.info?.wid ? `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(statusData.info.wid)}` : undefined}
                      name={statusData.info?.pushname || 'Admin'}
                      isGroup={false}
                      size={40}
                    />
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800 }}>
                        {statusData.info?.pushname || 'Admin'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#10b981', fontWeight: 600 }}>
                        ● Online (WhatsApp)
                      </Typography>
                    </Box>
                  </Stack>

                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="Mulai Chat Baru">
                      <IconButton
                        size="small"
                        onClick={(e) => setAnchorNewChat(e.currentTarget)}
                        sx={{ color: isDark ? '#aebac1' : '#54656f' }}
                      >
                        <AddCommentIcon sx={{ fontSize: 20 }} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Segarkan Daftar Chat">
                      <IconButton
                        size="small"
                        onClick={() => fetchChats()}
                        disabled={loadingChats}
                        sx={{ color: isDark ? '#aebac1' : '#54656f' }}
                      >
                        {loadingChats ? <CircularProgress size={18} /> : <RefreshIcon sx={{ fontSize: 20 }} />}
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </Box>

                {/* Search Bar */}
                <Box sx={{ p: 1.5, pb: 1 }}>
                  <TextField
                    fullWidth
                    size="small"
                    placeholder="Cari atau mulai chat baru..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      },
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 2,
                        backgroundColor: isDark ? '#202c33' : '#f0f2f5',
                        fontSize: '0.85rem',
                      },
                    }}
                  />
                </Box>

                {/* Filter Chips */}
                <Box sx={{ px: 1.5, pb: 1 }}>
                  <Stack direction="row" spacing={0.8} sx={{ overflowX: 'auto', py: 0.5 }}>
                    {[
                      { key: 'ALL', label: 'Semua' },
                      { key: 'UNREAD', label: 'Belum Dibaca' },
                      { key: 'LEADS', label: 'Leads' },
                      { key: 'PROJECTS', label: 'Klien Proyek' },
                    ].map((f) => (
                      <Chip
                        key={f.key}
                        label={f.label}
                        size="small"
                        clickable
                        onClick={() => setFilterType(f.key as any)}
                        sx={{
                          fontSize: '0.75rem',
                          fontWeight: 700,
                          borderRadius: 2,
                          backgroundColor:
                            filterType === f.key
                              ? '#25D366'
                              : isDark
                              ? '#202c33'
                              : '#f0f2f5',
                          color: filterType === f.key ? '#ffffff' : 'text.primary',
                        }}
                      />
                    ))}
                  </Stack>
                </Box>

                {/* Chat Items List */}
                <Box sx={{ flexGrow: 1, overflowY: 'auto' }}>
                  {filteredChats.length === 0 ? (
                    <Box sx={{ py: 6, textAlign: 'center', px: 2 }}>
                      <Typography variant="body2" color="text.secondary">
                        {searchQuery ? 'Tidak ada kontak yang cocok.' : 'Belum ada riwayat percakapan.'}
                      </Typography>
                      <Button
                        size="small"
                        startIcon={<AddCommentIcon />}
                        onClick={(e) => setAnchorNewChat(e.currentTarget)}
                        sx={{ mt: 1.5, textTransform: 'none', fontWeight: 700, color: '#25D366' }}
                      >
                        + Pilih dari Leads / Klien
                      </Button>
                    </Box>
                  ) : (
                    filteredChats.map((chat) => {
                      const isSelected = selectedChat?.id === chat.id;
                      const timeStr = chat.lastMessage?.timestamp
                        ? new Date(chat.lastMessage.timestamp).toLocaleTimeString('id-ID', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : '';

                      const isGrp = Boolean(chat.isGroup || chat.id.endsWith('@g.us'));
                      return (
                        <Box
                          key={chat.id}
                          onClick={() => handleSelectChat(chat)}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 1.5,
                            px: 2,
                            py: 1.4,
                            cursor: 'pointer',
                            borderBottom: isDark
                              ? '1px solid rgba(255, 255, 255, 0.03)'
                              : '1px solid rgba(0, 0, 0, 0.04)',
                            backgroundColor: isSelected
                              ? isDark
                                ? '#2a3942'
                                : '#e9edef'
                              : 'transparent',
                            transition: 'background-color 0.15s ease',
                            '&:hover': {
                              backgroundColor: isSelected
                                ? isDark
                                  ? '#2a3942'
                                  : '#e9edef'
                                : isDark
                                ? '#202c33'
                                : '#f5f6f6',
                            },
                            '&:hover .chat-action-btn': {
                              opacity: 1,
                              visibility: 'visible',
                            },
                          }}
                        >
                          <WhatsAppAvatar
                            chatId={chat.id}
                            avatarUrl={chat.avatarUrl}
                            name={chat.name}
                            isGroup={isGrp}
                            category={chat.category}
                            size={46}
                          />

                          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                              <Typography
                                variant="subtitle2"
                                noWrap
                                sx={{
                                  fontWeight: chat.unreadCount > 0 ? 800 : 600,
                                  fontSize: '0.9rem',
                                  pr: 1,
                                }}
                              >
                                {chat.name}
                              </Typography>
                              <Stack direction="row" alignItems="center" spacing={0.5}>
                                <Tooltip title="Hapus chat">
                                  <IconButton
                                    size="small"
                                    className="chat-action-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setChatToDelete(chat);
                                      setDeleteChatConfirmOpen(true);
                                    }}
                                    sx={{
                                      p: 0.3,
                                      opacity: 0,
                                      visibility: 'hidden',
                                      transition: 'opacity 0.15s ease, visibility 0.15s ease',
                                      color: isDark ? '#f87171' : '#dc2626',
                                      '&:hover': {
                                        bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                                      },
                                    }}
                                  >
                                    <DeleteOutlineIcon sx={{ fontSize: 16 }} />
                                  </IconButton>
                                </Tooltip>
                                <Typography
                                  variant="caption"
                                  sx={{
                                    fontSize: '0.7rem',
                                    color: chat.unreadCount > 0 ? '#25D366' : 'text.secondary',
                                    fontWeight: chat.unreadCount > 0 ? 700 : 500,
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {timeStr}
                                </Typography>
                              </Stack>
                            </Stack>

                            <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mt: 0.3 }}>
                              <Typography
                                variant="body2"
                                noWrap
                                sx={{
                                  color: 'text.secondary',
                                  fontSize: '0.8rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 0.5,
                                }}
                              >
                                {chat.lastMessage?.fromMe && (
                                  <DoneAllIcon sx={{ fontSize: 15, color: '#53bdeb' }} />
                                )}
                                {chat.lastMessage?.body || 'Belum ada pesan'}
                              </Typography>

                              {chat.unreadCount > 0 && (
                                <Box
                                  sx={{
                                    bgcolor: '#25D366',
                                    color: '#ffffff',
                                    borderRadius: '12px',
                                    px: 0.8,
                                    py: 0.1,
                                    fontSize: '0.7rem',
                                    fontWeight: 800,
                                  }}
                                >
                                  {chat.unreadCount}
                                </Box>
                              )}
                            </Stack>
                          </Box>
                        </Box>
                      );
                    })
                  )}
                </Box>
              </Box>

              {/* RIGHT COLUMN: ACTIVE CONVERSATION THREAD */}
              <Box
                sx={{
                  flexGrow: 1,
                  display: { xs: mobileShowChat ? 'flex' : 'none', md: 'flex' },
                  flexDirection: 'column',
                  height: '100%',
                  backgroundColor: isDark ? '#0b141a' : '#efeae2',
                  position: 'relative',
                }}
              >
                {!selectedChat ? (
                  // Empty Splash state when no chat is selected
                  <Box
                    sx={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      p: 4,
                      textAlign: 'center',
                      gap: 2,
                    }}
                  >
                    <Avatar
                      sx={{
                        width: 80,
                        height: 80,
                        bgcolor: isDark ? 'rgba(37, 211, 102, 0.15)' : '#dcf8c6',
                        color: '#25D366',
                        mb: 1,
                      }}
                    >
                      <WhatsAppIcon sx={{ fontSize: 46 }} />
                    </Avatar>
                    <Typography variant="h5" sx={{ fontWeight: 800 }}>
                      WhatsApp Web Studio Atasilabs
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440 }}>
                      Pilih salah satu percakapan di sebelah kiri untuk melihat pesan atau klik tombol tambah untuk memulai percakapan baru dengan Klien & Leads.
                    </Typography>
                    <Chip
                      icon={<LockIcon sx={{ fontSize: 14 }} />}
                      label="Enkripsi End-to-End Aktif"
                      size="small"
                      sx={{
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        bgcolor: 'action.hover',
                        mt: 1,
                      }}
                    />
                  </Box>
                ) : (
                  <>
                    {/* Chat Header */}
                    <Box
                      sx={{
                        p: 1.8,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                        backgroundColor: isDark ? '#202c33' : '#f0f2f5',
                        zIndex: 2,
                      }}
                    >
                      <Stack direction="row" spacing={1.5} alignItems="center">
                        <IconButton
                          size="small"
                          onClick={() => setMobileShowChat(false)}
                          sx={{ display: { xs: 'inline-flex', md: 'none' } }}
                        >
                          <ArrowBackIcon />
                        </IconButton>
                        {(() => {
                          const isGrp = Boolean(selectedChat.isGroup || selectedChat.id.endsWith('@g.us'));
                          return (
                            <>
                              <WhatsAppAvatar
                                chatId={selectedChat.id}
                                avatarUrl={selectedChat.avatarUrl}
                                name={selectedChat.name}
                                isGroup={isGrp}
                                category={selectedChat.category}
                                size={40}
                              />
                              <Box>
                                <Stack direction="row" alignItems="center" spacing={1}>
                                  <Typography variant="subtitle2" sx={{ fontWeight: 800, fontSize: '0.95rem' }}>
                                    {selectedChat.name}
                                  </Typography>
                                  {isGrp && (
                                    <Chip
                                      icon={<GroupIcon sx={{ fontSize: 13, color: '#0284c7' }} />}
                                      label="Grup WhatsApp"
                                      size="small"
                                      sx={{
                                        height: 18,
                                        fontSize: '0.65rem',
                                        fontWeight: 800,
                                        bgcolor: 'rgba(2, 132, 199, 0.12)',
                                        color: '#0284c7',
                                      }}
                                    />
                                  )}
                                  {selectedChat.category && (
                                    <Chip
                                      label={selectedChat.category}
                                      size="small"
                                      color={selectedChat.category === 'LEAD' ? 'warning' : 'primary'}
                                      sx={{ height: 18, fontSize: '0.65rem', fontWeight: 800 }}
                                    />
                                  )}
                                </Stack>
                                <Typography variant="caption" color="text.secondary">
                                  {isGrp ? 'Grup WhatsApp' : (selectedChat.phone ? `+${selectedChat.phone}` : selectedChat.id)}
                                </Typography>
                              </Box>
                            </>
                          );
                        })()}
                      </Stack>

                      <Stack direction="row" spacing={1} alignItems="center">
                        <Tooltip title="Muat Ulang Pesan">
                          <IconButton
                            size="small"
                            onClick={() => fetchMessages(selectedChat.id)}
                            disabled={loadingMessages}
                            sx={{ color: isDark ? '#aebac1' : '#54656f' }}
                          >
                            {loadingMessages ? <CircularProgress size={16} /> : <RefreshIcon sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Hapus Percakapan">
                          <IconButton
                            size="small"
                            onClick={() => {
                              setChatToDelete(selectedChat);
                              setDeleteChatConfirmOpen(true);
                            }}
                            disabled={deletingChat}
                            sx={{
                              color: isDark ? '#f87171' : '#dc2626',
                              '&:hover': {
                                bgcolor: isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)',
                              },
                            }}
                          >
                            {deletingChat ? <CircularProgress size={16} color="error" /> : <DeleteOutlineIcon sx={{ fontSize: 20 }} />}
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </Box>

                    {/* Messages Body (Scroll Container) */}
                    <Box
                      sx={{
                        flexGrow: 1,
                        p: { xs: 2, md: 3 },
                        overflowY: 'auto',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1.5,
                        backgroundImage:
                          'radial-gradient(circle, rgba(120, 120, 120, 0.07) 1px, transparent 1px)',
                        backgroundSize: '16px 16px',
                      }}
                    >
                      {loadingMessages && deduplicatedMessages.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                          <CircularProgress size={32} color="primary" />
                          <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                            Memuat riwayat chat...
                          </Typography>
                        </Box>
                      ) : deduplicatedMessages.length === 0 ? (
                        <Box sx={{ py: 8, textAlign: 'center' }}>
                          <Typography variant="body2" color="text.secondary">
                            Belum ada pesan dengan {selectedChat.name}. Tulis pesan di bawah untuk memulai!
                          </Typography>
                        </Box>
                      ) : (
                        deduplicatedMessages.map((msg) => {
                          const isMe = msg.fromMe;
                          const timeStr = msg.timestamp
                            ? new Date(msg.timestamp).toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '';

                          const isImage = msg.type === 'image' || (msg.hasMedia && msg.mediaMime?.startsWith('image/')) || (Boolean(msg.mediaUrl) && /\.(jpg|jpeg|png|webp|gif)/i.test(msg.mediaUrl || ''));
                          const isDoc = msg.type === 'document' || (Boolean(msg.hasMedia) && !isImage) || (Boolean(msg.mediaUrl) && !isImage) || Boolean(msg.mediaName && !isImage);

                          return (
                            <Box
                              key={msg.id || `${msg.fromMe}-${msg.timestamp}-${(msg.body || '').slice(0, 10)}`}
                              sx={{
                                alignSelf: isMe ? 'flex-end' : 'flex-start',
                                maxWidth: { xs: '88%', md: '75%' },
                                backgroundColor: isMe
                                  ? isDark
                                    ? '#005c4b'
                                    : '#d9fdd3'
                                  : isDark
                                  ? '#202c33'
                                  : '#ffffff',
                                color: isMe
                                  ? isDark
                                    ? '#e9edef'
                                    : '#111b21'
                                  : isDark
                                  ? '#e9edef'
                                  : '#111b21',
                                p: 1.4,
                                px: 1.8,
                                borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.12)',
                                position: 'relative',
                                wordBreak: 'break-word',
                                '&:hover .msg-delete-btn': {
                                  opacity: 1,
                                  visibility: 'visible',
                                },
                              }}
                            >
                              {/* Tombol Hapus Pesan on hover */}
                              <Box
                                className="msg-delete-btn"
                                sx={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  opacity: 0,
                                  visibility: 'hidden',
                                  transition: 'opacity 0.15s ease, visibility 0.15s ease',
                                  bgcolor: isMe
                                    ? isDark
                                      ? 'rgba(0, 70, 56, 0.9)'
                                      : 'rgba(210, 248, 204, 0.95)'
                                    : isDark
                                    ? 'rgba(25, 34, 40, 0.9)'
                                    : 'rgba(255, 255, 255, 0.95)',
                                  borderRadius: '50%',
                                  boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                  zIndex: 2,
                                }}
                              >
                                <Tooltip title="Hapus pesan">
                                  <IconButton
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setMsgToDelete(msg);
                                      setDeleteMsgConfirmOpen(true);
                                    }}
                                    sx={{
                                      p: 0.35,
                                      color: isDark ? '#f87171' : '#dc2626',
                                      '&:hover': {
                                        bgcolor: isDark ? 'rgba(239, 68, 68, 0.2)' : 'rgba(239, 68, 68, 0.15)',
                                      },
                                    }}
                                  >
                                    <DeleteOutlineIcon sx={{ fontSize: 15 }} />
                                  </IconButton>
                                </Tooltip>
                              </Box>

                              {/* 👥 Nama Pengirim untuk Pesan Grup */}
                              {(selectedChat.isGroup || selectedChat.id.endsWith('@g.us')) && !isMe && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    display: 'block',
                                    fontWeight: 800,
                                    fontSize: '0.75rem',
                                    color: '#10b981',
                                    mb: 0.4,
                                  }}
                                >
                                  {msg.authorName || (msg.from ? `+${msg.from.replace(/@.*$/, '')}` : 'Anggota Grup')}
                                </Typography>
                              )}

                              {/* 🖼️ Render Image if present */}
                              {isImage && (
                                <Box
                                  sx={{
                                    mb: msg.body ? 1 : 0.5,
                                    borderRadius: 2,
                                    overflow: 'hidden',
                                    backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(0,0,0,0.04)',
                                    minWidth: 160,
                                  }}
                                >
                                  {(() => {
                                    const mediaUrl = msg.mediaUrl || `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(msg.id)}`;
                                    return (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img
                                        src={mediaUrl}
                                        alt={msg.mediaName || 'Foto WhatsApp'}
                                        style={{
                                          maxWidth: '100%',
                                          maxHeight: 340,
                                          objectFit: 'contain',
                                          borderRadius: '8px',
                                          display: 'block',
                                          cursor: 'pointer',
                                        }}
                                        onClick={() => window.open(mediaUrl, '_blank')}
                                      />
                                    );
                                  })()}
                                </Box>
                              )}

                              {/* 📄 Render Document Card if present */}
                              {isDoc && (() => {
                                const docUrl = msg.mediaUrl || `/api/whatsapp?endpoint=media&messageId=${encodeURIComponent(msg.id)}`;
                                return (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: 1.2,
                                    mb: msg.body ? 1 : 0.5,
                                    borderRadius: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 1.5,
                                    backgroundColor: isMe
                                      ? isDark
                                        ? 'rgba(0, 0, 0, 0.25)'
                                        : 'rgba(0, 0, 0, 0.06)'
                                      : isDark
                                      ? 'rgba(255, 255, 255, 0.05)'
                                      : '#f8fafc',
                                    border: '1px solid',
                                    borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                                  }}
                                >
                                  <Avatar sx={{ width: 40, height: 40, bgcolor: '#3b82f6', borderRadius: 1.5 }}>
                                    <DocumentIcon sx={{ fontSize: 22, color: '#fff' }} />
                                  </Avatar>
                                  <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                      {msg.mediaName || 'Dokumen Terlampir'}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                      {msg.mediaSize
                                        ? msg.mediaSize / 1024 > 1024
                                          ? `${(msg.mediaSize / (1024 * 1024)).toFixed(1)} MB`
                                          : `${(msg.mediaSize / 1024).toFixed(0)} KB`
                                        : 'Dokumen WhatsApp'}
                                    </Typography>
                                  </Box>
                                  <IconButton
                                    size="small"
                                    component="a"
                                    href={docUrl}
                                    target="_blank"
                                    download={msg.mediaName || 'dokumen'}
                                    sx={{
                                      backgroundColor: '#25D366',
                                      color: '#ffffff',
                                      '&:hover': { backgroundColor: '#1ebe57' },
                                    }}
                                  >
                                    <DownloadIcon sx={{ fontSize: 18 }} />
                                  </IconButton>
                                </Paper>
                                );
                              })()}

                              {/* Text Message Body */}
                              {msg.body &&
                                !(
                                  (isImage || isDoc) &&
                                  (msg.body.startsWith('[Foto') || msg.body.startsWith('[Dokumen'))
                                ) && (
                                <Typography
                                  variant="body2"
                                  sx={{
                                    whiteSpace: 'pre-wrap',
                                    fontSize: '0.88rem',
                                    lineHeight: 1.45,
                                  }}
                                >
                                  {msg.body}
                                </Typography>
                              )}

                              <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="flex-end"
                                spacing={0.4}
                                sx={{ mt: 0.5, opacity: 0.75 }}
                              >
                                <Typography variant="caption" sx={{ fontSize: '0.68rem' }}>
                                  {timeStr}
                                </Typography>
                                {isMe && (
                                  <DoneAllIcon
                                    sx={{
                                      fontSize: 14,
                                      color: msg.ack === 3 ? '#53bdeb' : '#53bdeb',
                                    }}
                                  />
                                )}
                              </Stack>
                            </Box>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </Box>

                    {/* Quick Response Templates Bar */}
                    <Box
                      sx={{
                        px: 2,
                        py: 0.8,
                        backgroundColor: isDark ? '#1a2329' : '#f0f2f5',
                        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        overflowX: 'auto',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 800, color: 'text.secondary', whiteSpace: 'nowrap' }}>
                        Template:
                      </Typography>
                      {templates.map((tpl, idx) => (
                        <Chip
                          key={idx}
                          label={tpl.title}
                          size="small"
                          clickable
                          onClick={() => setChatInputText(tpl.text(selectedChat.name))}
                          sx={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            borderRadius: 1.5,
                            backgroundColor: isDark ? '#202c33' : '#ffffff',
                            whiteSpace: 'nowrap',
                          }}
                        />
                      ))}
                    </Box>

                    {/* Chat Input Bar with Direct WhatsApp Attachment */}
                    <Box
                      sx={{
                        p: 1.5,
                        px: 2,
                        backgroundColor: isDark ? '#202c33' : '#f0f2f5',
                        borderTop: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 1,
                      }}
                    >
                      {/* Attachment Preview Box */}
                      {attachedFile && (
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            p: 1.2,
                            px: 1.6,
                            borderRadius: 2,
                            backgroundColor: isDark ? '#2a3942' : '#ffffff',
                            border: '1px solid',
                            borderColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
                          }}
                        >
                          <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                            {attachedType === 'image' && attachedPreviewUrl ? (
                              <Box
                                component="img"
                                src={attachedPreviewUrl}
                                alt="Preview"
                                sx={{
                                  width: 44,
                                  height: 44,
                                  borderRadius: 1.5,
                                  objectFit: 'cover',
                                  border: '1px solid rgba(0,0,0,0.1)',
                                }}
                              />
                            ) : (
                              <Avatar sx={{ width: 44, height: 44, bgcolor: '#3b82f6', borderRadius: 1.5 }}>
                                <DocumentIcon sx={{ fontSize: 24, color: '#fff' }} />
                              </Avatar>
                            )}
                            <Box sx={{ minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                                {attachedFile.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {(attachedFile.size / 1024 > 1024
                                  ? `${(attachedFile.size / (1024 * 1024)).toFixed(1)} MB`
                                  : `${(attachedFile.size / 1024).toFixed(0)} KB`) + ' • Kirim langsung via WhatsApp Web'}
                              </Typography>
                            </Box>
                          </Stack>

                          <IconButton size="small" onClick={handleClearAttachment} disabled={sendingChat || uploadingMedia}>
                            <CloseIcon sx={{ fontSize: 18 }} />
                          </IconButton>
                        </Box>
                      )}

                      {uploadingMedia && (
                        <Box sx={{ px: 0.5 }}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CircularProgress size={14} />
                            <Typography variant="caption" color="text.secondary">
                              Menyiapkan lampiran WhatsApp...
                            </Typography>
                          </Stack>
                        </Box>
                      )}

                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                        {/* Hidden inputs for file upload */}
                        <input
                          type="file"
                          ref={imageInputRef}
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={handleSelectImageFile}
                        />
                        <input
                          type="file"
                          ref={docInputRef}
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar"
                          style={{ display: 'none' }}
                          onChange={handleSelectDocFile}
                        />

                        {/* Paperclip Button for Attachments */}
                        <Tooltip title="Lampirkan Dokumen atau Foto">
                          <IconButton
                            onClick={(e) => setAnchorAttachMenu(e.currentTarget)}
                            disabled={sendingChat || uploadingMedia}
                            sx={{
                              color: isDark ? '#aebac1' : '#54656f',
                              '&:hover': { color: '#25D366' },
                            }}
                          >
                            <AttachFileIcon sx={{ fontSize: 22 }} />
                          </IconButton>
                        </Tooltip>

                        {/* Attachment Menu Popup */}
                        <Menu
                          anchorEl={anchorAttachMenu}
                          open={Boolean(anchorAttachMenu)}
                          onClose={() => setAnchorAttachMenu(null)}
                          anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
                          transformOrigin={{ vertical: 'bottom', horizontal: 'left' }}
                          slotProps={{ paper: { sx: { borderRadius: 2, minWidth: 200, p: 0.5 } } }}
                        >
                          <MenuItem
                            onClick={() => {
                              setAnchorAttachMenu(null);
                              imageInputRef.current?.click();
                            }}
                          >
                            <ListItemIcon>
                              <ImageIcon sx={{ color: '#10b981' }} />
                            </ListItemIcon>
                            <ListItemText primary="Foto / Gambar" secondary="JPG, PNG, WebP" />
                          </MenuItem>
                          <MenuItem
                            onClick={() => {
                              setAnchorAttachMenu(null);
                              docInputRef.current?.click();
                            }}
                          >
                            <ListItemIcon>
                              <DocumentIcon sx={{ color: '#3b82f6' }} />
                            </ListItemIcon>
                            <ListItemText primary="Dokumen" secondary="PDF, Word, Excel, ZIP" />
                          </MenuItem>
                        </Menu>

                        <TextField
                          fullWidth
                          multiline
                          maxRows={4}
                          size="small"
                          placeholder={attachedFile ? 'Tambahkan keterangan (opsional)...' : 'Ketik pesan...'}
                          value={chatInputText}
                          onChange={(e) => setChatInputText(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendChatMessage();
                            }
                          }}
                          sx={{
                            '& .MuiOutlinedInput-root': {
                              borderRadius: 3,
                              backgroundColor: isDark ? '#2a3942' : '#ffffff',
                              fontSize: '0.9rem',
                              py: 1,
                            },
                          }}
                        />

                        <IconButton
                          disabled={sendingChat || uploadingMedia || (!chatInputText.trim() && !attachedFile)}
                          onClick={handleSendChatMessage}
                          sx={{
                            width: 44,
                            height: 44,
                            backgroundColor: '#25D366',
                            color: '#ffffff',
                            '&:hover': { backgroundColor: '#1ebe57' },
                            '&.Mui-disabled': {
                              backgroundColor: isDark ? '#202c33' : '#e0e0e0',
                              color: 'text.disabled',
                            },
                          }}
                        >
                          {sendingChat || uploadingMedia ? <CircularProgress size={20} color="inherit" /> : <SendIcon sx={{ fontSize: 20 }} />}
                        </IconButton>
                      </Box>
                    </Box>
                  </>
                )}
              </Box>
            </>
          )}
        </Paper>
      )}

      {/* TAB 1: KIRIM PESAN CEPAT & TEMPLATES (DIRECT SENDER) */}
      {activeTab === 1 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <ChatIcon sx={{ color: '#25D366' }} /> Komposer Pesan Langsung
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Kirim pesan cepat ke nomor WhatsApp manapun atau pilih dari kontak terdaftar di sistem.
              </Typography>

              {statusData.status !== 'READY' && (
                <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
                  WhatsApp Gateway belum berstatus <strong>READY</strong>. Pastikan WhatsApp sudah terhubung.
                </Alert>
              )}

              {/* Recipient Selector */}
              <Box sx={{ mb: 2.5 }}>
                <FormControl fullWidth size="small">
                  <InputLabel id="select-quick-recipient">Pilih dari Leads / Proyek (Opsional)</InputLabel>
                  <Select
                    labelId="select-quick-recipient"
                    value={selectedRecipientId}
                    label="Pilih dari Leads / Proyek (Opsional)"
                    onChange={(e) => {
                      const val = e.target.value;
                      setSelectedRecipientId(val);
                      if (val.startsWith('lead-')) {
                        const l = leads.find((x) => x.id === val.replace('lead-', ''));
                        if (l) {
                          setRecipientName(l.name);
                          if (l.phone) {
                            setTargetPhone(l.phone);
                          }
                          setMessageText(
                            `Halo Kak ${l.name},\n\nTerima kasih telah menghubungi ATASILABS terkait kebutuhan web/sistem ${l.serviceType || ''}.\n\nKami siap membantu mendiskusikan kebutuhan teknis dan timeline pengerjaannya. Apakah berkenan untuk call/chat singkat hari ini?\n\nSalam hangat,\nTim ATASILABS`
                          );
                        }
                      } else if (val.startsWith('proj-')) {
                        const p = projects.find((x) => x.id === val.replace('proj-', ''));
                        if (p) {
                          setRecipientName(p.clientName);
                          setTargetPhone(p.clientPhone || '');
                          setMessageText(
                            `Halo Kak ${p.clientName},\n\nBerikut kami informasikan update untuk proyek *"${p.title}"*:\n- Status: ${p.status}\n- Progres: ${p.progress}%\n- Deadline: ${p.deadline}\n\nAnda dapat meninjau detailnya melalui portal klien Atasilabs.\n\nTerima kasih!\nTim ATASILABS`
                          );
                        }
                      }
                    }}
                  >
                    <MenuItem value="">
                      <em>-- Masukkan Nomor Manual --</em>
                    </MenuItem>
                    {leads.length > 0 && (
                      <MenuItem disabled sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>
                        --- PESAN MASUK (LEADS) ---
                      </MenuItem>
                    )}
                    {leads.map((l) => (
                      <MenuItem key={l.id} value={`lead-${l.id}`}>
                        📩 {l.name} ({l.company || 'Personal'}) - {l.serviceType || 'Lead'} {l.phone ? `• ${l.phone}` : ''}
                      </MenuItem>
                    ))}
                    {projects.length > 0 && (
                      <MenuItem disabled sx={{ fontWeight: 700, color: 'text.secondary', fontSize: '0.8rem' }}>
                        --- KLIEN PROYEK AKTIF ---
                      </MenuItem>
                    )}
                    {projects.map((p) => (
                      <MenuItem key={p.id} value={`proj-${p.id}`}>
                        🚀 {p.clientName} ({p.title}) {p.clientPhone ? `• ${p.clientPhone}` : ''}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              {/* Target Phone */}
              <Box sx={{ mb: 2.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nomor WhatsApp Tujuan"
                  placeholder="Contoh: 081234567890 atau 6281234567890"
                  value={targetPhone}
                  onChange={(e) => setTargetPhone(e.target.value)}
                  helperText="Format nomor otomatis dikonversi ke kode negara (08xx -> 628xx)."
                />
              </Box>

              {/* Quick Template Chips */}
              <Box sx={{ mb: 2.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', mb: 1, display: 'block' }}>
                  Gunakan Template Siap Pakai:
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {templates.map((tpl, idx) => (
                    <Chip
                      key={idx}
                      icon={<TemplateIcon sx={{ fontSize: 16 }} />}
                      label={tpl.title}
                      size="small"
                      onClick={() => setMessageText(tpl.text(recipientName))}
                      clickable
                      sx={{ fontWeight: 600, fontSize: '0.75rem', borderRadius: 1.5, mb: 1 }}
                    />
                  ))}
                </Stack>
              </Box>

              {/* Message Textarea */}
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={6}
                  label="Isi Pesan WhatsApp"
                  placeholder="Tulis pesan Anda di sini..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                />
              </Box>

              <Button
                variant="contained"
                fullWidth
                size="large"
                disabled={sendingQuickMessage || statusData.status !== 'READY' || !targetPhone.trim()}
                onClick={handleSendQuickMessage}
                startIcon={sendingQuickMessage ? <CircularProgress size={20} color="inherit" /> : <SendIcon />}
                sx={{
                  py: 1.4,
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  borderRadius: 2,
                  backgroundColor: '#25D366',
                  color: '#ffffff',
                  textTransform: 'none',
                  '&:hover': { backgroundColor: '#1ebe57' },
                }}
              >
                {sendingQuickMessage ? 'Mengirim Pesan...' : 'Kirim Pesan via WhatsApp Web'}
              </Button>
            </Paper>
          </Grid>

          {/* Live Chat Bubble Preview */}
          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                Pratinjau Pesan di Ponsel
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Simulasi tampilan bubble chat WhatsApp di sisi penerima:
              </Typography>

              <Box
                sx={{
                  flexGrow: 1,
                  borderRadius: 3,
                  p: 2.5,
                  backgroundColor: isDark ? '#0b141a' : '#efeae2',
                  border: isDark ? '1px solid #202c33' : '1px solid #d1d7db',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  minHeight: 280,
                }}
              >
                <Box
                  sx={{
                    alignSelf: 'flex-end',
                    maxWidth: '85%',
                    backgroundColor: isDark ? '#005c4b' : '#d9fdd3',
                    color: isDark ? '#e9edef' : '#111b21',
                    p: 1.8,
                    borderRadius: '12px 12px 2px 12px',
                    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.15)',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', fontSize: '0.85rem', lineHeight: 1.45 }}>
                    {messageText || '(Ketik pesan di sebelah kiri untuk melihat pratinjau bubble chat...)'}
                  </Typography>

                  <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} sx={{ mt: 0.8, opacity: 0.75 }}>
                    <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                      {new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </Typography>
                    <CheckIcon sx={{ fontSize: 14, color: '#53bdeb' }} />
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: KONEKSI & SCAN QR */}
      {activeTab === 2 && (
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, md: 7 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                height: '100%',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                <PhoneIcon sx={{ color: '#25D366' }} /> Status Sesi WhatsApp Admin
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                {statusConfig.desc}
              </Typography>

              {!statusData.serviceOnline && (
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#f9fafb',
                    border: '1px dashed #9ca3af',
                    mb: 2,
                    textAlign: 'center',
                  }}
                >
                  <PowerIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Service WhatsApp Gateway Sedang Offline
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleServiceAction('start_service')}
                    disabled={serviceActionLoading}
                    startIcon={serviceActionLoading ? <CircularProgress size={16} color="inherit" /> : <PlayIcon />}
                    sx={{
                      mt: 2,
                      backgroundColor: '#25D366',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                    }}
                  >
                    Nyalakan Service Sekarang
                  </Button>
                </Card>
              )}

              {statusData.serviceOnline && statusData.status === 'ERROR' && (
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: isDark ? 'rgba(239, 68, 68, 0.06)' : '#fef2f2',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    mb: 2,
                    textAlign: 'center',
                  }}
                >
                  <WarningIcon sx={{ fontSize: 44, color: '#ef4444', mb: 1 }} />
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#ef4444' }}>
                    Terjadi Kendala Koneksi WhatsApp
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                    {statusData.error || 'Browser background terputus atau sesi terkunci.'}
                  </Typography>
                  <Button
                    variant="contained"
                    onClick={() => handleServiceAction('restart')}
                    disabled={serviceActionLoading}
                    startIcon={serviceActionLoading ? <CircularProgress size={16} color="inherit" /> : <RefreshIcon />}
                    sx={{
                      backgroundColor: '#ef4444',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: 2,
                      textTransform: 'none',
                      '&:hover': { backgroundColor: '#dc2626' },
                    }}
                  >
                    Hubungkan Ulang & Pulihkan Sesi
                  </Button>
                </Card>
              )}

              {statusData.status === 'READY' && statusData.info && (
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: isDark ? 'rgba(16, 185, 129, 0.08)' : '#f0fdf4',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    mb: 2,
                  }}
                >
                  <Stack direction="row" spacing={2.5} alignItems="center">
                    <WhatsAppAvatar
                      chatId={statusData.info.wid || 'admin'}
                      avatarUrl={statusData.info.wid ? `/api/whatsapp?endpoint=avatar&chatId=${encodeURIComponent(statusData.info.wid)}` : undefined}
                      name={statusData.info.pushname || 'Admin'}
                      isGroup={false}
                      size={64}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="h6" sx={{ fontWeight: 800 }}>
                          {statusData.info.pushname || 'Admin'}
                        </Typography>
                        <CheckCircleIcon sx={{ color: '#10b981', fontSize: 20 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#10b981' }}>
                        +{statusData.info.phone}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                        Platform: {statusData.info.platform || 'WhatsApp Web'}
                      </Typography>
                    </Box>
                  </Stack>
                </Card>
              )}

              {statusData.status === 'QR_READY' && statusData.qrDataUrl && (
                <Card
                  elevation={0}
                  sx={{
                    p: 3,
                    borderRadius: 2,
                    backgroundColor: isDark ? '#1e1e24' : '#f8fafc',
                    border: '1px solid #e2e8f0',
                    textAlign: 'center',
                    mb: 2,
                  }}
                >
                  <Typography variant="subtitle2" color="warning.main" sx={{ fontWeight: 700, mb: 2 }}>
                    📸 Pindai Kode QR Ini Menggunakan WhatsApp Ponsel Anda:
                  </Typography>
                  <Box
                    sx={{
                      display: 'inline-block',
                      p: 1.5,
                      backgroundColor: '#ffffff',
                      borderRadius: 2,
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                      mb: 2,
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={statusData.qrDataUrl}
                      alt="WhatsApp QR Code"
                      style={{ width: 260, height: 260, display: 'block' }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                    QR Code otomatis disegarkan setiap beberapa detik.
                  </Typography>
                </Card>
              )}
            </Paper>
          </Grid>

          <Grid size={{ xs: 12, md: 5 }}>
            <Paper
              elevation={0}
              sx={{
                p: 3,
                borderRadius: 3,
                border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
                height: '100%',
              }}
            >
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 2 }}>
                Panduan Menghubungkan
              </Typography>
              <Stack spacing={2}>
                {[
                  { num: '1', title: 'Buka WhatsApp di Ponsel', desc: 'Buka WhatsApp di ponsel utama Anda.' },
                  { num: '2', title: 'Pilih "Perangkat Tertaut"', desc: 'Masuk ke menu Pengaturan > Perangkat Tertaut.' },
                  { num: '3', title: 'Pindai QR Code', desc: 'Arahkan kamera ponsel Anda ke QR code di sebelah kiri.' },
                  { num: '4', title: 'Selesai!', desc: 'Sesi tersimpan aman permanen di server.' },
                ].map((s) => (
                  <Stack key={s.num} direction="row" spacing={1.5} alignItems="flex-start">
                    <Avatar sx={{ width: 26, height: 26, bgcolor: '#25D366', color: '#fff', fontSize: '0.8rem', fontWeight: 800 }}>
                      {s.num}
                    </Avatar>
                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                        {s.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.desc}
                      </Typography>
                    </Box>
                  </Stack>
                ))}
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      )}

      {/* TAB 3: LOG SISTEM */}
      {activeTab === 3 && (
        <Paper
          elevation={0}
          sx={{
            p: 3,
            borderRadius: 3,
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.08)',
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Riwayat Sesi & Log Pesan
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Daftar aktivitas pengiriman pesan, pesan masuk, dan event sistem WhatsApp.
              </Typography>
            </Box>
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" size="small" onClick={() => fetchStatus()} startIcon={<RefreshIcon />} sx={{ borderRadius: 2 }}>
                Segarkan
              </Button>
              <Button variant="outlined" color="error" size="small" onClick={() => handleServiceAction('clear_logs')} startIcon={<ClearIcon />} sx={{ borderRadius: 2 }}>
                Bersihkan Log
              </Button>
            </Stack>
          </Stack>

          {(!statusData.logs || statusData.logs.length === 0) ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography variant="body2" color="text.secondary">
                Belum ada catatan aktivitas pesan.
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.5}>
              {statusData.logs.map((log) => (
                <Paper
                  key={log.id}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.02)' : '#fafafa',
                    border: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid rgba(0, 0, 0, 0.05)',
                  }}
                >
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
                    <Box sx={{ flexGrow: 1 }}>
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 0.5 }}>
                        <Chip
                          label={log.direction}
                          size="small"
                          color={log.direction === 'OUTGOING' ? 'primary' : log.direction === 'INCOMING' ? 'success' : 'default'}
                          sx={{ fontWeight: 700, fontSize: '0.7rem' }}
                        />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {log.target}
                        </Typography>
                        <Chip label={log.status} size="small" variant="outlined" sx={{ fontSize: '0.68rem', height: 20 }} />
                      </Stack>
                      <Typography variant="body2" sx={{ color: 'text.secondary', whiteSpace: 'pre-wrap', fontSize: '0.85rem' }}>
                        {log.body}
                      </Typography>
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      {new Date(log.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </Typography>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      )}

      {/* Popover untuk Memilih Chat Baru dari Leads & Projects */}
      <Popover
        anchorEl={anchorNewChat}
        open={Boolean(anchorNewChat)}
        onClose={() => setAnchorNewChat(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'left' }}
        slotProps={{ paper: { sx: { width: 340, maxHeight: 420, borderRadius: 2.5, p: 1 } } }}
      >
        <Typography variant="subtitle2" sx={{ px: 2, py: 1, fontWeight: 800, color: 'text.primary' }}>
          Mulai Percakapan Baru
        </Typography>
        <Divider sx={{ mb: 1 }} />

        {/* Tombol Input Nomor WhatsApp Baru */}
        <MenuItem
          onClick={() => {
            setAnchorNewChat(null);
            setOpenNewNumberModal(true);
          }}
          sx={{
            borderRadius: 2,
            py: 1.2,
            mb: 1.5,
            backgroundColor: isDark ? 'rgba(37, 211, 102, 0.12)' : '#f0fdf4',
            border: '1px solid rgba(37, 211, 102, 0.3)',
            '&:hover': {
              backgroundColor: isDark ? 'rgba(37, 211, 102, 0.22)' : '#dcfce7',
            },
          }}
        >
          <Avatar sx={{ width: 36, height: 36, mr: 1.5, bgcolor: '#25D366', color: '#fff' }}>
            <DialpadIcon sx={{ fontSize: 20 }} />
          </Avatar>
          <Box sx={{ minWidth: 0, flexGrow: 1 }}>
            <Typography variant="body2" sx={{ fontWeight: 800, color: isDark ? '#25D366' : '#15803d' }}>
              + Input Nomor WhatsApp Baru
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
              Mulai chat nomor baru tanpa simpan kontak
            </Typography>
          </Box>
        </MenuItem>

        <Divider sx={{ mb: 1.5 }} />

        {leads.length > 0 && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="caption" sx={{ px: 2, py: 0.5, fontWeight: 800, color: '#f59e0b', display: 'block' }}>
              DARI PESAN MASUK (LEADS)
            </Typography>
            {leads.slice(0, 5).map((l) => (
              <MenuItem
                key={l.id}
                onClick={() =>
                  handleStartChatWithContact({
                    id: l.id,
                    name: l.name,
                    phone: l.phone || '',
                    category: 'LEAD',
                    company: l.company || '',
                  })
                }
                sx={{ borderRadius: 1.5, py: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#f59e0b', fontSize: '0.8rem', fontWeight: 700 }}>
                  {l.name.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {l.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {l.serviceType || 'Inquiry Proyek'} {l.phone ? `• ${l.phone}` : ''}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}

        {projects.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ px: 2, pt: 1, pb: 0.5, fontWeight: 800, color: '#3b82f6', display: 'block' }}>
              DARI KLIEN PROYEK AKTIF
            </Typography>
            {projects.slice(0, 6).map((p) => (
              <MenuItem
                key={p.id}
                onClick={() =>
                  handleStartChatWithContact({
                    id: p.id,
                    name: p.clientName,
                    phone: p.clientPhone || '',
                    category: 'CLIENT',
                    company: p.clientCompany || '',
                  })
                }
                sx={{ borderRadius: 1.5, py: 1 }}
              >
                <Avatar sx={{ width: 32, height: 32, mr: 1.5, bgcolor: '#3b82f6', fontSize: '0.8rem', fontWeight: 700 }}>
                  {p.clientName.charAt(0)}
                </Avatar>
                <Box sx={{ minWidth: 0, flexGrow: 1 }}>
                  <Typography variant="body2" sx={{ fontWeight: 700 }} noWrap>
                    {p.clientName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                    {p.title} {p.clientPhone ? `• ${p.clientPhone}` : ''}
                  </Typography>
                </Box>
              </MenuItem>
            ))}
          </Box>
        )}
      </Popover>

      {/* Modal Dialog: Input Nomor WhatsApp Baru */}
      <Dialog
        open={openNewNumberModal}
        onClose={() => setOpenNewNumberModal(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              backgroundColor: isDark ? '#1e2428' : '#ffffff',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: '#25D366', color: '#fff', width: 42, height: 42 }}>
            <PersonAddIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
              Mulai Percakapan Baru
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kirim pesan langsung ke nomor WhatsApp manapun
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 2 }}>
          <Stack spacing={2.5}>
            <TextField
              fullWidth
              autoFocus
              size="small"
              label="Nomor WhatsApp"
              placeholder="Contoh: 81234567890 atau 081234567890"
              value={newNumberPhone}
              onChange={(e) => setNewNumberPhone(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <Typography variant="body2" sx={{ fontWeight: 700, color: '#25D366' }}>
                        +62
                      </Typography>
                    </InputAdornment>
                  ),
                },
              }}
              helperText="Bisa diawali dengan 08..., 8..., atau 628..."
            />

            <TextField
              fullWidth
              size="small"
              label="Nama Kontak / Klien (Opsional)"
              placeholder="Contoh: Bpk. Budi / PT Sinergi"
              value={newNumberName}
              onChange={(e) => setNewNumberName(e.target.value)}
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              size="small"
              label="Pesan Awal (Opsional)"
              placeholder="Halo Kak, terima kasih telah menghubungi ATASILABS..."
              value={newNumberInitialMessage}
              onChange={(e) => setNewNumberInitialMessage(e.target.value)}
              helperText="Pesan akan langsung terkirim otomatis saat chat dibuat."
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setOpenNewNumberModal(false)}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleStartChatWithCustomNumber}
            disabled={!newNumberPhone.trim() || sendingChat}
            startIcon={sendingChat ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
            sx={{
              backgroundColor: '#25D366',
              color: '#ffffff',
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
              '&:hover': { backgroundColor: '#1ebe57' },
            }}
          >
            Mulai Chat
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Dialog: Konfirmasi Hapus Percakapan */}
      <Dialog
        open={deleteChatConfirmOpen}
        onClose={() => !deletingChat && setDeleteChatConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              backgroundColor: isDark ? '#1e2428' : '#ffffff',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', width: 42, height: 42 }}>
            <DeleteOutlineIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
              Hapus Percakapan?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Tindakan ini tidak dapat dibatalkan
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
            Apakah Anda yakin ingin menghapus seluruh riwayat percakapan dengan{' '}
            <strong style={{ color: isDark ? '#e9edef' : '#111b21' }}>
              {chatToDelete?.name || selectedChat?.name || 'kontak ini'}
            </strong>
            ? Semua pesan dan lampiran yang tersimpan dalam percakapan ini akan dihapus permanen dari database.
          </Typography>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteChatConfirmOpen(false)}
            disabled={deletingChat}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteChat}
            disabled={deletingChat}
            startIcon={deletingChat ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
            }}
          >
            {deletingChat ? 'Menghapus...' : 'Hapus Percakapan'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal Dialog: Konfirmasi Hapus Pesan Tunggal */}
      <Dialog
        open={deleteMsgConfirmOpen}
        onClose={() => !deletingMsg && setDeleteMsgConfirmOpen(false)}
        maxWidth="xs"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              borderRadius: 3,
              p: 1,
              backgroundColor: isDark ? '#1e2428' : '#ffffff',
            },
          },
        }}
      >
        <DialogTitle sx={{ pb: 1, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ bgcolor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', width: 42, height: 42 }}>
            <DeleteOutlineIcon />
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.1rem' }}>
              Hapus Pesan?
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Pesan akan dihapus permanen
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ pt: 1.5 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5, lineHeight: 1.6 }}>
            Apakah Anda yakin ingin menghapus pesan ini? Pesan akan dihapus dari obrolan dan database.
          </Typography>
          {msgToDelete && (
            <Paper
              elevation={0}
              sx={{
                p: 1.5,
                borderRadius: 2,
                bgcolor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)',
                border: '1px solid',
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
                fontSize: '0.85rem',
                maxHeight: 100,
                overflowY: 'auto',
              }}
            >
              <Typography variant="body2" sx={{ fontStyle: 'italic', wordBreak: 'break-word' }}>
                {msgToDelete.hasMedia
                  ? `[Lampiran: ${msgToDelete.mediaName || 'Media'}] ${msgToDelete.body || ''}`
                  : msgToDelete.body || '(Pesan kosong)'}
              </Typography>
            </Paper>
          )}
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={() => setDeleteMsgConfirmOpen(false)}
            disabled={deletingMsg}
            sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            color="error"
            onClick={handleDeleteMessage}
            disabled={deletingMsg}
            startIcon={deletingMsg ? <CircularProgress size={16} color="inherit" /> : <DeleteOutlineIcon />}
            sx={{
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 2,
              px: 2.5,
            }}
          >
            {deletingMsg ? 'Menghapus...' : 'Hapus Pesan'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

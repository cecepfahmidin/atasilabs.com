import { IPWStage, ProjectStatus } from '../types';

export interface IPWStageConfig {
  stage: IPWStage;
  stageNumber: number; // 1 to 6
  label: string;
  shortName: string;
  progressPercent: number;
  defaultStatus: ProjectStatus;
  badgeColor: 'default' | 'info' | 'primary' | 'warning' | 'secondary' | 'success';
  hexColor: string;
  description: string;
  documentAssigned: string;
}

export const IPW_STAGES_CONFIG: Record<IPWStage, IPWStageConfig> = {
  STAGE_1_DISCOVERY: {
    stage: 'STAGE_1_DISCOVERY',
    stageNumber: 1,
    label: 'Tahap 1: Discovery & Intake (CIF)',
    shortName: 'Tahap 1 - CIF',
    progressPercent: 15,
    defaultStatus: 'PLANNING',
    badgeColor: 'default',
    hexColor: '#64748b',
    description: 'Pengumpulan kebutuhan awal klien (Form Intake CIF) & Penentuan Klaster Tier 1-5.',
    documentAssigned: 'CIF (Customer Information Form)',
  },
  STAGE_2_PRE_SALES: {
    stage: 'STAGE_2_PRE_SALES',
    stageNumber: 2,
    label: 'Tahap 2: Spesifikasi Teknis (RSD)',
    shortName: 'Tahap 2 - RSD',
    progressPercent: 30,
    defaultStatus: 'PLANNING',
    badgeColor: 'info',
    hexColor: '#06b6d4',
    description: 'Penyusunan fitur ATL-xxx, NFR, Tech Stack, & estimasi milestone pengerjaan.',
    documentAssigned: 'RSD (Requirement Spec Document)',
  },
  STAGE_3_CONTRACTING: {
    stage: 'STAGE_3_CONTRACTING',
    stageNumber: 3,
    label: 'Tahap 3: Kontrak Bisnis (MoU)',
    shortName: 'Tahap 3 - MoU',
    progressPercent: 45,
    defaultStatus: 'IN_PROGRESS',
    badgeColor: 'warning',
    hexColor: '#f59e0b',
    description: 'Kesepakatan MoU PT Aulia Indoland Grup, skema DP/termin, & rekening pembayaran.',
    documentAssigned: 'MoU (Memorandum of Understanding)',
  },
  STAGE_4_DELEGATION: {
    stage: 'STAGE_4_DELEGATION',
    stageNumber: 4,
    label: 'Tahap 4: Pendelegasian Tim (SPK)',
    shortName: 'Tahap 4 - SPK',
    progressPercent: 60,
    defaultStatus: 'IN_PROGRESS',
    badgeColor: 'primary',
    hexColor: '#3b82f6',
    description: 'Penerbitan SPK Mitra Developer, skema fee 40/60, & jadwal deadline sprints.',
    documentAssigned: 'SPK (Surat Perintah Kerja)',
  },
  STAGE_5_EXECUTION: {
    stage: 'STAGE_5_EXECUTION',
    stageNumber: 5,
    label: 'Tahap 5: Pengerjaan Teknis & Review',
    shortName: 'Tahap 5 - Review Sprints',
    progressPercent: 85,
    defaultStatus: 'REVIEW',
    badgeColor: 'secondary',
    hexColor: '#ec4899',
    description: 'Pengembangan full-stack, QA Testing, Staging deployment, & UAT review klien.',
    documentAssigned: 'Checklist UAT & Sprints Review',
  },
  STAGE_6_CLOSURE: {
    stage: 'STAGE_6_CLOSURE',
    stageNumber: 6,
    label: 'Tahap 6: Serah Terima & BAST (Selesai)',
    shortName: 'Tahap 6 - BAST (Selesai)',
    progressPercent: 100,
    defaultStatus: 'COMPLETED',
    badgeColor: 'success',
    hexColor: '#10b981',
    description: 'Penandatanganan Berita Acara Serah Terima (BAST), serah kredensial & garansi.',
    documentAssigned: 'BAST (Berita Acara Serah Terima)',
  },
};

export const IPW_STAGES_LIST: IPWStageConfig[] = [
  IPW_STAGES_CONFIG.STAGE_1_DISCOVERY,
  IPW_STAGES_CONFIG.STAGE_2_PRE_SALES,
  IPW_STAGES_CONFIG.STAGE_3_CONTRACTING,
  IPW_STAGES_CONFIG.STAGE_4_DELEGATION,
  IPW_STAGES_CONFIG.STAGE_5_EXECUTION,
  IPW_STAGES_CONFIG.STAGE_6_CLOSURE,
];

export const getStageFromProgress = (progressPercent: number, stage?: IPWStage): IPWStageConfig => {
  if (stage && IPW_STAGES_CONFIG[stage]) {
    return IPW_STAGES_CONFIG[stage];
  }
  if (progressPercent >= 100) return IPW_STAGES_CONFIG.STAGE_6_CLOSURE;
  if (progressPercent >= 75) return IPW_STAGES_CONFIG.STAGE_5_EXECUTION;
  if (progressPercent >= 55) return IPW_STAGES_CONFIG.STAGE_4_DELEGATION;
  if (progressPercent >= 40) return IPW_STAGES_CONFIG.STAGE_3_CONTRACTING;
  if (progressPercent >= 25) return IPW_STAGES_CONFIG.STAGE_2_PRE_SALES;
  return IPW_STAGES_CONFIG.STAGE_1_DISCOVERY;
};

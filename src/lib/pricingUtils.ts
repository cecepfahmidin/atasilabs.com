import { PricingTier, HPPItem } from '../types';
import { INITIAL_HPP_MATRIX } from '../data/initialDocuments';

export function computeBudgetFromService(
  serviceType: string,
  pricingTiers: PricingTier[] = []
): { text: string; amount: number } {
  if (!serviceType) {
    return { text: 'Rp 18.500.000 (Tier 3: Profesional)', amount: 18500000 };
  }

  const lower = serviceType.toLowerCase();

  // Try matching against pricingTiers array from AppContext
  const matchedTier = pricingTiers.find((t) => {
    const tName = t.name.toLowerCase();
    return (
      lower.includes(`tier ${t.tierNumber}`) ||
      lower.includes(`tier ${t.tierNumber}:`) ||
      lower.includes(tName)
    );
  });

  if (matchedTier) {
    return {
      text: `Rp ${matchedTier.price.toLocaleString('id-ID')} (${matchedTier.name})`,
      amount: matchedTier.price,
    };
  }

  // Fallbacks based on standard core services
  if (lower.includes('full-stack') || lower.includes('e-commerce')) {
    const tier = pricingTiers.find((t) => t.tierNumber === 3);
    const amount = tier ? tier.price : 18500000;
    return { text: `Rp ${amount.toLocaleString('id-ID')} (Tier 3: Profesional)`, amount };
  }
  if (lower.includes('saas') || lower.includes('enterprise')) {
    const tier = pricingTiers.find((t) => t.tierNumber === 4);
    const amount = tier ? tier.price : 38000000;
    return { text: `Rp ${amount.toLocaleString('id-ID')} (Tier 4: Enterprise)`, amount };
  }
  if (lower.includes('database') || lower.includes('orm')) {
    const tier = pricingTiers.find((t) => t.tierNumber === 2);
    const amount = tier ? tier.price : 9500000;
    return { text: `Rp ${amount.toLocaleString('id-ID')} (Tier 2: Growth)`, amount };
  }
  if (lower.includes('audit') || lower.includes('performance')) {
    const tier = pricingTiers.find((t) => t.tierNumber === 1);
    const amount = tier ? tier.price : 4500000;
    return { text: `Rp ${amount.toLocaleString('id-ID')} (Tier 1: Starter)`, amount };
  }

  return { text: 'Rp 18.500.000 (Paket Standar)', amount: 18500000 };
}

export function getPriceForTier(
  tierNameOrNum: string | number,
  pricingTiers: PricingTier[] = []
): number {
  let tierNum = 3;
  if (typeof tierNameOrNum === 'number') {
    tierNum = tierNameOrNum;
  } else {
    const lower = String(tierNameOrNum).toLowerCase();
    if (lower.includes('tier 1') || lower.includes('starter')) tierNum = 1;
    else if (lower.includes('tier 2') || lower.includes('growth')) tierNum = 2;
    else if (lower.includes('tier 3') || lower.includes('profesional') || lower.includes('professional')) tierNum = 3;
    else if (lower.includes('tier 4') || lower.includes('enterprise')) tierNum = 4;
    else if (lower.includes('tier 5') || lower.includes('elite')) tierNum = 5;
  }

  const matched = pricingTiers.find((t) => t.tierNumber === tierNum);
  if (matched && matched.price) {
    return matched.price;
  }

  const defaultPrices: Record<number, number> = {
    1: 4500000,
    2: 9500000,
    3: 18500000,
    4: 38000000,
    5: 75000000,
  };

  return defaultPrices[tierNum] || 18500000;
}

export function getDynamicHppMatrix(): HPPItem[] {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('atasilabs_hpp_matrix_custom');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading custom HPP matrix from localStorage', e);
    }
  }
  return INITIAL_HPP_MATRIX;
}

export function getFreelancerFeeForTier(
  tierNameOrNum: string | number,
  customMatrix?: HPPItem[]
): number {
  let tierNum = 3;
  if (typeof tierNameOrNum === 'number') {
    tierNum = tierNameOrNum;
  } else {
    const lower = String(tierNameOrNum).toLowerCase();
    if (lower.includes('tier 1') || lower.includes('starter')) tierNum = 1;
    else if (lower.includes('tier 2') || lower.includes('growth')) tierNum = 2;
    else if (lower.includes('tier 3') || lower.includes('profesional') || lower.includes('professional')) tierNum = 3;
    else if (lower.includes('tier 4') || lower.includes('enterprise')) tierNum = 4;
    else if (lower.includes('tier 5') || lower.includes('elite')) tierNum = 5;
  }

  const matrix = customMatrix && customMatrix.length > 0 ? customMatrix : getDynamicHppMatrix();
  const matched = matrix.find((item) => item.tierNumber === tierNum);
  if (matched && typeof matched.developerFee === 'number') {
    return matched.developerFee;
  }

  const fallbackFees: Record<number, number> = {
    1: 150000,
    2: 1500000,
    3: 3500000,
    4: 7000000,
    5: 15000000,
  };
  return fallbackFees[tierNum] || 3500000;
}

export function inferTierFromFee(fee: number, customMatrix?: HPPItem[]): string {
  const matrix = customMatrix && customMatrix.length > 0 ? customMatrix : getDynamicHppMatrix();
  const t1 = matrix.find((m) => m.tierNumber === 1)?.developerFee || 150000;
  const t2 = matrix.find((m) => m.tierNumber === 2)?.developerFee || 1500000;
  const t3 = matrix.find((m) => m.tierNumber === 3)?.developerFee || 3500000;
  const t4 = matrix.find((m) => m.tierNumber === 4)?.developerFee || 7000000;

  if (fee <= (t1 + t2) / 2) return 'Tier 1: Starter';
  if (fee <= (t2 + t3) / 2) return 'Tier 2: Growth';
  if (fee <= (t3 + t4) / 2) return 'Tier 3: Profesional';
  if (fee <= (t4 + 15000000) / 2) return 'Tier 4: Enterprise';
  return 'Tier 5: Elite';
}


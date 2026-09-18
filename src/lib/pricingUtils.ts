import { PricingTier } from '../types';

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

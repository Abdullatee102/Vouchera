import { keccak256, toHex, stringToBytes } from 'viem';

// Compute keccak256("FOOD") etc. matching Solidity's keccak256(abi.encodePacked("FOOD"))
// Actually Solidity keccak256("FOOD") = keccak256 of the UTF-8 bytes of "FOOD"
function computeCategory(name: string): `0x${string}` {
  return keccak256(toHex(stringToBytes(name)));
}

export const CATEGORIES: Array<{ name: string; code: `0x${string}`; emoji: string; color: string; image: string }> = [
  { name: 'FOOD', code: computeCategory('FOOD'), emoji: '🍎', color: '#22c55e', image: '/vouchers/food-voucher.svg' },
  { name: 'EDUCATION', code: computeCategory('EDUCATION'), emoji: '📚', color: '#3b82f6', image: '/vouchers/education-voucher.svg' },
  { name: 'HEALTHCARE', code: computeCategory('HEALTHCARE'), emoji: '🏥', color: '#ef4444', image: '/vouchers/healthcare-voucher.svg' },
  { name: 'TRANSPORT', code: computeCategory('TRANSPORT'), emoji: '🚌', color: '#f59e0b', image: '/vouchers/transport-voucher.svg' },
  { name: 'ESSENTIALS', code: computeCategory('ESSENTIALS'), emoji: '🏠', color: '#8b5cf6', image: '/vouchers/essentials-voucher.svg' },
];

export const CATEGORY_CODE_MAP: Record<string, typeof CATEGORIES[number]> = {};
for (const cat of CATEGORIES) {
  CATEGORY_CODE_MAP[cat.code] = cat;
}

export function getCategoryByCode(code: string): typeof CATEGORIES[number] | undefined {
  return CATEGORY_CODE_MAP[code as `0x${string}`];
}

export function getCategoryByName(name: string): typeof CATEGORIES[number] | undefined {
  return CATEGORIES.find(c => c.name === name.toUpperCase());
}


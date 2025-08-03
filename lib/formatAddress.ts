// utils/formatAddress.ts
export const formatAddress = (address: string | null | undefined, prefixLength = 4, suffixLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, prefixLength)}...${address.slice(-suffixLength)}`;
};
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatPercentage = (value: number): string => {
  return `${value.toFixed(2)}%`;
};

export const formatCryptoAmount = (value: number): string => {
  if (value >= 1) {
    return value.toFixed(4);
  } else if (value >= 0.01) {
    return value.toFixed(6);
  } else {
    return value.toFixed(8);
  }
};

export const formatShortAddress = (address: string): string => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

export const formatShortCardNumber = (number: string): string => {
  return `•••• ${number.slice(-4)}`;
};
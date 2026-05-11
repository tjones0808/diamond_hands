export function estimatePremium(currentPrice: number, strike: number, volatility: number, type: 'CALL' | 'PUT') {
  const intrinsic = type === 'CALL'
    ? Math.max(0, currentPrice - strike)
    : Math.max(0, strike - currentPrice);
  const distance = Math.abs(currentPrice - strike) / currentPrice;
  const timeValue = currentPrice * Math.max(0.02, volatility) * Math.max(0.35, 1 - distance);
  return roundMoney(Math.max(0.5, intrinsic + timeValue));
}

export function settleOptionValue(type: 'CALL' | 'PUT', strike: number, finalPrice: number, quantity: number) {
  const value = type === 'CALL'
    ? Math.max(0, finalPrice - strike)
    : Math.max(0, strike - finalPrice);
  return roundMoney(value * quantity);
}

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

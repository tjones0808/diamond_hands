import { useMemo, useState } from 'react';
import type { GameAction } from '../game/reducer';
import type { OptionExpiryDay, OptionStrategyType, WeekDay } from '../game/types';
import { daysToExpiry, estimatePremium } from '../trading/options';

interface TradeTicketProps {
  symbol: string;
  currentPrice: number;
  currentDay: WeekDay;
  volatility: number;
  dispatch: (action: GameAction) => void;
}

type StrategyOption = {
  value: OptionStrategyType;
  label: string;
  legs: 1 | 2;
};

const strategies: StrategyOption[] = [
  { value: 'SINGLE_CALL', label: 'Single', legs: 1 },
  { value: 'CALL_SPREAD', label: 'Call Spread', legs: 2 },
  { value: 'PUT_SPREAD', label: 'Put Spread', legs: 2 },
  { value: 'STRADDLE', label: 'Straddle', legs: 2 }
];

const dayOrder: WeekDay[] = ['MON', 'TUE', 'WED', 'THU', 'FRI'];
const allExpiries: OptionExpiryDay[] = ['TUE', 'THU', 'FRI'];

function availableExpiries(currentDay: WeekDay): OptionExpiryDay[] {
  const currentIndex = dayOrder.indexOf(currentDay);
  return allExpiries.filter((expiry) => dayOrder.indexOf(expiry) >= currentIndex);
}

export function TradeTicket({ symbol, currentPrice, currentDay, volatility, dispatch }: TradeTicketProps) {
  const [shareQuantity, setShareQuantity] = useState(10);
  const [contractQuantity, setContractQuantity] = useState(1);
  const [strategy, setStrategy] = useState<OptionStrategyType>('SINGLE_CALL');
  const expiryChoices = availableExpiries(currentDay);
  const [expiresDay, setExpiresDay] = useState<OptionExpiryDay>(expiryChoices.at(-1) ?? 'FRI');
  const safeExpiry = expiryChoices.includes(expiresDay) ? expiresDay : expiryChoices.at(-1) ?? 'FRI';
  const remaining = daysToExpiry(currentDay, safeExpiry);

  const longCallStrike = Math.max(1, Math.round(currentPrice * 1.05));
  const shortCallStrike = Math.max(longCallStrike + 1, Math.round(currentPrice * 1.12));
  const longPutStrike = Math.max(1, Math.round(currentPrice * 0.95));
  const shortPutStrike = Math.max(1, Math.min(longPutStrike - 1, Math.round(currentPrice * 0.88)));
  const straddleStrike = Math.max(1, Math.round(currentPrice));

  const callPremium = useMemo(() => estimatePremium(currentPrice, longCallStrike, volatility, 'CALL', remaining), [currentPrice, longCallStrike, volatility, remaining]);
  const putPremium = useMemo(() => estimatePremium(currentPrice, longPutStrike, volatility, 'PUT', remaining), [currentPrice, longPutStrike, volatility, remaining]);
  const callSpreadShortPremium = useMemo(() => estimatePremium(currentPrice, shortCallStrike, volatility, 'CALL', remaining), [currentPrice, shortCallStrike, volatility, remaining]);
  const putSpreadShortPremium = useMemo(() => estimatePremium(currentPrice, shortPutStrike, volatility, 'PUT', remaining), [currentPrice, shortPutStrike, volatility, remaining]);
  const straddleCallPremium = useMemo(() => estimatePremium(currentPrice, straddleStrike, volatility, 'CALL', remaining), [currentPrice, straddleStrike, volatility, remaining]);
  const straddlePutPremium = useMemo(() => estimatePremium(currentPrice, straddleStrike, volatility, 'PUT', remaining), [currentPrice, straddleStrike, volatility, remaining]);

  const shareCost = shareQuantity * currentPrice;
  const callDebit = callPremium * contractQuantity;
  const putDebit = putPremium * contractQuantity;
  const callSpreadDebit = Math.max(0, (callPremium - callSpreadShortPremium) * contractQuantity);
  const callSpreadMaxProfit = Math.max(0, (shortCallStrike - longCallStrike) * contractQuantity - callSpreadDebit);
  const putSpreadDebit = Math.max(0, (putPremium - putSpreadShortPremium) * contractQuantity);
  const putSpreadMaxProfit = Math.max(0, (longPutStrike - shortPutStrike) * contractQuantity - putSpreadDebit);
  const straddleDebit = (straddleCallPremium + straddlePutPremium) * contractQuantity;

  const openCallSpread = () => dispatch({
    type: 'OPEN_STRATEGY',
    input: {
      strategyType: 'CALL_SPREAD',
      expiresDay: safeExpiry,
      legs: [
        { symbol, type: 'CALL', side: 'LONG', strike: longCallStrike, premium: callPremium, quantity: contractQuantity },
        { symbol, type: 'CALL', side: 'SHORT', strike: shortCallStrike, premium: callSpreadShortPremium, quantity: contractQuantity }
      ]
    }
  });

  const openPutSpread = () => dispatch({
    type: 'OPEN_STRATEGY',
    input: {
      strategyType: 'PUT_SPREAD',
      expiresDay: safeExpiry,
      legs: [
        { symbol, type: 'PUT', side: 'LONG', strike: longPutStrike, premium: putPremium, quantity: contractQuantity },
        { symbol, type: 'PUT', side: 'SHORT', strike: shortPutStrike, premium: putSpreadShortPremium, quantity: contractQuantity }
      ]
    }
  });

  const openStraddle = () => dispatch({
    type: 'OPEN_STRATEGY',
    input: {
      strategyType: 'STRADDLE',
      expiresDay: safeExpiry,
      legs: [
        { symbol, type: 'CALL', side: 'LONG', strike: straddleStrike, premium: straddleCallPremium, quantity: contractQuantity },
        { symbol, type: 'PUT', side: 'LONG', strike: straddleStrike, premium: straddlePutPremium, quantity: contractQuantity }
      ]
    }
  });

  return (
    <section className="trade-ticket" aria-label="Trade ticket">
      <div className="ticket-header">
        <div className="ticket-title">
          <h2>Trade Ticket</h2>
          <select
            aria-label="Strategy"
            className="strategy-inline"
            value={strategy}
            onChange={(event) => setStrategy(event.currentTarget.value as OptionStrategyType)}
          >
            {strategies.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <div className="dte-picker" role="radiogroup" aria-label="Expiry day">
            {expiryChoices.map((expiry) => (
              <button
                key={expiry}
                type="button"
                role="radio"
                aria-checked={expiry === safeExpiry}
                className={expiry === safeExpiry ? 'dte-option active' : 'dte-option'}
                onClick={() => setExpiresDay(expiry)}
              >
                {expiry}
              </button>
            ))}
          </div>
        </div>
        <div className="ticket-inputs">
          <label>
            Shares
            <input
              min="1"
              step="1"
              type="number"
              value={shareQuantity}
              onChange={(event) => setShareQuantity(clampNumber(event.currentTarget.value, 1, 999))}
            />
          </label>
          <label>
            Contracts
            <input
              min="1"
              max="10"
              step="1"
              type="number"
              value={contractQuantity}
              onChange={(event) => setContractQuantity(clampNumber(event.currentTarget.value, 1, 10))}
            />
          </label>
        </div>
      </div>

      <div className="ticket-metrics" aria-label="Ticket estimate">
        <span>Est. Share Cost <b>${shareCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></span>
        {strategy === 'SINGLE_CALL' || strategy === 'SINGLE_PUT' ? (
          <>
            <span>Call ${longCallStrike} <b>${callPremium.toFixed(2)}</b></span>
            <span>Put ${longPutStrike} <b>${putPremium.toFixed(2)}</b></span>
            <span>DTE <b>{remaining}d</b></span>
          </>
        ) : null}
        {strategy === 'CALL_SPREAD' ? (
          <>
            <span>Debit <b>${callSpreadDebit.toFixed(2)}</b></span>
            <span>Max Profit <b>${callSpreadMaxProfit.toFixed(2)}</b></span>
            <span>Strikes <b>${longCallStrike}/${shortCallStrike}</b></span>
            <span>DTE <b>{remaining}d</b></span>
          </>
        ) : null}
        {strategy === 'PUT_SPREAD' ? (
          <>
            <span>Debit <b>${putSpreadDebit.toFixed(2)}</b></span>
            <span>Max Profit <b>${putSpreadMaxProfit.toFixed(2)}</b></span>
            <span>Strikes <b>${shortPutStrike}/${longPutStrike}</b></span>
            <span>DTE <b>{remaining}d</b></span>
          </>
        ) : null}
        {strategy === 'STRADDLE' ? (
          <>
            <span>Debit <b>${straddleDebit.toFixed(2)}</b></span>
            <span>Break Even ±<b>${(straddleCallPremium + straddlePutPremium).toFixed(2)}</b></span>
            <span>Strike <b>${straddleStrike}</b></span>
            <span>DTE <b>{remaining}d</b></span>
          </>
        ) : null}
      </div>

      <div className="trade-grid">
        <button type="button" onClick={() => dispatch({ type: 'BUY_SHARES', symbol, quantity: shareQuantity, price: currentPrice })}>Buy {shareQuantity} Shares</button>
        <button type="button" onClick={() => dispatch({ type: 'SELL_SHARES', symbol, quantity: shareQuantity, price: currentPrice })}>Sell {shareQuantity} Shares</button>
        {strategy === 'SINGLE_CALL' || strategy === 'SINGLE_PUT' ? (
          <>
            <button type="button" onClick={() => dispatch({ type: 'BUY_CALL', symbol, strike: longCallStrike, quantity: contractQuantity, premium: callPremium, expiresDay: safeExpiry })}>Buy Call ${longCallStrike}</button>
            <button type="button" onClick={() => dispatch({ type: 'BUY_PUT', symbol, strike: longPutStrike, quantity: contractQuantity, premium: putPremium, expiresDay: safeExpiry })}>Buy Put ${longPutStrike}</button>
          </>
        ) : null}
        {strategy === 'CALL_SPREAD' ? (
          <button type="button" className="strategy-button" onClick={openCallSpread}>Open Call Spread ${longCallStrike}/${shortCallStrike}</button>
        ) : null}
        {strategy === 'PUT_SPREAD' ? (
          <button type="button" className="strategy-button" onClick={openPutSpread}>Open Put Spread ${shortPutStrike}/${longPutStrike}</button>
        ) : null}
        {strategy === 'STRADDLE' ? (
          <button type="button" className="strategy-button" onClick={openStraddle}>Open Straddle ${straddleStrike}</button>
        ) : null}
        <button type="button" onClick={() => dispatch({ type: 'CLOSE_OPTIONS', symbol, currentPrice, volatility })}>Close Options</button>
      </div>
    </section>
  );
}

function clampNumber(value: string, min: number, max: number) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

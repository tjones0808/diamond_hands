import { useMemo, useState } from 'react';
import type { GameAction } from '../game/reducer';
import type { OptionExpiryDay, OptionStrategyType, RestingOrderType, RunState, WeekDay } from '../game/types';
import { CONTRACT_SIZE, daysToExpiry, estimatePremium } from '../trading/options';
import { getMoodEffects } from '../career/mood';
import { getBuyingPower, getLeverageMultiplier } from '../trading/margin';
import { canUseLimitOrders, canUseStopLosses } from '../career/tierUnlocks';

interface TradeTicketProps {
  symbol: string;
  currentPrice: number;
  currentDay: WeekDay;
  volatility: number;
  run: RunState;
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

export function TradeTicket({ symbol, currentPrice, currentDay, volatility, run, dispatch }: TradeTicketProps) {
  const [shareQuantity, setShareQuantity] = useState(10);
  const [contractQuantity, setContractQuantity] = useState(1);
  const [strategy, setStrategy] = useState<OptionStrategyType>('SINGLE_CALL');
  const [orderType, setOrderType] = useState<RestingOrderType>('STOP_LOSS');
  const [triggerPrice, setTriggerPrice] = useState<string>('');
  const limitOrdersUnlocked = canUseLimitOrders(run.tier);
  const stopLossesUnlocked = canUseStopLosses(run.tier);
  const expiryChoices = availableExpiries(currentDay);
  const [expiresDay, setExpiresDay] = useState<OptionExpiryDay>(expiryChoices.at(-1) ?? 'FRI');
  const safeExpiry = expiryChoices.includes(expiresDay) ? expiresDay : expiryChoices.at(-1) ?? 'FRI';
  const remaining = daysToExpiry(currentDay, safeExpiry);
  const moodEffects = useMemo(() => getMoodEffects(run), [run.stress, run.confidence]);
  const moodPremiumMultiplier = moodEffects.premiumMultiplier;
  const buyingPower = getBuyingPower(run);
  const leverage = getLeverageMultiplier(run.tier);

  const longCallStrike = Math.max(1, Math.round(currentPrice * 1.05));
  const shortCallStrike = Math.max(longCallStrike + 1, Math.round(currentPrice * 1.12));
  const longPutStrike = Math.max(1, Math.round(currentPrice * 0.95));
  const shortPutStrike = Math.max(1, Math.min(longPutStrike - 1, Math.round(currentPrice * 0.88)));
  const straddleStrike = Math.max(1, Math.round(currentPrice));

  const callPremium = useMemo(() => roundCents(estimatePremium(currentPrice, longCallStrike, volatility, 'CALL', remaining) * moodPremiumMultiplier), [currentPrice, longCallStrike, volatility, remaining, moodPremiumMultiplier]);
  const putPremium = useMemo(() => roundCents(estimatePremium(currentPrice, longPutStrike, volatility, 'PUT', remaining) * moodPremiumMultiplier), [currentPrice, longPutStrike, volatility, remaining, moodPremiumMultiplier]);
  const callSpreadShortPremium = useMemo(() => roundCents(estimatePremium(currentPrice, shortCallStrike, volatility, 'CALL', remaining) * moodPremiumMultiplier), [currentPrice, shortCallStrike, volatility, remaining, moodPremiumMultiplier]);
  const putSpreadShortPremium = useMemo(() => roundCents(estimatePremium(currentPrice, shortPutStrike, volatility, 'PUT', remaining) * moodPremiumMultiplier), [currentPrice, shortPutStrike, volatility, remaining, moodPremiumMultiplier]);
  const straddleCallPremium = useMemo(() => roundCents(estimatePremium(currentPrice, straddleStrike, volatility, 'CALL', remaining) * moodPremiumMultiplier), [currentPrice, straddleStrike, volatility, remaining, moodPremiumMultiplier]);
  const straddlePutPremium = useMemo(() => roundCents(estimatePremium(currentPrice, straddleStrike, volatility, 'PUT', remaining) * moodPremiumMultiplier), [currentPrice, straddleStrike, volatility, remaining, moodPremiumMultiplier]);

  const shareCost = shareQuantity * currentPrice;
  const callDebit = callPremium * contractQuantity * CONTRACT_SIZE;
  const putDebit = putPremium * contractQuantity * CONTRACT_SIZE;
  const callSpreadDebit = Math.max(0, (callPremium - callSpreadShortPremium) * contractQuantity * CONTRACT_SIZE);
  const callSpreadMaxProfit = Math.max(0, (shortCallStrike - longCallStrike) * contractQuantity * CONTRACT_SIZE - callSpreadDebit);
  const putSpreadDebit = Math.max(0, (putPremium - putSpreadShortPremium) * contractQuantity * CONTRACT_SIZE);
  const putSpreadMaxProfit = Math.max(0, (longPutStrike - shortPutStrike) * contractQuantity * CONTRACT_SIZE - putSpreadDebit);
  const straddleDebit = (straddleCallPremium + straddlePutPremium) * contractQuantity * CONTRACT_SIZE;

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
        <span title="Buying power = available cash × tier leverage − margin used. Buying past your cash borrows on margin and accrues 0.1% daily interest.">
          Buying Power <b>${Math.round(buyingPower).toLocaleString()}</b>
        </span>
        {leverage > 1 ? (
          <span title="Your tier's leverage multiplier. Higher means more risk and more reward.">
            Leverage <b>{leverage}×</b>
          </span>
        ) : null}
        {run.marginUsed > 0 ? (
          <span title="Outstanding margin balance. Selling shares pays this down first.">
            Margin <b className="loss">${run.marginUsed.toFixed(2)}</b>
          </span>
        ) : null}
        <span>Est. Share Cost <b>${shareCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}</b></span>
        {strategy === 'SINGLE_CALL' || strategy === 'SINGLE_PUT' ? (
          <>
            <span title={`Per share premium × ${contractQuantity} contract${contractQuantity === 1 ? '' : 's'} × 100 shares/contract = $${callDebit.toFixed(2)} total debit.`}>
              Call ${longCallStrike} <b>${callPremium.toFixed(2)} / ${formatTotal(callDebit)}</b>
            </span>
            <span title={`Per share premium × ${contractQuantity} contract${contractQuantity === 1 ? '' : 's'} × 100 shares/contract = $${putDebit.toFixed(2)} total debit.`}>
              Put ${longPutStrike} <b>${putPremium.toFixed(2)} / ${formatTotal(putDebit)}</b>
            </span>
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

      <div className="resting-orders-form" aria-label="Resting orders">
        <label className="resting-type">
          Order
          <select
            value={orderType}
            onChange={(event) => setOrderType(event.currentTarget.value as RestingOrderType)}
          >
            <option value="STOP_LOSS" disabled={!stopLossesUnlocked}>
              Stop Loss{stopLossesUnlocked ? '' : ' · Fund Manager'}
            </option>
            <option value="LIMIT_BUY" disabled={!limitOrdersUnlocked}>
              Limit Buy{limitOrdersUnlocked ? '' : ' · Stock Broker'}
            </option>
            <option value="LIMIT_SELL" disabled={!limitOrdersUnlocked}>
              Limit Sell{limitOrdersUnlocked ? '' : ' · Stock Broker'}
            </option>
          </select>
        </label>
        <label className="resting-trigger">
          Trigger
          <input
            type="number"
            step="0.01"
            placeholder="$"
            value={triggerPrice}
            onChange={(event) => setTriggerPrice(event.currentTarget.value)}
          />
        </label>
        <button
          type="button"
          className="resting-submit"
          disabled={!isOrderAllowed(orderType, limitOrdersUnlocked, stopLossesUnlocked) || !triggerPrice}
          onClick={() => {
            const parsed = Number.parseFloat(triggerPrice);
            if (!Number.isFinite(parsed) || parsed <= 0) return;
            dispatch({
              type: 'CREATE_RESTING_ORDER',
              orderType,
              symbol,
              quantity: shareQuantity,
              triggerPrice: parsed
            });
            setTriggerPrice('');
          }}
        >
          Set {orderType.replaceAll('_', ' ')}
        </button>
      </div>
    </section>
  );
}

function isOrderAllowed(type: RestingOrderType, limitOk: boolean, stopOk: boolean) {
  if (type === 'STOP_LOSS') return stopOk;
  return limitOk;
}

function roundCents(value: number) {
  return Math.round(value * 100) / 100;
}

function formatTotal(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function clampNumber(value: string, min: number, max: number) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return min;
  return Math.min(max, Math.max(min, parsed));
}

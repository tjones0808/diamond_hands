import { useState } from 'react';
import type { GameAction } from '../game/reducer';

interface TradeTicketProps {
  symbol: string;
  currentPrice: number;
  callStrike: number;
  putStrike: number;
  callPremium: number;
  putPremium: number;
  volatility: number;
  dispatch: (action: GameAction) => void;
}

export function TradeTicket({ symbol, currentPrice, callStrike, putStrike, callPremium, putPremium, volatility, dispatch }: TradeTicketProps) {
  const [shareQuantity, setShareQuantity] = useState(10);
  const [contractQuantity, setContractQuantity] = useState(1);
  const shareCost = shareQuantity * currentPrice;
  const optionRisk = Math.max(callPremium, putPremium) * contractQuantity;

  return (
    <section className="trade-ticket" aria-label="Trade ticket">
      <div className="ticket-header">
        <div>
          <h2>Trade Ticket</h2>
          <p>{symbol} thesis, size, execute.</p>
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
        <span>Max Option Risk <b>${optionRisk.toFixed(2)}</b></span>
        <span>Call ${callStrike} <b>${callPremium.toFixed(2)}</b></span>
        <span>Put ${putStrike} <b>${putPremium.toFixed(2)}</b></span>
      </div>

      <div className="trade-grid">
        <button type="button" onClick={() => dispatch({ type: 'BUY_SHARES', symbol, quantity: shareQuantity, price: currentPrice })}>Buy {shareQuantity} Shares</button>
        <button type="button" onClick={() => dispatch({ type: 'SELL_SHARES', symbol, quantity: shareQuantity, price: currentPrice })}>Sell {shareQuantity} Shares</button>
        <button type="button" onClick={() => dispatch({ type: 'BUY_CALL', symbol, strike: callStrike, quantity: contractQuantity, premium: callPremium })}>Buy Call ${callStrike}</button>
        <button type="button" onClick={() => dispatch({ type: 'BUY_PUT', symbol, strike: putStrike, quantity: contractQuantity, premium: putPremium })}>Buy Put ${putStrike}</button>
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

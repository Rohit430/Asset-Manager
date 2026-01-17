import type { Asset, Transaction, FifoBatch, UserPreferences } from './types';

/**
 * Helper to determine Financial Year (India: Apr-Mar)
 * Can be adapted for other regions later.
 */
export function getFinancialYear(dateStr: string): string {
  const date = new Date(dateStr);
  const month = date.getMonth(); // 0-11
  const year = date.getFullYear();
  
  if (month >= 3) { // April onwards
    return `FY${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `FY${year - 1}-${year.toString().slice(-2)}`;
  }
}

/**
 * Reconstructs the current state of an asset (Qty, Cost, Queue) 
 * by replaying its entire transaction history.
 */
export function rebuildAssetMetrics(
  asset: Asset, 
  transactions: Transaction[]
): Asset {
  const sortedTxs = [...transactions].sort((a, b) => 
    new Date(a.tx_date).getTime() - new Date(b.tx_date).getTime()
  );

  let totalQuantity = 0;
  let fifoQueue: FifoBatch[] = [];
  let realizedPL = 0;

  for (const tx of sortedTxs) {
    const { quantity, price, miscCosts, profit } = tx.data;

    if (tx.type === 'Buy') {
      totalQuantity += quantity;
      const effectivePrice = ((quantity * price) + (miscCosts || 0)) / quantity;
      
      fifoQueue.push({
        qty: quantity,
        price: effectivePrice,
        date: tx.tx_date
      });
    } else if (tx.type === 'Sell') {
      let sellQty = quantity;
      const tempQueue = [...fifoQueue]; 
      
      while (sellQty > 0.00001 && tempQueue.length > 0) {
        const buyBatch = tempQueue.shift();
        if (!buyBatch) break;

        if (buyBatch.qty <= sellQty) {
          sellQty -= buyBatch.qty;
        } else {
          buyBatch.qty -= sellQty;
          tempQueue.unshift(buyBatch); 
          sellQty = 0;
        }
      }
      
      fifoQueue = tempQueue;
      totalQuantity -= quantity;
      if (profit !== undefined) {
        realizedPL += profit;
      }
    }
  }

  const totalCost = fifoQueue.reduce((acc, batch) => acc + (batch.qty * batch.price), 0);

  return {
    ...asset,
    totalQuantity,
    totalCost,
    avgBuyPrice: totalQuantity > 0 ? totalCost / totalQuantity : 0,
    fifoQueue,
    realizedPL
  };
}

/**
 * Pre-calculates the outcome of a SELL transaction (Preview).
 */
export interface SellPreview {
  grossProfit: number;
  taxAmount: number;
  brokerFee: number;
  netProfit: number;
  holdingPeriod: number; // Avg days
  termType: 'Short Term' | 'Long Term';
  taxPercent: number;
}

export function calculateSellPreview(
  asset: Asset,
  sellQty: number,
  sellPrice: number,
  miscCosts: number,
  sellDateStr: string,
  prefs: UserPreferences
): SellPreview {
  
  if (sellQty > asset.totalQuantity) {
    throw new Error(`Insufficient quantity. You own ${asset.totalQuantity}, tried to sell ${sellQty}.`);
  }

  const fifoQueue = JSON.parse(JSON.stringify(asset.fifoQueue));
  
  let remainingSellQty = sellQty;
  let totalCostOfSoldAssets = 0;
  let weightedHoldingDays = 0;
  
  const sellDate = new Date(sellDateStr);

  while (remainingSellQty > 0 && fifoQueue.length > 0) {
    const buyBatch = fifoQueue.shift();
    const buyDate = new Date(buyBatch.date);
    let holdingDays = (sellDate.getTime() - buyDate.getTime()) / (1000 * 60 * 60 * 24);
    if (holdingDays < 0) holdingDays = 0;

    let consumedQty = 0;

    if (buyBatch.qty <= remainingSellQty) {
      consumedQty = buyBatch.qty;
      remainingSellQty -= buyBatch.qty;
    } else {
      consumedQty = remainingSellQty;
      remainingSellQty = 0;
    }

    totalCostOfSoldAssets += (consumedQty * buyBatch.price);
    weightedHoldingDays += (holdingDays * consumedQty);
  }

  const totalRevenue = sellQty * sellPrice;
  const grossProfit = totalRevenue - totalCostOfSoldAssets - miscCosts;
  const avgHoldingDays = sellQty > 0 ? weightedHoldingDays / sellQty : 0;

  const country = asset.country.toLowerCase() as 'india' | 'us';
  const taxSettings = prefs.taxSettings[country];
  
  let termType: 'Short Term' | 'Long Term' = 'Long Term';
  let taxPercent = taxSettings.longTermTax;

  if (avgHoldingDays <= taxSettings.shortTermDays) {
    termType = 'Short Term';
    taxPercent = taxSettings.shortTermTax;
  }

  let taxAmount = 0;
  if (grossProfit > 0) {
    taxAmount = grossProfit * (taxPercent / 100);
  }

  let brokerFee = 0;
  if (grossProfit > 0) {
    brokerFee = grossProfit * (prefs.feeSettings.brokerFeePercent / 100);
  }

  return {
    grossProfit,
    taxAmount,
    brokerFee,
    netProfit: grossProfit - taxAmount - brokerFee,
    holdingPeriod: Math.round(avgHoldingDays),
    termType,
    taxPercent
  };
}
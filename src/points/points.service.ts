import { Injectable, BadRequestException } from '@nestjs/common';
import { Transaction } from './interfaces/transaction.interface';
import { SpendResult } from './interfaces/spend-result.interface';
import { TransactionDto } from './dto/transaction.dto';

/**
 * Points Service
 * Contains all business logic for managing points transactions
 * 
 * The @Injectable decorator marks this class as a provider that can be
 * injected into other classes (like PointsController)
 */
@Injectable()
export class PointsService {
  // In-memory storage for transactions (data lost on restart)
  // In production, this would be replaced with a database
  private transactions: Transaction[] = [];

  /**
   * Add a new transaction
   */
  addTransaction(transactionDto: TransactionDto): Transaction {
    const transaction: Transaction = {
      payer: transactionDto.payer,
      points: transactionDto.points,
      timestamp: new Date(transactionDto.timestamp),
    };

    this.transactions.push(transaction);
    return transaction;
  }

  /**
   * Spend points following the rules:
   * 1. Oldest points (by transaction date) are spent first
   * 2. No payer's points can go below zero
   * 
   * Algorithm:
   * - Sort all transactions by timestamp (oldest first)
   * - Process each transaction chronologically
   * - For positive transactions: spend available points
   * - For negative transactions: adjust previous spending (like a refund)
   * - Ensure no payer's balance goes negative
   * - Record spending as new negative transactions
   */
  spendPoints(pointsToSpend: number): SpendResult[] {
    // Validation: ensure positive amount
    if (pointsToSpend < 0) {
      throw new BadRequestException('Points to spend must be positive');
    }

    // Validation: check if we have enough total points
    const totalPoints = this.getTotalPoints();
    if (totalPoints < pointsToSpend) {
      throw new BadRequestException(
        `Insufficient points. Available: ${totalPoints}, Requested: ${pointsToSpend}`,
      );
    }

    // Step 1: Sort transactions by timestamp (oldest first)
    // Using spread operator [...] to create a copy and not mutate original array
    const sortedTransactions = [...this.transactions].sort(
      (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
    );

    // Step 2: Track how much we're spending from each payer using a Map
    const spendingByPayer: Map<string, number> = new Map();

    let remainingToSpend = pointsToSpend;

    // Step 3: Process transactions in chronological order
    for (const transaction of sortedTransactions) {
      if (remainingToSpend <= 0) {
        break; // We've spent all required points
      }

      const payer = transaction.payer;
      const transactionPoints = transaction.points;

      // Get this payer's total current balance across all their transactions
      const currentPayerBalance = this.getPayerBalance(payer);
      // Get how much we've already decided to spend from this payer
      const currentSpending = spendingByPayer.get(payer) || 0;

      if (transactionPoints > 0) {
        // Positive transaction: try to spend from it
        const availableFromTransaction = Math.min(
          transactionPoints,
          remainingToSpend,
        );

        // Check if spending this amount would make payer balance negative
        const newPayerBalance = currentPayerBalance - currentSpending - availableFromTransaction;

        if (newPayerBalance >= 0) {
          // Safe to spend
          const amountToSpend = availableFromTransaction;
          spendingByPayer.set(payer, currentSpending + amountToSpend);
          remainingToSpend -= amountToSpend;
        } else {
          // Can only spend up to the point where payer balance reaches 0
          const maxCanSpend = currentPayerBalance - currentSpending;
          if (maxCanSpend > 0) {
            spendingByPayer.set(payer, currentSpending + maxCanSpend);
            remainingToSpend -= maxCanSpend;
          }
        }
      } else {
        // Negative transaction: this reduces the payer's available balance
        // We need to "give back" points if we've already spent from this payer
        const pointsToGiveBack = Math.min(
          Math.abs(transactionPoints),
          currentSpending,
        );

        if (pointsToGiveBack > 0) {
          spendingByPayer.set(payer, currentSpending - pointsToGiveBack);
          remainingToSpend += pointsToGiveBack;
        }
      }
    }

    // Step 4: Convert spending map to result array
    // Points are negative to indicate they were spent (deducted)
    const result: SpendResult[] = [];
    spendingByPayer.forEach((points, payer) => {
      if (points > 0) {
        result.push({ payer, points: -points }); // Negative because points were spent
      }
    });

    // Step 5: Record these spending transactions in our transaction history
    // This ensures future balance calculations include this spending
    const now = new Date();
    result.forEach((spend) => {
      this.transactions.push({
        payer: spend.payer,
        points: spend.points, // Already negative
        timestamp: now,
      });
    });

    return result;
  }

  /**
   * Get balances for all payers
   */
  getBalances(): Record<string, number> {
    const balances: Record<string, number> = {};

    for (const transaction of this.transactions) {
      const payer = transaction.payer;
      balances[payer] = (balances[payer] || 0) + transaction.points;
    }

    return balances;
  }

  /**
   * Get balance for a specific payer
   */
  private getPayerBalance(payer: string): number {
    return this.transactions
      .filter((t) => t.payer === payer)
      .reduce((sum, t) => sum + t.points, 0);
  }

  /**
   * Get total points across all payers
   */
  private getTotalPoints(): number {
    return this.transactions.reduce((sum, t) => sum + t.points, 0);
  }
}


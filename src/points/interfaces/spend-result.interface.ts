/**
 * Spend Result Interface
 * Represents the result of a spend operation
 * Shows which payer's points were spent and how many
 */
export interface SpendResult {
  payer: string;   // Name of the payer
  points: number;  // Number of points spent (negative value)
}


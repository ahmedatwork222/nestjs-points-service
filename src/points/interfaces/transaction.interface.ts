/**
 * Transaction Interface
 * Represents a transaction record stored internally
 * Note: timestamp is a Date object here (converted from string in DTO)
 */
export interface Transaction {
  payer: string;      // Name of the payer
  points: number;     // Number of points (positive or negative)
  timestamp: Date;    // Date object for sorting and comparisons
}


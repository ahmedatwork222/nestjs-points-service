/**
 * Data Transfer Object (DTO) for Transaction
 * Defines the structure of data coming from HTTP requests
 * Used for type safety and validation
 */
export class TransactionDto {
  payer: string;      // Name of the payer (e.g., "SHOPIFY", "AMAZON")
  points: number;     // Number of points (can be negative for refunds)
  timestamp: string;  // ISO 8601 date string (e.g., "2024-07-02T14:00:00Z")
}


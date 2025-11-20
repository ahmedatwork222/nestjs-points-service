# Points Service

A NestJS service for managing user points with per-payer transaction tracking.

## Prerequisites

You'll need Node.js and npm installed. If you don't have them:

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nodejs npm

# macOS
brew install node

# Verify installation
node --version
npm --version
```

## Setup and Running

1. Install dependencies:
```bash
npm install
```

2. Start the application:
```bash
npm run start:dev
```

The server will start on `http://localhost:3000`.

## API Endpoints

### Add Transaction
```bash
POST /points/add
Content-Type: application/json

{
  "payer": "SHOPIFY",
  "points": 1000,
  "timestamp": "2024-07-02T14:00:00Z"
}
```

### Spend Points
```bash
POST /points/spend
Content-Type: application/json

{
  "points": 5000
}
```

Returns a list of payers and points spent from each.

### Get Balances
```bash
GET /points/balance
```

Returns current point balances for all payers.

## Example Usage

Add some transactions:
```bash
curl -X POST http://localhost:3000/points/add \
  -H "Content-Type: application/json" \
  -d '{"payer": "SHOPIFY", "points": 1000, "timestamp": "2024-07-02T14:00:00Z"}'

curl -X POST http://localhost:3000/points/add \
  -H "Content-Type: application/json" \
  -d '{"payer": "EBAY", "points": 200, "timestamp": "2024-06-30T11:00:00Z"}'

curl -X POST http://localhost:3000/points/add \
  -H "Content-Type: application/json" \
  -d '{"payer": "SHOPIFY", "points": -200, "timestamp": "2024-06-30T15:00:00Z"}'

curl -X POST http://localhost:3000/points/add \
  -H "Content-Type: application/json" \
  -d '{"payer": "AMAZON", "points": 10000, "timestamp": "2024-07-01T14:00:00Z"}'

curl -X POST http://localhost:3000/points/add \
  -H "Content-Type: application/json" \
  -d '{"payer": "SHOPIFY", "points": 300, "timestamp": "2024-06-30T10:00:00Z"}'
```

Spend points:
```bash
curl -X POST http://localhost:3000/points/spend \
  -H "Content-Type: application/json" \
  -d '{"points": 5000}'
```

Expected response:
```json
[
  { "payer": "SHOPIFY", "points": -100 },
  { "payer": "EBAY", "points": -200 },
  { "payer": "AMAZON", "points": -4700 }
]
```

Check balances:
```bash
curl http://localhost:3000/points/balance
```

Expected response:
```json
{
  "SHOPIFY": 1000,
  "EBAY": 0,
  "AMAZON": 5300
}
```

## Implementation Notes

- Transactions are stored in memory and will be lost when the app restarts
- Points are spent oldest-first based on transaction timestamp
- The spend algorithm ensures no payer's balance goes negative
- Negative point transactions (like refunds) are supported

## Architecture

This application follows NestJS's modular architecture with separation of concerns:

### Module Structure
- **Root Module** (`src/app.module.ts`) - Entry point that imports all feature modules
- **Feature Module** (`src/points/points.module.ts`) - Encapsulates points functionality, registers controllers and services

### Controller Layer (HTTP Request Handling)
- **File**: `src/points/points.controller.ts`
- **Responsibility**: Handle HTTP requests and responses
- **Endpoints**:
  - `POST /points/add` - Add transaction
  - `POST /points/spend` - Spend points
  - `GET /points/balance` - Get balances

### Service Layer (Business Logic)
- **File**: `src/points/points.service.ts`
- **Responsibility**: Core business logic for points management
- **Key Methods**:
  - `addTransaction()` - Store a new transaction
  - `spendPoints()` - Execute spending algorithm (oldest-first, no-negative rule)
  - `getBalances()` - Calculate current balances per payer

### Data Transfer Objects (DTOs)
- **Purpose**: Define structure of incoming HTTP requests for type safety
- `src/points/dto/transaction.dto.ts` - Add transaction request
- `src/points/dto/spend.dto.ts` - Spend points request

### Interfaces
- **Purpose**: Define internal data structures
- `src/points/interfaces/transaction.interface.ts` - Internal transaction type
- `src/points/interfaces/spend-result.interface.ts` - Spend response type

### Dependency Injection
- Services are registered as providers in `src/points/points.module.ts`
- The controller receives the service via constructor injection
- NestJS handles the lifecycle and instantiation automatically

### Request Flow
```
Client Request
    ↓
main.ts (bootstrap application)
    ↓
app.module.ts (load PointsModule)
    ↓
points.module.ts (register Controller & Service)
    ↓
points.controller.ts (receive HTTP request, validate with DTO)
    ↓
points.service.ts (execute business logic)
    ↓
Return response (typed with Interface)
```

## Project Structure

```
src/
├── points/
│   ├── dto/                      # Data transfer objects
│   ├── interfaces/               # TypeScript interfaces
│   ├── points.controller.ts      # HTTP endpoints
│   ├── points.service.ts         # Business logic
│   └── points.module.ts
├── app.module.ts
└── main.ts
```

import { Controller, Get, Post, Body, HttpCode } from '@nestjs/common';
import { PointsService } from './points.service';
import { TransactionDto } from './dto/transaction.dto';
import { SpendDto } from './dto/spend.dto';
import { Transaction } from './interfaces/transaction.interface';
import { SpendResult } from './interfaces/spend-result.interface';

/**
 * Points Controller
 * Handles HTTP requests for the /points routes
 * 
 * The @Controller decorator defines this class as a controller
 * and sets the base route path to 'points'
 */
@Controller('points')
export class PointsController {
  /**
   * Constructor-based Dependency Injection
   * NestJS automatically injects PointsService when creating this controller
   * 'readonly' ensures the service cannot be reassigned
   */
  constructor(private readonly pointsService: PointsService) {}

  /**
   * POST /points/add
   * Add a new transaction for a specific payer and date
   */
  @Post('add')
  @HttpCode(200)
  addTransaction(@Body() transactionDto: TransactionDto): Transaction {
    return this.pointsService.addTransaction(transactionDto);
  }

  /**
   * POST /points/spend
   * Spend points using the oldest-first rule
   * Returns list of payers and points spent from each
   */
  @Post('spend')
  @HttpCode(200)
  spendPoints(@Body() spendDto: SpendDto): SpendResult[] {
    return this.pointsService.spendPoints(spendDto.points);
  }

  /**
   * GET /points/balance
   * Get balances for all payers
   */
  @Get('balance')
  getBalances(): Record<string, number> {
    return this.pointsService.getBalances();
  }
}


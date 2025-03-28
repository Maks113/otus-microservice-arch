import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PinoLogger } from 'nestjs-pino';
import { AccountService } from '../modules/billing/account.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(
    private readonly logger: PinoLogger,
    private readonly usersService: AccountService,
  ) {}

  async use(req: Request, _: Response, next: NextFunction) {

    const email = req.headers['x-auth-email'].toString();
    const firstName = req.headers['x-auth-email'].toString();
    const lastName = req.headers['x-auth-email'].toString();
    const username = req.headers['x-auth-email'].toString();
    this.logger.info({
      message: 'AuthMiddleware',
      headers: { email, firstName, lastName, username },
    });

    if (!(email && firstName && lastName && username)) {
      this.logger.info({
        message: 'AuthMiddleware skip user add',
      });
      return next()
    }

    const user = await this.usersService.getOrCreateUser({ email, firstName, lastName, username });
    (req as any).user = user;

    next();
  }
}
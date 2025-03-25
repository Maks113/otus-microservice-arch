import { Controller, Get, Res } from '@nestjs/common';
import { Response } from 'express';
import { PinoLogger } from 'nestjs-pino';

@Controller('healthcheck')
export class HealthcheckController {
  constructor(private readonly logger: PinoLogger) {
    this.logger.setContext(HealthcheckController.name);
  }

  @Get('')
  async ping(@Res() res: Response): Promise<void> {
    res.status(200).send('success');
  }
}

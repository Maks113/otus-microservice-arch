import { Controller, Get } from '@nestjs/common';
import { PinoLogger } from 'nestjs-pino';
import { RestService } from './rest.service';

@Controller()
export class RestController {
  constructor(
    private readonly appService: RestService,
    private readonly logger: PinoLogger,
  ) {
    this.logger.setContext(RestController.name);
  }

  @Get('hello')
  getHello(): string {
    this.logger.info('Hello log');
    return this.appService.getHello();
  }

  @Get('bye')
  getBye(): string {
    return this.appService.getBye();
  }
}

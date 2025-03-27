import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { Params as PinoParams } from 'nestjs-pino/params';

const config: PinoParams = {
  pinoHttp: {
    serializers: {
      req: (req) => ({
        id: req.id,
        method: req.method,
        url: req.url
      }),
      res: (res) => ({
        statusCode: res.statusCode,
      })
    }
  },
  exclude: ['/metrics', '/healthcheck'],
}

@Module({
  imports: [
    LoggerModule.forRoot(config),
  ],
})
export class PinoLoggerModule {}

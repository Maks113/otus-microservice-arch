import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { IncomingMessage } from 'http';
import { Counter, Histogram } from 'prom-client';
import { Observable, tap } from 'rxjs';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric("latency_histogram") public latencyHistogram: Histogram<string>,
    @InjectMetric("request_count") public rpsCounter: Counter<string>,
    @InjectMetric("error_count") public errorRateCounter: Counter<string>,
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<unknown> | Promise<Observable<unknown>> {
    const req: IncomingMessage = context.switchToHttp().getRequest();
    if (req.url.includes('metrics') || req.url.includes('healthcheck')) return next.handle();

    const stopTimer = this.latencyHistogram.startTimer();
    this.rpsCounter.inc();

    return next
      .handle()
      .pipe(
        tap((response: Response) => {
          stopTimer();
          if (response?.status >= 500) this.errorRateCounter.inc();
        }),
    );
  }
}

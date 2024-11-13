import { Injectable } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter } from 'prom-client';

@Injectable()
export class RestService {
  constructor(
    @InjectMetric("hello_counter") public helloCounter: Counter<string>,
    @InjectMetric("bye_counter") public byeCounter: Counter<string>,
  ) {}
  getHello(): string {
    this.helloCounter.inc(1);
    return 'Hello, World!';
  }

  getBye(): string {
    this.byeCounter.inc(1);
    return 'Bye, World!';
  }
}

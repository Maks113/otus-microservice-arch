import { registerAs } from '@nestjs/config';
import { throwError } from '../../common/throwError';
export default registerAs('kafka', () => ({
  brokers: process.env.KAFKA_BROKERS_CSV
    ?.split(',')
    .map(b => b.trim())
    ?? throwError('Environment variable KAFKA_BROKERS_CSV is required'),
}));
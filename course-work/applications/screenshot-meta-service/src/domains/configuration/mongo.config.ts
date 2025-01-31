import { registerAs } from '@nestjs/config';
import { throwError } from '../../common/throwError';


export default registerAs('mongo', () => ({
  host: process.env.MONGO_HOST ?? throwError('Environment variable MONGO_HOST is required'),
  port: parseInt(process.env.MONGO_PORT ?? '', 10) ?? 27017,
  username: process.env.MONGO_USER ?? null,
  password: process.env.MONGO_PASSWORD ?? null,
  dbName: process.env.MONGO_DB_NAME ?? 'screenshot-requests-service',
}));
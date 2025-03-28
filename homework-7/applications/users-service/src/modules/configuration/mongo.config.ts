import { registerAs } from '@nestjs/config';

const throwError = (message: string): never => {
  throw new Error(message);
}

export default registerAs('mongo', () => ({
  host: process.env.MONGO_HOST ?? throwError('Environment variable MONGO_HOST is required'),
  port: parseInt(process.env.MONGO_PORT, 10) ?? 27017,
  username: process.env.MONGO_USER ?? null,
  password: process.env.MONGO_PASSWORD ?? null,
}));
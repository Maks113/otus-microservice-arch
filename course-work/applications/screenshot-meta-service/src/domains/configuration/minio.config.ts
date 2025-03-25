import { registerAs } from '@nestjs/config';
import { throwError } from '../../common/throwError';

export default registerAs('minio', () => ({
  endpoint: process.env.MINIO_ENDPOINT
    ?? throwError('Environment variable MINIO_ENDPOINT is required'),
  port: parseInt(process.env.MINIO_PORT ?? '', 10) ?? 9000,
  accessKey: process.env.MINIO_ACCESS_KEY
    ?? throwError('Environment variable MINIO_ACCESS_KEY is required'),
  secretKey: process.env.MINIO_SECRET_KEY
    ?? throwError('Environment variable MINIO_SECRET_KEY is required'),
  bucket: process.env.MINIO_BUCKET
    ?? throwError('Environment variable MINIO_BUCKET is required'),
}));
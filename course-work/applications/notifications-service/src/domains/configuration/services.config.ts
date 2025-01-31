import { registerAs } from '@nestjs/config';
import { throwError } from '../../common/throwError';


export default registerAs('services', () => ({
  notifications: {
    groupId: process.env.NOTIFICATION_SERVICE_GROUP_ID
      ?? throwError('Environment variable NOTIFICATION_SERVICE_GROUP_ID is required')
  },
  consumer: {
    groupId: process.env.CONSUMER_SERVICE_GROUP_ID
      ?? throwError('Environment variable CONSUMER_SERVICE_GROUP_ID is required')
  },
  pageCapture: {
    groupId: process.env.PAGE_CAPTURE_SERVICE_GROUP_ID
      ?? throwError('Environment variable PAGE_CAPTURE_SERVICE_GROUP_ID is required')
  },
  screenshotMeta: {
    groupId: process.env.SCREENSHOT_META_SERVICE_GROUP_ID
      ?? throwError('Environment variable SCREENSHOT_META_SERVICE_GROUP_ID is required')
  },
  screenshotRequests: {
    groupId: process.env.SCREENSHOT_REQUEST_SERVICE_GROUP_ID
      ?? throwError('Environment variable SCREENSHOT_REQUEST_SERVICE_GROUP_ID is required')
  },
}));
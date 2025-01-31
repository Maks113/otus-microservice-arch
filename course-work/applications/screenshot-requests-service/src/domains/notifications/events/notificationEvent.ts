import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { v4 } from 'uuid';

export class NotificationEvent {
  @IsNotEmpty()
  @IsString()
  payloadId: string;

  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsString()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  timestamp: string;

  constructor(
    payloadId: string,
    to: string,
    title: string,
    message: string,
  ) {
    this.payloadId = payloadId;
    this.to = to;
    this.title = title;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

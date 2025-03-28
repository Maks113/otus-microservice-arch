import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { v4 } from 'uuid';

export class NotificationEvent {
  @IsNotEmpty()
  @IsString()
  eventId: string;

  @IsNotEmpty()
  @IsEmail()
  to: string;

  @IsString()
  subject: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  timestamp: string;

  constructor(
     to: string,
     subject: string,
     message: string,
  ) {
    this.eventId = v4();
    this.to = to;
    this.subject = subject;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

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
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  timestamp: string;

  constructor(
     to: string,
     title: string,
     message: string,
  ) {
    this.eventId = v4();
    this.to = to;
    this.title = title;
    this.message = message;
    this.timestamp = new Date().toISOString();
  }
}

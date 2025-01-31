import { ApiProperty } from '@nestjs/swagger';

export class ScreenshotMetaReadDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userEmail: string;

  @ApiProperty()
  link: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  error?: string;
}

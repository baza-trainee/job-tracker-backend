import { ApiProperty } from '@nestjs/swagger';

export class IUser {
  @ApiProperty()
  id: string;
  @ApiProperty()
  username: string;
  @ApiProperty()
  email: string;
  @ApiProperty()
  avatar?: string;
  @ApiProperty()
  access_token: string;
}

export class NotFoundResponse {
  @ApiProperty({ default: 404 })
  status_code: number;
  @ApiProperty()
  message: string;
}


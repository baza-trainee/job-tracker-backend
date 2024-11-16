import { ApiProperty } from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';

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
  @ApiProperty()
  refresh_token: string;
}

export class NotFoundResponse {
  @ApiProperty({ default: 404 })
  status_code: number;
  @ApiProperty()
  message: string;
}

export interface JwtPayload {
  id: string;
  email: string;
  refresh_token: string;
}

export class AuthResponse {
  @ApiProperty()
  access_token: string;
  @ApiProperty()
  refresh_token: string;
}

export class LogoutResponse {
  @ApiProperty({ default: 200 })
  status_code: number;
  @ApiProperty()
  message: string;
}

export class MessageResponse {
  @ApiProperty()
  message: string;
}

export class RefreshTokenResponse {
  @ApiProperty()
  access_token: string;
}

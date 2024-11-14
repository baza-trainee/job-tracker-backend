import { ApiProperty } from '@nestjs/swagger';
import { MinLength, IsString } from 'class-validator';

export class ChangePasswordDto {

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Password must be minimum 6 symbols' })
  previous_password: string;

  @ApiProperty()
  @IsString()
  @MinLength(6, { message: 'Password must be minimum 6 symbols' })
  new_password: string;
}
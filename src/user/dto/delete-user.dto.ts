import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class DeleteUserDto {
  @ApiProperty({
    description: 'User password for confirmation',
    example: 'yourPassword123',
  })
  @IsString()
  @IsNotEmpty()
  password: string;
}

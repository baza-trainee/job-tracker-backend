import { ApiProperty } from '@nestjs/swagger';
import { MinLength, IsString } from 'class-validator';

export class ResetPasswordDto {

    @ApiProperty()
    @MinLength(6, { message: 'Password must be minimum 6 symbols' })
    password: string;

    @ApiProperty()
    @IsString()
    token: string;
}
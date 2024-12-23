import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @MinLength(6, { message: 'Password must be minimum 6 symbols' })
    password: string;
}

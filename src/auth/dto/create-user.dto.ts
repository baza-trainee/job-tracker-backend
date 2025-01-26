import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, IsString, IsOptional, Matches, IsUrl } from 'class-validator';

export class CreateUserDto {
    @ApiProperty()
    @IsEmail()
    email: string;

    @ApiProperty()
    @MinLength(6, { message: 'Password must be minimum 6 symbols' })
    password: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl({}, { message: 'Invalid Telegram URL format' })
    @Matches(/^https:\/\/t\.me\/[a-zA-Z0-9_]{5,32}$/, {
        message: 'Telegram URL must be in format: https://t.me/username (username: 5-32 characters, only letters, numbers, and underscore)'
    })
    telegram?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl({}, { message: 'Invalid GitHub URL format' })
    @Matches(/^https:\/\/github\.com\/[a-zA-Z0-9-]+$/, {
        message: 'GitHub URL must be in format: https://github.com/username'
    })
    github?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl({}, { message: 'Invalid LinkedIn URL format' })
    @Matches(/^https:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/, {
        message: 'LinkedIn URL must be in format: https://linkedin.com/in/username'
    })
    linkedin?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsUrl({}, { message: 'Invalid Behance URL format' })
    @Matches(/^https:\/\/(?:www\.)?behance\.net\/[a-zA-Z0-9-]+\/?$/, {
        message: 'Behance URL must be in format: https://behance.net/username'
    })
    behance?: string;
}

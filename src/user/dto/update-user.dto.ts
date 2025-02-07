import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsOptional, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SocialMediaDto } from './social-media.dto';

export class UpdateUserDto {
    @ApiProperty({ required: false })
    @IsOptional()
    @IsEmail()
    email?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    username?: string;

    @ApiProperty({ required: false })
    @IsOptional()
    @IsString()
    @Matches(/^$|^\+?[1-9]\d{1,14}$/, { message: 'Invalid phone number format' })
    phone?: string;

    @ApiProperty({ 
        required: false,
        type: [SocialMediaDto],
        description: 'Array of social media links'
    })
    @IsOptional()
    @ValidateNested({ each: true })
    @Type(() => SocialMediaDto)
    socials?: SocialMediaDto[];
}

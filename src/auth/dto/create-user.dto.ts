import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MinLength, IsString, IsOptional, Matches, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { SocialMediaDto } from '../../user/dto/social-media.dto';

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

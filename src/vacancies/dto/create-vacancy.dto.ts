import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateVacancyDto {
  @ApiProperty({ description: 'Vacancy title' })
  @IsNotEmpty()
  @IsString()
  vacancy: string;

  @ApiProperty({ description: 'Company name' })
  @IsNotEmpty()
  @IsString()
  company: string;

  @ApiProperty({ description: 'Job location' })
  @IsNotEmpty()
  @IsString()
  location: string;

  @ApiProperty({ description: 'Application status' })
  @IsNotEmpty()
  @IsString()
  status: string;
}

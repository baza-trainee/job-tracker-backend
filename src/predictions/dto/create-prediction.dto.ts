import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePredictionDto {
  @ApiProperty({ description: 'Prediction text in Ukrainian' })
  @IsNotEmpty()
  @IsString()
  textUk: string;

  @ApiProperty({ description: 'Prediction text in English' })
  @IsNotEmpty()
  @IsString()
  textEn: string;
}

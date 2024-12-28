import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, ValidateIf } from 'class-validator';
import { CreatePredictionDto } from './create-prediction.dto';

export class UpdatePredictionDto extends PartialType(CreatePredictionDto) {
  @ApiProperty({ description: 'Prediction name', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.text)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsString()
  name?: string;

  @ApiProperty({ description: 'Prediction text', required: false })
  @IsOptional()
  @ValidateIf((o) => !o.name)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsString()
  text?: string;
}

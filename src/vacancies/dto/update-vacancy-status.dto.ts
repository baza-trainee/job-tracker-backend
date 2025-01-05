import { IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, ValidateIf, IsDateString } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { StatusName, RejectReason } from '../../vacancy-status/entities/vacancy-status.entity';

export class UpdateVacancyStatusDto {
  @ApiProperty({
    enum: StatusName,
    description: 'Status name. Special rules apply for REJECT and RESUME statuses',
    example: StatusName.HR
  })
  @IsOptional()
  @ValidateIf((o) => !o.rejectReason && !o.resumeId)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsEnum(StatusName)
  name?: StatusName;

  @ApiProperty({
    enum: RejectReason,
    description: 'Reason for rejection. Required and only allowed when status is "REJECT"',
    required: false,
    example: RejectReason.SOFT_SKILLS
  })
  @IsOptional()
  @ValidateIf((o) => !o.name && !o.resumeId)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsEnum(RejectReason, {
    message: `reject reason must be one of: ${Object.values(RejectReason).join(', ')}`
  })
  rejectReason?: RejectReason;

  @ApiProperty({
    description: 'ID of the resume. Required when status is "RESUME"',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsOptional()
  @ValidateIf((o) => !o.name && !o.rejectReason)
  @IsNotEmpty({ message: 'At least one field must be provided and not empty' })
  @IsUUID()
  resumeId?: string;

  @ApiProperty({
    description: 'Custom date for the status. If not provided, current date will be used. Accepts standard JavaScript date string formats',
    required: false,
    example: '2024-12-30'  // Simple date format example
  })
  @IsOptional()
  @IsDateString()  // More flexible than IsISO8601, accepts various date string formats
  date?: string;
}
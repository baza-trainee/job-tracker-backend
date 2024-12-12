import { IsEnum, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusName, RejectReason } from '../../vacancy-status/entities/vacancy-status.entity';

export class UpdateVacancyStatusDto {
  @ApiProperty({
    enum: StatusName,
    description: 'Status name. Special rules apply for REJECT and RESUME statuses',
    example: StatusName.HR
  })
  @IsEnum(StatusName)
  name: StatusName;

  @ApiProperty({
    enum: RejectReason,
    description: 'Reason for rejection. Required and only allowed when status is "REJECT"',
    required: false,
    example: RejectReason.SOFT_SKILLS
  })
  @IsEnum(RejectReason)
  @IsOptional()
  rejectReason?: RejectReason;

  @ApiProperty({
    description: 'URL to the resume. Required and only allowed when status is "RESUME"',
    required: false,
    example: 'https://example.com/my-resume.pdf'
  })
  @IsUrl()
  @IsOptional()
  resume?: string;

  @ApiProperty({
    description: 'Status ID (required only when updating existing status)',
    required: false,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  @IsOptional()
  statusId?: string;
}

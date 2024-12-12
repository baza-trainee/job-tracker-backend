import { IsEnum, IsOptional, IsString, IsUUID, IsUrl } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { StatusName, RejectReason } from '../../vacancy-status/entities/vacancy-status.entity';

export class UpdateVacancyStatusDto {
  @ApiProperty({
    enum: StatusName,
    description: 'Status name',
    example: StatusName.HR
  })
  @IsEnum(StatusName)
  name: StatusName;

  @ApiProperty({
    enum: RejectReason,
    description: 'Reason for rejection (required only when status is "reject")',
    required: false,
    example: RejectReason.SOFT_SKILLS
  })
  @IsEnum(RejectReason)
  @IsOptional()
  rejectReason?: RejectReason;

  @ApiProperty({
    description: 'Link to resume (required only when status is "resume")',
    required: false,
    example: 'https://drive.google.com/file/resume123'
  })
  @IsUrl({ protocols: ['http', 'https'], require_protocol: true })
  @IsString()
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

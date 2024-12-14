import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class AttachResumeDto {
  @ApiProperty({ description: 'Resume ID to attach' })
  @IsNotEmpty()
  @IsUUID()
  resumeId: string;
}

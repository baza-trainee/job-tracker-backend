import { PartialType } from '@nestjs/swagger';
import { CreateMailingDto } from './create-mailing.dto';

export class UpdateMailingDto extends PartialType(CreateMailingDto) {}

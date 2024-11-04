import { Module } from '@nestjs/common';
import { MailingService } from './mailing.service';
import { MailingController } from './mailing.controller';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [MailingController],
  providers: [MailingService, ConfigService],
})
export class MailingModule {}

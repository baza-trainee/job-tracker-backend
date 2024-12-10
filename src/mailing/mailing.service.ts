import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailerService } from '@nestjs-modules/mailer';

type MailOptions = {
  subject: string;
  email: string;
  name: string;
  link: string;
  template: string;
}

@Injectable()
export class MailingService {
  constructor(
    private readonly configService: ConfigService,
    private readonly mailerService: MailerService,
  ) { }

  async sendMail({ email, name, subject, template, link, }: MailOptions) {

    await this.mailerService.sendMail({
      to: email,
      subject,
      template,
      context: {
        name,
        link,
      },
    });
  }

}

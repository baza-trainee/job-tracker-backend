import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Password } from './entities/password.entity';
import { Repository } from 'typeorm';
import { MailerService } from '@nestjs-modules/mailer';
import { JwtService } from '@nestjs/jwt';
import { MailingService } from '../mailing/mailing.service';
import { UserService } from '../user/user.service';
import * as argon2 from 'argon2';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreatePasswordDto } from './dto/create-password.dto';

@Injectable()
export class PasswordService {
  constructor(
    @InjectRepository(Password)
    private readonly passwordRepository: Repository<Password>,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly mailingService: MailingService,
  ) {}

  async createRecord(createPasswordDto: CreatePasswordDto) {
    return await this.passwordRepository.save(createPasswordDto);
  }

  async sendMail(email: string) {
    const token = this.jwtService.sign({ email });

    await this.createRecord({
      email,
      token,
    });

    const url = `https://cows-shelter-frontend.vercel.app/reset/${token}`;

    await this.mailingService.setTransport();
    this.mailerService
      .sendMail({
        transporterName: 'gmail',
        to: email,
        from: 'zdravejuttya.com',
        subject: 'Reset your password',
        html: `Click <a href="${url}">here<a/> to reset your password`,
        context: {
          code: '38320',
        },
      })
      .then((success) => {
        console.log(success);
      })
      .catch((err) => {
        console.log(err);
      });

    return {
      message: 'Перевірте Електронну Пошту',
    };
  }

  async remove(id: number) {
    const user = await this.passwordRepository.findOne({
      where: { id },
    });
    if (!user)
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    await this.passwordRepository.delete(id);
    return { success: true };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const data: any = await this.passwordRepository.findOne({
      where: {
        token: resetPasswordDto.token,
      },
    });

    const user = await this.userService.findOne(data.email);

    if (!user) {
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );
    }

    const hashedPassword = await argon2.hash(resetPasswordDto.password);

    await this.userService.updateUser(user.id, { password: hashedPassword });

    await this.remove(data.id);

    return user;
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.userService.findOne(changePasswordDto.email);

    if (!user)
      throw new HttpException(
        'Немає акаунту з цією адресою',
        HttpStatus.NOT_FOUND,
      );

    const isCorrectOldPassword = await argon2.verify(
      user.password,
      changePasswordDto.old_password,
    );

    if (!isCorrectOldPassword)
      throw new HttpException(
        'Некоректний попередній пароль',
        HttpStatus.BAD_REQUEST,
      );

    const hashedNewPassword = await argon2.hash(changePasswordDto.new_password);

    await this.userService.updateUser(user.id, { password: hashedNewPassword });

    return {
      email: user.email,
      access_token: this.jwtService.sign({ id: user.id, email: user.email }),
      message: 'Password successfully updated',
      status: 200,
    };
  }
}

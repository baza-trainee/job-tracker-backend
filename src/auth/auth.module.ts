import { Module } from '@nestjs/common';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt-strategy';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailingModule } from '../mailing/mailing.module';
import { MailingService } from 'src/mailing/mailing.service';
import { GithubStrategy } from './strategies/github-strategy';
import { GoogleStrategy } from './strategies/google-strategy';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: '30d' },
      }),
      inject: [ConfigService],
    }),
    MailingModule
  ],
  controllers: [AuthController],
  providers: [AuthService, MailingService, JwtStrategy, GoogleStrategy, GithubStrategy, JwtAuthGuard],
  exports: [JwtAuthGuard, TypeOrmModule]
})
export class AuthModule { }

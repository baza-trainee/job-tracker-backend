import { Module } from '@nestjs/common';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { MailingModule } from './mailing/mailing.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { EjsAdapter } from '@nestjs-modules/mailer/dist/adapters/ejs.adapter';
import { VacanciesModule } from './vacancies/vacancies.module';
import { VacancyStatusModule } from './vacancy-status/vacancy-status.module';
import { ResumeModule } from './resume/resume.module';
import { ProjectsModule } from './projects/projects.module';
import { CoverLetterModule } from './cover-letter/cover-letter.module';
import { NotesModule } from './notes/notes.module';
import { EventsModule } from './events/events.module';
import { PredictionsModule } from './predictions/predictions.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        entities: [__dirname + '/**/*.entity{.js,.ts}'],
        synchronize: true,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'swagger-static'),
      serveRoot: process.env.NODE_ENV === 'development' ? '/' : '/swagger',
    }),
    MailerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        transport: {
          host: configService.get<string>('SMTP_HOST'),
          secure: true,
          port: configService.get<number>('SMTP_PORT'),
          auth: {
            user: configService.get<string>('SMTP_USER'),
            pass: configService.get<string>('SMTP_PASSWORD'),
          },
          debug: configService.get<boolean>('SMTP_DEBUG') || false,
        },
        defaults: {
          from: configService.get<string>('SMTP_FROM'), // Default "from" address
        },
        template: {
          dir: join(process.cwd(), 'templates'), // Points to the templates folder
          adapter: new EjsAdapter(),
          options: {
            strict: true,
          },
        },
        options: {
          viewEngine: {
            engine: 'ejs',
            templates: join(process.cwd(), 'templates'),
          },
        },
      }),
      inject: [ConfigService],
    }),
    UserModule,
    AuthModule,
    MailingModule,
    VacanciesModule,
    VacancyStatusModule,
    ResumeModule,
    ProjectsModule,
    CoverLetterModule,
    NotesModule,
    EventsModule,
    PredictionsModule,
  ],
})
export class AppModule { }

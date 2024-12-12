import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
  OneToMany,
} from 'typeorm';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';

@Entity({ name: 'User' })
export class User {
  @PrimaryColumn()
  id: string;

  @ApiProperty({ description: 'User`s username' })
  @Column()
  username: string;

  @ApiProperty({ description: 'User`s email' })
  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'User`s reset token' })
  @Column({ nullable: true })
  resetToken: string;

  @ApiProperty({ description: 'User`s reset token expiry' })
  @Column({ nullable: true })
  resetTokenExpiry: Date;

  @ApiProperty({ description: 'User`s invalidated tokens' })
  @Column('simple-array', { nullable: true })
  invalidatedTokens: string[];

  @ApiProperty({ description: 'User`s google id' })
  @Column({ nullable: true })
  googleId: string;

  @ApiProperty({ type: () => [Vacancy], description: 'User vacancies' })
  @OneToMany(() => Vacancy, (vacancy) => vacancy.user)
  vacancies: Vacancy[];

  @CreateDateColumn()
  createdAt: Date;
}

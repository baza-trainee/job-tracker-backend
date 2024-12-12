import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToMany,
} from 'typeorm';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @ApiProperty({ description: 'User`s username' })
  @Column({ nullable: true })
  username: string;

  @ApiProperty({ description: 'User`s email' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'User`s password' })
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

  @ApiProperty({ type: () => [Vacancy], description: 'User vacancies' })
  @OneToMany(() => Vacancy, (vacancy) => vacancy.user)
  vacancies: Vacancy[];

  @CreateDateColumn()
  createdAt: Date;
}

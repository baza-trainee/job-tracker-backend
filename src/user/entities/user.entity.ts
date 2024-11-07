import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryColumn,
} from 'typeorm';


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

  @ApiProperty({ description: 'User`s password' })
  @Column({ nullable: true })
  password: string;

  @ApiProperty({ description: 'User`s avatar' })
  @Column({ nullable: true })
  avatar?: string;

  @CreateDateColumn()
  createdAt: Date;
}

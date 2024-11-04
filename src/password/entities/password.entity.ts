import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('Password_Resets')
export class Password {
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({ description: 'email' })
  @Column()
  email: string;

  @ApiProperty({ description: 'token' })
  @Column({ unique: true })
  token: string;
}

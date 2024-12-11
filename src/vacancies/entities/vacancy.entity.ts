import {
  Entity,
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { VacancyStatus } from '../../vacancy-status/entities/vacancy-status.entity';

export enum WorkType {
  REMOTE = 'remote',
  OFFICE = 'office',
  HYBRID = 'hybrid',
}

@Entity({ name: 'Vacancy' })
export class Vacancy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  vacancy: string;

  @Column()
  link: string;

  @Column({ nullable: true })
  communication: string;

  @Column()
  company: string;

  @Column()
  location: string;

  @Column({ type: 'enum', enum: WorkType })
  work_type: WorkType;

  @Column({ nullable: true })
  note: string;

  @Column({ default: false })
  isArchive: boolean;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;

  @OneToMany(() => VacancyStatus, (status) => status.vacancy)
  statuses: VacancyStatus[];

  @CreateDateColumn()
  createdAt: Date;

  @CreateDateColumn()
  updatedAt: Date;
}

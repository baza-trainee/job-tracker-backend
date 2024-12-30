import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';
import { Vacancy } from '../../vacancies/entities/vacancy.entity';

export enum StatusName {
  SAVED = 'saved',
  RESUME = 'resume',
  HR = 'hr',
  TEST = 'test',
  TECH = 'tech',
  REJECT = 'reject',
  OFFER = 'offer',
}

export enum RejectReason {
  SOFT_SKILLS = 'SOFT_SKILLS',
  TECH_SKILLS = 'TECH_SKILLS',
  ENGLISH = 'ENGLISH',
  EXPERIENCE = 'EXPERIENCE',
  STOPPED = 'STOPPED',
  NO_ANSWER = 'NO_ANSWER',
  OTHER = 'OTHER',
}

@Entity({ name: 'VacancyStatus' })
export class VacancyStatus {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: StatusName,
    default: StatusName.SAVED,
  })
  name: StatusName;

  @Column({ type: 'timestamp with time zone', default: () => 'CURRENT_TIMESTAMP' })
  date: Date;

  @Column({
    type: 'enum',
    enum: RejectReason,
    nullable: true,
  })
  rejectReason?: RejectReason;

  @Column({ nullable: true })
  resumeId?: string;

  @ManyToOne(() => Vacancy, (vacancy) => vacancy.statuses, { onDelete: 'CASCADE', eager: false })
  @JoinColumn()
  @Exclude()
  vacancy: Vacancy;
}
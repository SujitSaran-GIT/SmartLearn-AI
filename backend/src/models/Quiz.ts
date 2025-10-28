// src/models/Quiz.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { File } from './File';
import { Question } from './Question';
import { QuizAttempt } from './QuizAttempt';

@Entity('quizzes')
export class Quiz {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  fileId!: string;

  @Column()
  title!: string;

  @Column()
  questionCount!: number;

  @Column({ default: 'generating' })
  status!: 'generating' | 'ready' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  generationParams?: any;

  @CreateDateColumn()
  createdAt!: Date;

  @ManyToOne(() => User, user => user.quizzes)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => File, file => file.quizzes)
  @JoinColumn({ name: 'fileId' })
  file!: File;

  @OneToMany(() => Question, question => question.quiz)
  questions!: Question[];

  @OneToMany(() => QuizAttempt, attempt => attempt.quiz)
  attempts!: QuizAttempt[];
}
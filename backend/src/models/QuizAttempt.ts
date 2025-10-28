// src/models/QuizAttempt.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Quiz } from './Quiz';
import { Answer } from './Answer';

@Entity('quiz_attempts')
export class QuizAttempt {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  quizId!: string;

  @Column({ default: 0 })
  score!: number;

  @Column({ default: 0 })
  correctCount!: number;

  @Column({ default: 0 })
  wrongCount!: number;

  @Column({ type: 'float', default: 0 })
  percentage!: number;

  @Column({ default: 'in_progress' })
  status!: 'in_progress' | 'completed' | 'abandoned';

  @CreateDateColumn()
  startedAt!: Date;

  @Column({ nullable: true })
  submittedAt?: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ManyToOne(() => User, user => user.quizAttempts)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @ManyToOne(() => Quiz, quiz => quiz.attempts)
  @JoinColumn({ name: 'quizId' })
  quiz!: Quiz;

  @OneToMany(() => Answer, answer => answer.attempt)
  answers!: Answer[];
}
// src/models/Answer.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { QuizAttempt } from './QuizAttempt';
import { Question } from './Question';

@Entity('answers')
export class Answer {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid' })
  attemptId!: string;

  @Column({ type: 'uuid' })
  questionId!: string;

  @Column({ nullable: true })
  selectedOptionIndex?: number;

  @Column({ default: false })
  isCorrect!: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ManyToOne(() => QuizAttempt, attempt => attempt.answers)
  @JoinColumn({ name: 'attemptId' })
  attempt!: QuizAttempt;

  @ManyToOne(() => Question, question => question.answers)
  @JoinColumn({ name: 'questionId' })
  question!: Question;
}

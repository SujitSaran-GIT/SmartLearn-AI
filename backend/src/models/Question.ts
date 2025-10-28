// src/models/Question.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Quiz } from './Quiz';
import { Answer } from './Answer';

@Entity('questions')
export class Question {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  quizId!: string;

  @Column('text')
  questionText!: string;

  @Column('simple-array')
  options!: string[];

  @Column()
  correctOptionIndex!: number;

  @Column('text', { nullable: true })
  explanation?: string;

  @Column('text', { nullable: true })
  sourceSnippet?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @ManyToOne(() => Quiz, quiz => quiz.questions)
  @JoinColumn({ name: 'quizId' })
  quiz!: Quiz;

  @OneToMany(() => Answer, answer => answer.question)
  answers!: Answer[];
}
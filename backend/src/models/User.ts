// src/models/User.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { File } from './File';
import { Quiz } from './Quiz';
import { QuizAttempt } from './QuizAttempt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  name!: string;

  @Column()
  passwordHash!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => File, file => file.user)
  files!: File[];

  @OneToMany(() => Quiz, quiz => quiz.user)
  quizzes!: Quiz[];

  @OneToMany(() => QuizAttempt, attempt => attempt.user)
  quizAttempts!: QuizAttempt[];
}
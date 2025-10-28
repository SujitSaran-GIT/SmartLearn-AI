// src/models/File.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { User } from './User';
import { Quiz } from './Quiz';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  userId!: string;

  @Column()
  filename!: string;

  @Column()
  originalName!: string;

  @Column()
  mimeType!: string;

  @Column()
  size!: number;

  @Column()
  s3Key!: string;

  @Column({ nullable: true })
  extractedText?: string;

  @Column({ default: 'pending' })
  status!: 'pending' | 'processing' | 'completed' | 'failed';

  @Column({ type: 'jsonb', nullable: true })
  metadata?: any;

  @CreateDateColumn()
  uploadedAt!: Date;

  @ManyToOne(() => User, user => user.files)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @OneToMany(() => Quiz, quiz => quiz.file)
  quizzes!: Quiz[];
}
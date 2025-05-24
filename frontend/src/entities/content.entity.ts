// src/entities/content.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class Content {
  @PrimaryGeneratedColumn()
  id!: number; // Off-chain ID

  @Column({ nullable: true })
  onChainId?: number; // Will be set after blockchain registration

  @Column({ length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string;

  @Column()
  ipfsHash!: string;

  @Index()
  @Column()
  creatorAddress!: string;

  @Column()
  contentType!: string;

  @CreateDateColumn()
  createdAt!: Date;

  @Column({ default: false })
  isActive!: boolean;
}
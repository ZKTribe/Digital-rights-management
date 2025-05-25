// src/entities/license.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';

export enum LicenseDuration {
  ONE_MONTH = 0,
  SIX_MONTHS = 1,
  ONE_YEAR = 2
}

@Entity()
export class License {
  @PrimaryGeneratedColumn()
  id!: number;

   @ManyToOne('Content', (content: any) => content.licenses)
  @JoinColumn({ name: 'content_id' })
  content!: any;

  @Column({ type: 'enum', enum: LicenseDuration })
  duration!: LicenseDuration;

  @Column('decimal', { precision: 18, scale: 6 })
  price!: number;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt!: Date;

  // Helper method to get display name
  getDisplayName(): string {
    return {
      [LicenseDuration.ONE_MONTH]: '1 Month',
      [LicenseDuration.SIX_MONTHS]: '6 Months',
      [LicenseDuration.ONE_YEAR]: '1 Year'
    }[this.duration];
  }
}
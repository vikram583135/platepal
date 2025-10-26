import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Review } from './review.entity';

@Entity()
export class Restaurant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  address: string;

  @Column({ nullable: true })
  ownerId: string;

  @Column({ nullable: true })
  menuId: string;

  @OneToMany(() => Review, review => review.restaurant)
  reviews: Review[];
}
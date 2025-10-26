import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Restaurant } from './restaurant.entity';

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  customerName: string;

  @Column()
  rating: number;

  @Column()
  comment: string;

  @Column({ nullable: true })
  response: string;

  @ManyToOne(() => Restaurant, restaurant => restaurant.reviews)
  restaurant: Restaurant;
}

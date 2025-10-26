    import {
      Entity,
      PrimaryGeneratedColumn,
      Column,
      CreateDateColumn,
    } from 'typeorm';
    
    // This defines the structure for a single item within an order
    // It will be stored as part of a JSON array.
    export class OrderItem {
      name: string;
      quantity: number;
      price: number;
    }
    
    // The @Entity() decorator marks this class as the blueprint for the 'order' table.
    @Entity()
    export class Order {
      @PrimaryGeneratedColumn()
      id: number;
    
      @Column()
      restaurantId: number;
    
      @Column()
      customerId: number; // In a real app, this might be a UUID string
    
      @Column('decimal')
      totalPrice: number;
    
      @Column({
        type: 'enum',
        enum: ['new', 'preparing', 'ready', 'out_for_delivery', 'delivered'],
        default: 'new',
      })
      status: string;
    
      // This is a powerful feature of PostgreSQL. We can store complex
      // JSON data directly in a column. This is perfect for the list of items.
      @Column({
        type: 'jsonb',
        array: false,
        default: () => "'[]'",
        nullable: false,
      })
      items: OrderItem[];
    
      @CreateDateColumn()
      createdAt: Date;
    }
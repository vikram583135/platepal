import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';

// The @Entity() decorator tells TypeORM that this class is a database table model.
// TypeORM will automatically create a table named 'user' (lowercase) based on this class.
@Entity()
export class User {
  // @PrimaryGeneratedColumn('uuid') creates a primary key column.
  // This is the unique identifier for each user in the table.
  // Using 'uuid' is a modern practice for generating unique IDs that aren't guessable.
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // @Column() maps this property to a database column.
  // By default, it will be a 'varchar' or string type.
  @Column()
  name: string;

  // @Column({ unique: true }) ensures that every value in this column must be unique.
  // This prevents two users from registering with the same email address.
  // The database itself will enforce this rule, providing a strong layer of data integrity.
  @Column({ unique: true })
  email: string;

  // @Column({ select: false }) is a crucial security feature.
  // It tells TypeORM that whenever you fetch a user from the database (e.g., for a profile page),
  // this 'password' column should NOT be included in the result by default.
  // This prevents you from accidentally leaking a hashed password to the frontend.
  @Column({ select: false })
  password: string;

  // @BeforeInsert() is a "hook". This function will automatically run
  // just before a new User entity is saved to the database for the first time.
  // This ensures that we never store a plain-text password.
  @BeforeInsert()
  async hashPassword() {
    // We use the bcrypt library to "hash" the password. Hashing is a one-way
    // cryptographic process that turns the plain text password into a long, secure string.
    // The '10' is the "salt round" - it determines how computationally expensive the hashing is.
    // A higher number is more secure but slower. 10 is a good default.
    this.password = await bcrypt.hash(this.password, 10);
  }
}

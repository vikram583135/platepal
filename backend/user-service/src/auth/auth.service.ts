import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
// 1. Import the new DTO, the JWT service, and the bcrypt library.
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
  // 2. We inject both the UserRepository (for database access) and the JwtService (for creating tokens).
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Registers a new user.
   * Hashes the password via the User entity's hook.
   * Checks for duplicate emails.
   */
  async register(registerUserDto: RegisterUserDto): Promise<User> {
    const { email, name, password } = registerUserDto;

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('A user with this email already exists.');
    }

    const newUser = this.userRepository.create({ email, name, password });
    return this.userRepository.save(newUser);
  }

  /**
   * Logs in an existing user.
   * Verifies credentials and returns a JWT if they are valid.
   */
  async login(loginUserDto: LoginUserDto): Promise<{ accessToken: string }> {
    const { email, password } = loginUserDto;

    // 3. Find the user by email. This is the crucial step to fix the error.
    // Because the password column has `select: false` in the entity,
    // a normal `findOne` will not retrieve it.
    // We must use the Query Builder and explicitly ask for the password.
    const user = await this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email })
      .addSelect('user.password') // <-- THE FIX IS HERE!
      .getOne();

    // 4. Check if the user was found AND if the provided password matches the hashed password in the database.
    // The `bcrypt.compare` function handles this securely.
    if (user && (await bcrypt.compare(password, user.password))) {
      // 5. If credentials are valid, create the payload for the JWT.
      // The payload contains the user's identity. Never put sensitive info here.
      const payload = { email: user.email, sub: user.id }; // 'sub' is a standard JWT claim for "subject" (the user's ID)

      // 6. Sign the payload with our secret key to create the token.
      const accessToken = this.jwtService.sign(payload);

      // 7. Return the token to the user.
      return { accessToken };
    } else {
      // 8. If the user is not found or the password does not match, throw an error.
      // We use a generic message to prevent attackers from knowing whether an email exists or not.
      throw new UnauthorizedException('Please check your login credentials.');
    }
  }
}
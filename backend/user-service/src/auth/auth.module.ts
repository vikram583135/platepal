import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { User } from '../users/user.entity';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    // This gives the AuthService the ability to interact with the 'user' database table.
    TypeOrmModule.forFeature([User]),

    // We register PassportModule for its authentication infrastructure.
    PassportModule,

    // We register and configure the JwtModule for creating and signing tokens.
    JwtModule.register({
      // This secret key is used to sign the tokens. It MUST be kept safe and private.
      // In a real application, this would come from a secure environment variable.
      secret: 'YOUR_SUPER_SECRET_KEY_THAT_IS_LONG_AND_RANDOM_12345',
      // This sets the expiration time for the tokens.
      signOptions: { expiresIn: '1h' }, // '1h' = 1 hour
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
// The 'export' keyword is essential. It makes this class available to be imported
// by other modules, like your main AppModule.
export class AuthModule {}


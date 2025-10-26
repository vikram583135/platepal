import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';

@Module({
  // 1. Import PassportModule to make Passport's features available to this module.
  imports: [PassportModule],
  // 2. Add JwtStrategy to the providers array. This tells NestJS to instantiate
  //    our strategy and make it available for dependency injection. When it's
  //    instantiated, it will automatically register itself with Passport.
  providers: [JwtStrategy],
})
export class AuthModule {}

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// A Passport Strategy is a class that knows how to authenticate a user.
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // 1. Where to find the token:
      // This configures the strategy to look for the JWT in the standard
      // 'Authorization: Bearer <token>' header of an incoming request.
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 2. We don't want to fail if the token is expired. We'll let the library handle that.
      ignoreExpiration: false,

      // 3. The secret key to verify the token's signature.
      // IMPORTANT: This secret MUST be the EXACT SAME secret used in your 'user-service'
      // to sign the tokens. Otherwise, validation will always fail.
      secretOrKey: 'YOUR_SUPER_SECRET_KEY_THAT_IS_LONG_AND_RANDOM_12345',
    });
  }

  /**
   * This 'validate' method is required by the library.
   * After a token has been successfully verified against the secret key,
   * this method is called with the decoded JSON payload of the token.
   * Whatever this method returns is what NestJS will attach to the
   * request object as `request.user`.
   * @param payload The decoded JWT payload (e.g., { email: '...', sub: 1, iat: ..., exp: ... })
   */
  async validate(payload: any) {
    // We can trust the payload at this point because passport-jwt has already validated it.
    // We are returning an object with the user's ID and email.
    return { userId: payload.sub, email: payload.email };
  }
}

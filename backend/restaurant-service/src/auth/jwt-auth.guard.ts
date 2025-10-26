import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

// This class is the "guard" that will stand at the door of our protected endpoints.
// It uses the 'jwt' strategy we defined in jwt.strategy.ts by default.
// When we apply this guard to an endpoint, it will automatically trigger our JWT Strategy
// to validate the token from the incoming request.
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

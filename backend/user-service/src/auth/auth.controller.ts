import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
// 1. Import the new LoginUserDto.
import { LoginUserDto } from './dto/login-user.dto';

// The @Controller('auth') decorator sets the base URL path for all routes in this file to '/auth'.
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Handles POST requests to /auth/register.
   * Validates the request body against the RegisterUserDto.
   * On success, returns the newly created user object (without the password).
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED) // Sets the success status code to 201 Created.
  async register(@Body() registerUserDto: RegisterUserDto) {
    const user = await this.authService.register(registerUserDto);
    // Securely remove the password before sending the response.
    const { password, ...result } = user;
    return result;
  }

  /**
   * Handles POST requests to /auth/login.
   * Validates the request body against the LoginUserDto.
   * On success, returns a JSON object containing the JWT accessToken.
   */
  // 2. Add the new login endpoint.
  @Post('login')
  @HttpCode(HttpStatus.OK) // Sets the success status code to 200 OK.
  async login(@Body() loginUserDto: LoginUserDto) {
    // The request body is automatically validated against LoginUserDto.
    // If valid, the data is passed to the login method in our service.
    return this.authService.login(loginUserDto);
  }
}

import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

// This class defines the shape of the data we expect for a registration request.
export class RegisterUserDto {
// The @IsEmail() decorator ensures the 'email' field is a valid email address.
  @IsEmail({}, { message: 'Please enter a valid email address.' })
  @IsNotEmpty({ message: 'Email should not be empty.' })
email: string;

// The @IsString() decorator ensures the 'name' field is a string.
  @IsString()
@IsNotEmpty({ message: 'Name should not be empty.' })
  name: string;

// The @MinLength() decorator ensures the password is at least 8 characters long.
  @IsString()
@MinLength(8, { message: 'Password must be at least 8 characters long.' })
  password: string;
}

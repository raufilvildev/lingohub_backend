import {
  IsEmail,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class SignupUser {
  @IsString({ message: 'name debe ser string.' })
  @MinLength(3, { message: 'name debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'name no puede tener más de 100 caracteres.' })
  name: string;

  @IsString({ message: 'last_name debe ser string.' })
  @MinLength(3, { message: 'last_name debe tener al menos 3 caracteres.' })
  @MaxLength(255, { message: 'email no puede tener más de 255 caracteres.' })
  last_name: string;

  @IsString({ message: 'email debe ser string.' })
  @MinLength(3, { message: 'email debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'email no puede tener más de 100 caracteres.' })
  @IsEmail(undefined, {
    message: 'email debe tener un formato de correo electrónico válido.',
  })
  email: string;

  @IsString({ message: 'username debe ser string.' })
  @MinLength(3, { message: 'username debe tener al menos 3 caracteres.' })
  @MaxLength(100, { message: 'username no puede tener más de 100 caracteres.' })
  username: string;

  @IsString({ message: 'password debe ser string.' })
  @MinLength(8, { message: 'password debe tener al menos 8 caracteres.' })
  @MaxLength(100, { message: 'password no puede tener más de 100 caracteres.' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_])$/, {
    message:
      'password debe incluir una letra mayúscula, una letra minúscula, un número y un carácter especial.',
  })
  password: string;
}

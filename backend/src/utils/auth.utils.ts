import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IJWTPayload } from '../types/auth.types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-this';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET debe estar definido en producción');
  }
} else {
  if (JWT_SECRET === 'your-secret-key-change-this') {
    console.warn('⚠️  ADVERTENCIA: Usando JWT_SECRET por defecto. Define JWT_SECRET en tu .env');
  }
}

/**
 * Hashea una contraseña usando bcrypt
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Compara una contraseña con su hash
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => bcrypt.compare(password, hashedPassword);

/**
 * Genera un token JWT
 */
export const generateToken = (payload: IJWTPayload): string => {
  const signOptions: SignOptions = {
    expiresIn: JWT_EXPIRES_IN as SignOptions['expiresIn']
  };
  
  return jwt.sign(payload, JWT_SECRET, signOptions);
};

/**
 * Verifica un token JWT
 */
export const verifyToken = (token: string): IJWTPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as IJWTPayload;
    
    // Imprimir los datos del token decodificado y la fecha de expiración
    console.log("Token verificado:", token); // El token entero
    console.log("Datos del token decodificado:", decoded); // Contiene la fecha de expiración (exp)
    
    return decoded;
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      console.log("El token ha expirado", error);
      throw new Error('El token ha expirado');
    }
    if (error.name === 'JsonWebTokenError') {
      console.log("Token inválido:", error);
      throw new Error('Token inválido');
    }
    console.log("Error al verificar el token:", error);
    throw new Error('Error al verificar el token');
  }
};

/**
 * Valida el formato de email
 * Regex mejorado que cubre más casos edge
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  return emailRegex.test(email) && email.length <= 254;
};

/**
 * Valida la fortaleza de la contraseña
 * Requiere: mínimo 8 caracteres, al menos una mayúscula, una minúscula y un número
 */
export const isStrongPassword = (password: string): boolean => {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  // Puedes ajustar los requisitos según tus necesidades
  return password.length >= minLength && 
         hasUpperCase && 
         hasLowerCase && 
         hasNumbers;
  // Si quieres requerir caracteres especiales, descomenta:
  // return ... && hasSpecialChar;
};

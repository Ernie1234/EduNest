import { UserRole } from '@prisma/client';

declare global {
  namespace Express {
    interface User {
      id?: string;
      googleId: string;
      email: string;
      name?: string;
      image?: string;
      role?: UserRole;
    }
  }
}

export {};

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      token: string | undefined;
      user: IUser;
      expiresAt: { _id: string; iat: number; exp: number };
    }
  }
}

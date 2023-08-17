export interface User {
  createdAt: string;
  email: string;
  name: string;
  updatedAt: string;
  _id: string;
}
export type Token = string;
export type ExpiresAt = number;
export interface LoginResponse {
  user: User;
  token: Token;
  expiresAt: ExpiresAt;
}

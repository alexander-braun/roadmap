import { Observable } from "rxjs";
import { Model, Schema, model } from "mongoose";

export default interface IUser {
  email: string;
  password: string;
  tokens: { token: string }[];
  generateAuthToken: () => Observable<string>;
}

export interface UserModel extends Model<IUser> {
  findByCredentials: (email: string, password: string) => Observable<IUser>;
}

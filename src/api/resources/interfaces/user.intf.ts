import { ObjectId } from 'mongodb';

export interface OUser {
  _id?: ObjectId;
  email: string;
  firstName?: string;
  lastName?: string;
  image?: string;
  role?: string;
  country?: string;
  createdAt?: NativeDate;
  updatedAt?: NativeDate;
}

export interface IUser {
  firstName: string;
  lastName: string;
  email: string;
  image?: string;
  role?: 'admin' | 'user';
  country?: string;
}

export interface LocalUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  pingInterval?: number;
}

export interface Auth0User {
  name: string;
  given_name: string;
  family_name: string;
  nickname: string;
  picture: string;
  email: string;
  sub: string;
  sid: string;
}

export interface RegisterUserParams {
  userDetails: IUser;
  password: string;
}

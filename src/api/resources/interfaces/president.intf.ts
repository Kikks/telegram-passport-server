import { ObjectId } from 'mongodb';

export interface OPresident {
  _id?: ObjectId;
  name?: string;
  country?: string;
  image?: string;
  bio?: string;
  url?: string;
  duration?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface IPresident {
  name?: string;
  country?: string;
  image?: string;
  bio?: string;
  url?: string;
  duration?: string;
}

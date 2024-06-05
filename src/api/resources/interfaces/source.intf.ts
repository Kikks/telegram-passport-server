import { ObjectId } from 'mongodb';

export interface OSource {
  _id?: ObjectId;
  name?: string;
  searchUrl?: string;
  image?: string;
  country?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface ISource {
  name: string;
  searchUrl: string;
  image?: string;
  country?: string;
}

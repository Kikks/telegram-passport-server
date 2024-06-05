import { ObjectId } from 'mongodb';

export interface OCategory {
  _id: ObjectId;
  name?: string;
  emoji?: string;
  isDeleted?: boolean;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface ICategory {
  name?: string;
  emoji?: string;
}

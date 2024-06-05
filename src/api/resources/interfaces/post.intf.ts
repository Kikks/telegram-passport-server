import { ObjectId } from 'mongodb';
import { PopulatedDoc } from 'mongoose';

import { OSource } from './source.intf';

export interface OPost {
  _id?: ObjectId;
  title?: string;
  content?: string;
  publishedAt?: NativeDate;
  // This field is now redundant as we now reference the source model instead of storing the source a string
  source?: string;
  src?: PopulatedDoc<OSource & Document>;
  status?: string;
  url?: string;
  country?: string;
  isProcessed?: boolean;
  isDeleted?: boolean;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface IPost {
  title?: string;
  content?: string;
  publishedAt?: NativeDate;
  src?: string | ObjectId;
  url?: string;
  country?: string;
}

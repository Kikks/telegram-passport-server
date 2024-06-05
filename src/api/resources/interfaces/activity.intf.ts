import { ObjectId } from 'mongodb';
import { Document, PopulatedDoc } from 'mongoose';

import { OCategory } from './category.intf';
import { OPost } from './post.intf';

export interface OActivity {
  _id?: ObjectId;
  title: string;
  summary: string;
  date?: NativeDate;
  post?: PopulatedDoc<OPost & Document>;
  categories?: PopulatedDoc<OCategory & Document>[];
  isPublished: boolean;
  isDeleted?: boolean;
  country?: string;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface IActivity {
  title: string;
  summary: string;
  date?: NativeDate;
  post?: ObjectId;
  categories: ObjectId[];
  country?: string;
}

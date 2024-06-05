import { ObjectId } from 'mongodb';
import { PopulatedDoc } from 'mongoose';
import { Document } from 'mongoose';

import { OActivity } from './activity.intf';

export interface OVote {
  _id?: ObjectId;
  type: string;
  activity: PopulatedDoc<OActivity & Document>;
  country: string;
  createdBy?: ObjectId;
  createdAt: NativeDate;
  updatedAt: NativeDate;
}

export interface IVote {
  type: string;
  country?: string;
  activity: string | ObjectId;
  createdBy: string | ObjectId;
}

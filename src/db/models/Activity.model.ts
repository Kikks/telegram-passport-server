import mongoose, { Document, Schema } from 'mongoose';

import { countries } from '../../api/lib/constants';
import { OActivity } from '../../api/resources/interfaces/activity.intf';

const ActivitySchema = new Schema<OActivity & Document>(
  {
    title: {
      type: String,
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
    },
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
    isPublished: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    country: {
      type: String,
      default: countries.Nigeria.code,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.model('Activity', ActivitySchema);

export default Activity;

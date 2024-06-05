import mongoose, { Document, Schema } from 'mongoose';

import { countries } from '../../api/lib/constants';
import { OVote } from '../../api/resources/interfaces/vote.intf';

const VoteSchema = new Schema<OVote & Document>(
  {
    type: {
      type: String,
      enum: ['downvote', 'upvote'],
      default: 'upvote',
      required: true,
    },
    activity: {
      type: Schema.Types.ObjectId,
      ref: 'Activity',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    country: {
      type: String,
      default: countries.Nigeria.code,
    },
  },
  { timestamps: true }
);

const Vote = mongoose.model('Vote', VoteSchema);

export default Vote;

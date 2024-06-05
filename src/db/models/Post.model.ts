import mongoose, { Document, Schema } from 'mongoose';

import { countries } from '../../api/lib/constants';
import { OPost } from '../../api/resources/interfaces/post.intf';

const PostSchema = new Schema<OPost & Document>(
  {
    title: {
      type: String,
      required: true,
    },
    content: String,
    publishedAt: {
      type: Date,
      default: Date.now,
    },
    src: {
      type: Schema.Types.ObjectId,
      ref: 'Source',
    },
    status: {
      type: String,
      enum: ['pending', 'approved'],
      default: 'pending',
    },
    url: String,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isProcessed: {
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

const Post = mongoose.model('Post', PostSchema);

export default Post;

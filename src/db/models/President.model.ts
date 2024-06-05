import mongoose, { Document, Schema } from 'mongoose';

import { OPresident } from '../../api/resources/interfaces/president.intf';

const PresidentSchema = new Schema<OPresident & Document>(
  {
    name: {
      type: String,
    },
    bio: {
      type: String,
    },
    image: {
      type: String,
    },
    url: {
      type: String,
    },
    duration: {
      type: String,
    },
    country: {
      type: String,
    },
  },
  { timestamps: true }
);

const President = mongoose.model('President', PresidentSchema);

export default President;

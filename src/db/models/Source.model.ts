import mongoose, { Document, Schema } from 'mongoose';

import { countries } from '../../api/lib/constants';
import { OSource } from '../../api/resources/interfaces/source.intf';

const SourceSchema = new Schema<OSource & Document>(
  {
    name: {
      type: String,
    },
    searchUrl: {
      type: String,
    },
    image: {
      type: String,
    },
    country: {
      type: String,
      default: countries.Nigeria.code,
    },
  },
  { timestamps: true }
);

const Source = mongoose.model('Source', SourceSchema);

export default Source;

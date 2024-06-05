import mongoose, { Document, Schema } from 'mongoose';

import { OCategory } from '../../api/resources/interfaces/category.intf';

const CategorySchema = new Schema<OCategory & Document>(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    emoji: {
      type: String,
      required: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Category = mongoose.model('Category', CategorySchema);

export default Category;

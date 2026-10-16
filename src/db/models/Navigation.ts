import mongoose, { Schema, Document, Model } from 'mongoose';

export interface INavMenuItem {
  label: string;
  href: string;
  order: number;
  isExternal?: boolean;
  iconName?: string;
  children?: {
    label: string;
    href: string;
    description?: string;
    order: number;
  }[];
}

export interface IFooterSection {
  title: string;
  order: number;
  links: {
    label: string;
    href: string;
    order: number;
    isExternal?: boolean;
  }[];
}

export interface INavigationDocument extends Document {
  identifier: string; // e.g. 'main_navigation'
  headerMenuItems: INavMenuItem[];
  footerSections: IFooterSection[];
  emergencyNotice?: string;
  appointmentCtaLabel: string;
  isPublished: boolean;
  updatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const NavMenuItemSchema = new Schema<INavMenuItem>(
  {
    label: { type: String, required: true, trim: true },
    href: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    isExternal: { type: Boolean, default: false },
    iconName: { type: String, trim: true },
    children: [
      {
        label: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
        description: { type: String, trim: true },
        order: { type: Number, default: 0 },
      },
    ],
  },
  { _id: false }
);

const FooterSectionSchema = new Schema<IFooterSection>(
  {
    title: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
    links: [
      {
        label: { type: String, required: true, trim: true },
        href: { type: String, required: true, trim: true },
        order: { type: Number, default: 0 },
        isExternal: { type: Boolean, default: false },
      },
    ],
  },
  { _id: false }
);

const NavigationSchema = new Schema<INavigationDocument>(
  {
    identifier: {
      type: String,
      required: true,
      unique: true,
      default: 'main_navigation',
      trim: true,
      index: true,
    },
    headerMenuItems: [NavMenuItemSchema],
    footerSections: [FooterSectionSchema],
    emergencyNotice: { type: String, trim: true },
    appointmentCtaLabel: { type: String, default: 'Book Appointment', trim: true },
    isPublished: { type: Boolean, default: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'Admin' },
  },
  { timestamps: true }
);

export const NavigationModel: Model<INavigationDocument> =
  mongoose.models.Navigation || mongoose.model<INavigationDocument>('Navigation', NavigationSchema);

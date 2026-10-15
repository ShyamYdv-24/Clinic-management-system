import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { AdminModel } from '../src/db/models/Admin';
import { DoctorModel } from '../src/db/models/Doctor';
import { ServiceModel } from '../src/db/models/Service';
import { FAQModel } from '../src/db/models/FAQ';
import { GalleryModel } from '../src/db/models/Gallery';
import { SettingModel } from '../src/db/models/Setting';

dotenv.config();

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('Skipping MongoDB seed: MONGODB_URI is not provided.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB for seeding.');

    // 1. Ensure Super Admin with bcrypt hash
    const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@om-sai-adarsha.clinic';
    const plainPassword = process.env.INITIAL_ADMIN_PASSWORD || 'OmSaiClinic@2026';

    const existingAdmin = await AdminModel.findOne({ email: adminEmail });
    if (!existingAdmin) {
      console.log(`Hashing password for initial admin ${adminEmail} with bcrypt (10 rounds)...`);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      await AdminModel.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Om Sai Clinic Administrator',
        role: 'superadmin',
        isActive: true,
      });
      console.log(`Super Admin created successfully: ${adminEmail}`);
    } else {
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    // 2. Ensure Clinic Settings
    const settingCount = await SettingModel.countDocuments();
    if (settingCount === 0) {
      await SettingModel.create({
        clinicName: 'Om Sai Adarsha Clinic',
        tagline: 'Compassionate Care, Advanced Medical Excellence',
        emergencyPhone: '+91 98765 43210',
        generalPhone: '+91 80 2345 6789',
        email: 'care@om-sai-adarsha.clinic',
        address: {
          street: '124, Temple Road, Near Sai Mandir',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560078',
          landmark: 'Opposite Adarsha Park',
        },
        workingHours: {
          weekdays: '08:00 AM - 09:00 PM',
          saturday: '08:00 AM - 08:00 PM',
          sunday: '09:00 AM - 02:00 PM',
          emergency24x7: true,
        },
        socialLinks: {
          facebook: 'https://facebook.com/om-sai-adarsha-clinic',
          instagram: 'https://instagram.com/om-sai-adarsha-clinic',
          twitter: 'https://twitter.com/omsaiclinic',
          youtube: 'https://youtube.com',
        },
        aboutBrief:
          'Om Sai Adarsha Clinic has been serving the community with dedicated healthcare, distinguished physicians, round-the-clock emergency assistance, and cutting-edge laboratory facilities.',
      });
      console.log('Default clinic settings seeded.');
    }

    console.log('Seeding completed successfully.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase().then(() => process.exit(0));
}

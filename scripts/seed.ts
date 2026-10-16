import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import {
  AdminModel,
  DoctorModel,
  ServiceModel,
  FAQModel,
  GalleryModel,
  SiteSettingsModel,
  TestimonialModel,
  NavigationModel,
  MediaAssetModel,
  PageModel,
} from '../src/db/models';
import {
  initialDoctors,
  initialServices,
  initialFaqs,
  initialGalleryItems,
  initialClinicSettings,
} from '../src/config/clinicData';

dotenv.config();

export async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.warn('Skipping MongoDB seed: MONGODB_URI is not provided.');
    return;
  }

  try {
    await mongoose.connect(uri);
    console.log('Connected to MongoDB Atlas for seeding.');

    // 1. Ensure Super Admin with bcrypt hash (10 salt rounds)
    const adminEmail = (process.env.INITIAL_ADMIN_EMAIL || 'admin@om-sai-adarsha.clinic').toLowerCase();
    const plainPassword = process.env.INITIAL_ADMIN_PASSWORD || 'OmSaiClinic@2026';

    const existingAdmin = await AdminModel.findOne({ email: adminEmail });
    let adminId: mongoose.Types.ObjectId;

    if (!existingAdmin) {
      console.log(`Hashing password for initial admin ${adminEmail} with bcrypt (10 rounds)...`);
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

      const createdAdmin = await AdminModel.create({
        email: adminEmail,
        password: hashedPassword,
        name: 'Om Sai Clinic Administrator',
        role: 'superadmin',
        isActive: true,
      });
      adminId = createdAdmin._id;
      console.log(`Super Admin created successfully: ${adminEmail}`);
    } else {
      adminId = existingAdmin._id;
      console.log(`Admin user already exists: ${adminEmail}`);
    }

    // 2. Ensure Clinic Settings
    const settingCount = await SiteSettingsModel.countDocuments();
    if (settingCount === 0) {
      await SiteSettingsModel.create(initialClinicSettings);
      console.log('Default clinic settings seeded.');
    }

    // 3. Ensure Doctors
    const doctorCount = await DoctorModel.countDocuments();
    if (doctorCount === 0) {
      for (let i = 0; i < initialDoctors.length; i++) {
        const doc = initialDoctors[i];
        await DoctorModel.create({
          name: doc.name,
          slug: doc.slug,
          specialty: doc.specialty,
          department: doc.department,
          qualifications: doc.qualifications,
          experienceYears: doc.experienceYears,
          bio: doc.bio,
          consultationFee: doc.consultationFee,
          availableDays: doc.availableDays,
          availableTimeSlots: doc.availableTimeSlots,
          avatarUrl: doc.avatarUrl,
          contactEmail: doc.contactEmail,
          phone: doc.phone,
          languages: doc.languages,
          isAvailable: doc.isAvailable,
          isPublished: true,
          order: i,
        });
      }
      console.log(`Seeded ${initialDoctors.length} doctors.`);
    }

    // 4. Ensure Services
    const serviceCount = await ServiceModel.countDocuments();
    if (serviceCount === 0) {
      for (let i = 0; i < initialServices.length; i++) {
        const serv = initialServices[i];
        await ServiceModel.create({
          title: serv.title,
          slug: serv.slug,
          category: serv.category,
          summary: serv.summary,
          description: serv.description,
          iconName: serv.iconName,
          imageUrl: serv.imageUrl,
          features: serv.features,
          estimatedDurationMinutes: serv.estimatedDurationMinutes,
          priceStartingAt: serv.priceStartingAt,
          department: serv.department,
          isActive: true,
          isPublished: true,
          order: i,
        });
      }
      console.log(`Seeded ${initialServices.length} clinical services.`);
    }

    // 5. Ensure Gallery Items
    const galleryCount = await GalleryModel.countDocuments();
    if (galleryCount === 0) {
      for (let i = 0; i < initialGalleryItems.length; i++) {
        const item = initialGalleryItems[i];
        await GalleryModel.create({
          title: item.title,
          category: item.category,
          imageUrl: item.imageUrl,
          description: item.description,
          featured: item.featured,
          isPublished: true,
          order: i,
        });
      }
      console.log(`Seeded ${initialGalleryItems.length} gallery assets.`);
    }

    // 6. Ensure FAQs
    const faqCount = await FAQModel.countDocuments();
    if (faqCount === 0) {
      for (let i = 0; i < initialFaqs.length; i++) {
        const faq = initialFaqs[i];
        await FAQModel.create({
          question: faq.question,
          answer: faq.answer,
          category: faq.category,
          order: i,
          isActive: true,
          isPublished: true,
        });
      }
      console.log(`Seeded ${initialFaqs.length} FAQs.`);
    }

    // 7. Ensure Testimonials
    const testimonialCount = await TestimonialModel.countDocuments();
    if (testimonialCount === 0) {
      const initialTestimonials = [
        {
          patientName: 'Ramesh K. Sharma',
          patientInitials: 'RKS',
          rating: 5,
          review:
            'Dr. Radhakrishna Murthy diagnosed my persistent hypertension accurately and prescribed a manageable regimen. The staff at Om Sai Adarsha Clinic is courteous and efficient.',
          treatmentCategory: 'General Medicine',
          doctorName: 'Dr. Radhakrishna Murthy',
          isVerified: true,
          isPublished: true,
          order: 0,
          date: '2026-03-12',
        },
        {
          patientName: 'Priya Ananth',
          patientInitials: 'PA',
          rating: 5,
          review:
            'Exceptional pediatric care by Dr. Anita Deshmukh. She was so gentle with my daughter and explained the immunization schedule thoroughly.',
          treatmentCategory: 'Pediatrics',
          doctorName: 'Dr. Anita Deshmukh',
          isVerified: true,
          isPublished: true,
          order: 1,
          date: '2026-04-05',
        },
        {
          patientName: 'Suresh V. Rao',
          patientInitials: 'SVR',
          rating: 5,
          review:
            'Got my blood profiles and ECG done in the morning; received computerized reports on my phone within 4 hours. Great diagnostic efficiency.',
          treatmentCategory: 'Diagnostic Services',
          serviceTitle: 'Computerized Pathology Laboratory',
          isVerified: true,
          isPublished: true,
          order: 2,
          date: '2026-05-18',
        },
      ];

      await TestimonialModel.insertMany(initialTestimonials);
      console.log('Seeded initial patient testimonials.');
    }

    // 8. Ensure Navigation Configuration
    const navCount = await NavigationModel.countDocuments();
    if (navCount === 0) {
      await NavigationModel.create({
        identifier: 'main_navigation',
        headerMenuItems: [
          { label: 'Home', href: '/', order: 0 },
          { label: 'About Us', href: '/about', order: 1 },
          { label: 'Services', href: '/services', order: 2 },
          { label: 'Our Doctors', href: '/doctors', order: 3 },
          { label: 'Gallery', href: '/gallery', order: 4 },
          { label: 'FAQ', href: '/faq', order: 5 },
          { label: 'Contact', href: '/contact', order: 6 },
        ],
        footerSections: [
          {
            title: 'Quick Links',
            order: 0,
            links: [
              { label: 'About Us', href: '/about', order: 0 },
              { label: 'Medical Services', href: '/services', order: 1 },
              { label: 'Doctors Directory', href: '/doctors', order: 2 },
              { label: 'Patient FAQs', href: '/faq', order: 3 },
            ],
          },
          {
            title: 'Clinical Care',
            order: 1,
            links: [
              { label: 'General Medicine', href: '/services/general-medicine', order: 0 },
              { label: 'Pediatrics', href: '/services/pediatrics-child-care', order: 1 },
              { label: 'Pathology Lab', href: '/services/pathology-lab', order: 2 },
              { label: 'ECG & Diagnostics', href: '/services/cardiac-ecg', order: 3 },
            ],
          },
        ],
        emergencyNotice: '24x7 Emergency first-aid triage available',
        appointmentCtaLabel: 'Book Appointment',
        isPublished: true,
        updatedBy: adminId,
      });
      console.log('Seeded main navigation structure.');
    }

    // 9. Ensure Page and Sections for About / Home
    const pageCount = await PageModel.countDocuments();
    if (pageCount === 0) {
      await PageModel.create({
        slug: 'about',
        title: 'About Om Sai Adarsha Clinic',
        metaTitle: 'About Us — Om Sai Adarsha Clinic',
        metaDescription: 'Discover our mission, clinical ethics, medical team, and patient-first healthcare values.',
        isPublished: true,
        sections: [
          {
            sectionKey: 'mission',
            heading: 'Our Clinical Mission',
            subheading: 'Ethical, accessible healthcare for every family',
            content:
              'To deliver high-caliber medical treatments, precise diagnostic services, and compassionate patient care adhering to national clinical protocols.',
            order: 0,
            isPublished: true,
          },
          {
            sectionKey: 'facilities',
            heading: 'Modern Infrastructure',
            subheading: 'Equipped for outpatient diagnosis and patient comfort',
            content:
              'Air-conditioned consultation chambers, computerized laboratory testing, digital electrocardiography, and 24x7 first-aid response.',
            order: 1,
            isPublished: true,
          },
        ],
        updatedBy: adminId,
      });
      console.log('Seeded About page content.');
    }

    console.log('Seeding completed successfully for all 12 MongoDB models.');
  } catch (error) {
    console.error('Error during database seeding:', error);
  } finally {
    await mongoose.disconnect();
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase().then(() => process.exit(0));
}

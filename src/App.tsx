/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RouterProvider, useRouter } from './routes/RouterContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClinicProvider } from './context/ClinicContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { AppointmentModal } from './components/common/AppointmentModal';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { NotFoundPage } from './components/common/NotFound';

// Public Pages
import { HomePage } from './pages/HomePage';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ServiceDetailPage } from './pages/ServiceDetailPage';
import { DoctorsPage } from './pages/DoctorsPage';
import { DoctorDetailPage } from './pages/DoctorDetailPage';
import { GalleryPage } from './pages/GalleryPage';
import { FaqPage } from './pages/FaqPage';
import { ContactPage } from './pages/ContactPage';

// Admin Pages
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminServicesPage } from './pages/admin/AdminServicesPage';
import { AdminGalleryPage } from './pages/admin/AdminGalleryPage';
import { AdminFaqsPage } from './pages/admin/AdminFaqsPage';
import { AdminPagesPage } from './pages/admin/AdminPagesPage';
import { AdminNavigationPage } from './pages/admin/AdminNavigationPage';
import { AdminTestimonialsPage } from './pages/admin/AdminTestimonialsPage';
import { AdminMediaPage } from './pages/admin/AdminMediaPage';
import { AdminSeoPage } from './pages/admin/AdminSeoPage';
import { AdminPendingModulePage } from './pages/admin/AdminPendingModulePage';
import { SEOHead } from './components/common/SEOHead';
import { NotificationProvider } from './context/NotificationContext';

function AppRoutes() {
  const { match, pathname, isAdminRoute } = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState<string | undefined>();
  const [selectedServiceTitle, setSelectedServiceTitle] = useState<string | undefined>();

  const handleOpenBooking = (doctorId?: string, serviceTitle?: string) => {
    setSelectedDoctorId(doctorId);
    setSelectedServiceTitle(serviceTitle);
    setBookingModalOpen(true);
  };

  // Admin Route Protection
  if (isAdminRoute) {
    if (pathname === '/dashboard-admin/login') {
      return <AdminLoginPage />;
    }

    if (isLoading) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white text-xs gap-3 font-mono">
          <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span>Verifying Administrator Session...</span>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLoginPage />;
    }

    switch (pathname) {
      case '/dashboard-admin':
        return <AdminDashboardPage />;
      case '/dashboard-admin/appointments':
        return <AdminAppointmentsPage />;
      case '/dashboard-admin/pages':
        return <AdminPagesPage />;
      case '/dashboard-admin/doctors':
        return <AdminDoctorsPage />;
      case '/dashboard-admin/services':
        return <AdminServicesPage />;
      case '/dashboard-admin/gallery':
        return <AdminGalleryPage />;
      case '/dashboard-admin/faqs':
        return <AdminFaqsPage />;
      case '/dashboard-admin/testimonials':
        return <AdminTestimonialsPage />;
      case '/dashboard-admin/navigation':
        return <AdminNavigationPage />;
      case '/dashboard-admin/media':
        return <AdminMediaPage />;
      case '/dashboard-admin/seo':
        return <AdminSeoPage />;
      case '/dashboard-admin/settings':
        return <AdminSettingsPage />;
      default:
        return <AdminDashboardPage />;
    }
  }

  // Public Layout & Page Routing
  let pageContent: React.ReactNode = null;

  if (match.route === '/services/:slug') {
    pageContent = <ServiceDetailPage onOpenBooking={handleOpenBooking} />;
  } else if (match.route === '/doctors/:slug') {
    pageContent = <DoctorDetailPage onOpenBooking={handleOpenBooking} />;
  } else {
    switch (pathname) {
      case '/':
        pageContent = <HomePage onOpenBooking={handleOpenBooking} />;
        break;
      case '/about':
        pageContent = <AboutPage onOpenBooking={() => handleOpenBooking()} />;
        break;
      case '/services':
        pageContent = <ServicesPage onOpenBooking={handleOpenBooking} />;
        break;
      case '/doctors':
        pageContent = <DoctorsPage onOpenBooking={handleOpenBooking} />;
        break;
      case '/gallery':
        pageContent = <GalleryPage />;
        break;
      case '/faq':
        pageContent = <FaqPage onOpenBooking={() => handleOpenBooking()} />;
        break;
      case '/contact':
        pageContent = <ContactPage />;
        break;
      default:
        pageContent = <NotFoundPage />;
        break;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Accessible Skip Link for Keyboard & Screen Reader Users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-emerald-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-xl focus:shadow-xl focus:text-xs focus:font-bold focus:outline-none focus:ring-2 focus:ring-white transition-all"
      >
        Skip to main content
      </a>
      <Header onOpenBooking={() => handleOpenBooking()} />
      <main id="main-content" tabIndex={-1} className="flex-1 focus:outline-none">
        {pageContent}
      </main>
      <Footer />

      <FloatingWhatsApp />

      <AppointmentModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        preselectedDoctorId={selectedDoctorId}
        preselectedServiceTitle={selectedServiceTitle}
      />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <ClinicProvider>
          <NotificationProvider>
            <AppRoutes />
          </NotificationProvider>
        </ClinicProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

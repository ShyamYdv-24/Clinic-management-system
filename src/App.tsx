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
import { AdminSettingsPage } from './pages/admin/AdminSettingsPage';

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
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white text-sm">
          Checking Admin Credentials...
        </div>
      );
    }

    if (!isAuthenticated) {
      return <AdminLoginPage />;
    }

    if (pathname === '/dashboard-admin/settings') {
      return <AdminSettingsPage />;
    }

    // Default dashboard overview
    return <AdminDashboardPage />;
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
        pageContent = <HomePage onOpenBooking={handleOpenBooking} />;
        break;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-800 font-sans selection:bg-emerald-500 selection:text-white">
      <Header onOpenBooking={() => handleOpenBooking()} />
      <main className="flex-1">{pageContent}</main>
      <Footer />

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
          <AppRoutes />
        </ClinicProvider>
      </AuthProvider>
    </RouterProvider>
  );
}

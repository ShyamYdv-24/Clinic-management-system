import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Doctor,
  Service,
  Appointment,
  GalleryItem,
  FAQItem,
  ClinicSettings,
} from '../types/clinic';
import {
  initialDoctors,
  initialServices,
  initialGallery,
  initialFAQs,
  initialClinicSettings,
} from '../config/clinicData';

interface ClinicContextType {
  settings: ClinicSettings;
  doctors: Doctor[];
  services: Service[];
  appointments: Appointment[];
  gallery: GalleryItem[];
  faqs: FAQItem[];
  updateSettings: (newSettings: Partial<ClinicSettings>) => Promise<ClinicSettings>;
  addDoctor: (doctor: Omit<Doctor, 'id'>) => void;
  updateDoctor: (id: string, doctor: Partial<Doctor>) => void;
  deleteDoctor: (id: string) => void;
  addService: (service: Omit<Service, 'id'>) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;
  bookAppointment: (booking: Omit<Appointment, 'id' | 'createdAt' | 'status'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], notes?: string) => void;
  deleteAppointment: (id: string) => void;
  addGalleryItem: (item: Omit<GalleryItem, 'id' | 'uploadedAt'>) => void;
  deleteGalleryItem: (id: string) => void;
  addFAQ: (faq: Omit<FAQItem, 'id'>) => void;
  updateFAQ: (id: string, faq: Partial<FAQItem>) => void;
  deleteFAQ: (id: string) => void;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<ClinicSettings>(() => {
    try {
      const saved = localStorage.getItem('om_sai_settings');
      return saved ? JSON.parse(saved) : initialClinicSettings;
    } catch {
      return initialClinicSettings;
    }
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    try {
      const saved = localStorage.getItem('om_sai_doctors');
      return saved ? JSON.parse(saved) : initialDoctors;
    } catch {
      return initialDoctors;
    }
  });

  const [services, setServices] = useState<Service[]>(() => {
    try {
      const saved = localStorage.getItem('om_sai_services');
      return saved ? JSON.parse(saved) : initialServices;
    } catch {
      return initialServices;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('om_sai_appointments');
      if (saved) return JSON.parse(saved);
      // Sample starter appointment for admin view
      return [
        {
          id: 'apt-sample-1',
          patientName: 'Ramesh Verma',
          patientEmail: 'ramesh.verma@example.com',
          patientPhone: '+91 98450 12345',
          patientAge: 48,
          patientGender: 'male',
          doctorId: 'doc-1',
          doctorName: 'Dr. Suresh Kumar M.D.',
          serviceTitle: 'Comprehensive General Medicine',
          appointmentDate: '2026-10-20',
          timeSlot: '10:00 AM - 01:00 PM',
          symptoms: 'Quarterly diabetic blood sugar review and mild hypertension follow-up.',
          status: 'confirmed',
          createdAt: new Date().toISOString(),
        },
      ];
    } catch {
      return [];
    }
  });

  const [gallery, setGallery] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('om_sai_gallery');
      return saved ? JSON.parse(saved) : initialGallery;
    } catch {
      return initialGallery;
    }
  });

  const [faqs, setFaqs] = useState<FAQItem[]>(() => {
    try {
      const saved = localStorage.getItem('om_sai_faqs');
      return saved ? JSON.parse(saved) : initialFAQs;
    } catch {
      return initialFAQs;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('om_sai_settings', JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem('om_sai_doctors', JSON.stringify(doctors));
  }, [doctors]);

  useEffect(() => {
    localStorage.setItem('om_sai_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('om_sai_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('om_sai_gallery', JSON.stringify(gallery));
  }, [gallery]);

  // Initial fetch from backend to ensure synchronization with MongoDB
  useEffect(() => {
    let isMounted = true;
    fetch('/api/settings')
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (isMounted && json && json.success && json.data) {
          setSettings((prev) => ({ ...prev, ...json.data }));
        }
      })
      .catch((err) => {
        console.warn('Could not fetch server settings, using cached values:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = async (newSettings: Partial<ClinicSettings>): Promise<ClinicSettings> => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('om_sai_settings', JSON.stringify(merged));

    try {
      const token = sessionStorage.getItem('adminToken');
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(merged),
      });

      if (!res.ok) {
        const errorJson = await res.json().catch(() => ({}));
        throw new Error(errorJson.error || `Server responded with ${res.status}`);
      }

      const json = await res.json();
      if (json.data) {
        setSettings(json.data);
        localStorage.setItem('om_sai_settings', JSON.stringify(json.data));
        return json.data;
      }
    } catch (err) {
      console.warn('Server settings update warning:', err);
      // Even if network fails, local state is preserved
    }
    return merged;
  };

  const addDoctor = (doctorData: Omit<Doctor, 'id'>) => {
    const newDoc: Doctor = {
      ...doctorData,
      id: `doc-${Date.now()}`,
    };
    setDoctors((prev) => [...prev, newDoc]);
  };

  const updateDoctor = (id: string, doctorData: Partial<Doctor>) => {
    setDoctors((prev) => prev.map((doc) => (doc.id === id ? { ...doc, ...doctorData } : doc)));
  };

  const deleteDoctor = (id: string) => {
    setDoctors((prev) => prev.filter((doc) => doc.id !== id));
  };

  const addService = (serviceData: Omit<Service, 'id'>) => {
    const newServ: Service = {
      ...serviceData,
      id: `serv-${Date.now()}`,
    };
    setServices((prev) => [...prev, newServ]);
  };

  const updateService = (id: string, serviceData: Partial<Service>) => {
    setServices((prev) => prev.map((s) => (s.id === id ? { ...s, ...serviceData } : s)));
  };

  const deleteService = (id: string) => {
    setServices((prev) => prev.filter((s) => s.id !== id));
  };

  const bookAppointment = async (
    booking: Omit<Appointment, 'id' | 'createdAt' | 'status'>
  ): Promise<Appointment> => {
    const newAppointment: Appointment = {
      ...booking,
      id: `apt-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    setAppointments((prev) => [newAppointment, ...prev]);
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status'], notes?: string) => {
    setAppointments((prev) =>
      prev.map((apt) =>
        apt.id === id
          ? {
              ...apt,
              status,
              ...(notes !== undefined ? { notes } : {}),
            }
          : apt
      )
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments((prev) => prev.filter((apt) => apt.id !== id));
  };

  const addGalleryItem = (item: Omit<GalleryItem, 'id' | 'uploadedAt'>) => {
    const newItem: GalleryItem = {
      ...item,
      id: `gal-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setGallery((prev) => [newItem, ...prev]);
  };

  const deleteGalleryItem = (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
  };

  const addFAQ = (faq: Omit<FAQItem, 'id'>) => {
    const newFAQ: FAQItem = {
      ...faq,
      id: `faq-${Date.now()}`,
    } as FAQItem;
    setFaqs((prev) => [...prev, newFAQ]);
  };

  const updateFAQ = (id: string, faqData: Partial<FAQItem>) => {
    setFaqs((prev) => prev.map((f, i) => (`faq-${i}` === id || (f as { id?: string }).id === id ? { ...f, ...faqData } : f)));
  };

  const deleteFAQ = (id: string) => {
    setFaqs((prev) => prev.filter((f, i) => `faq-${i}` !== id && (f as { id?: string }).id !== id));
  };

  return (
    <ClinicContext.Provider
      value={{
        settings,
        doctors,
        services,
        appointments,
        gallery,
        faqs,
        updateSettings,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addService,
        updateService,
        deleteService,
        bookAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        addGalleryItem,
        deleteGalleryItem,
        addFAQ,
        updateFAQ,
        deleteFAQ,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export function useClinic() {
  const context = useContext(ClinicContext);
  if (!context) {
    throw new Error('useClinic must be used within a ClinicProvider');
  }
  return context;
}

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title?: string;
  message: string;
}

interface NotificationContextType {
  notifications: NotificationItem[];
  notify: (type: NotificationType, message: string, title?: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  dismiss: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const notify = useCallback(
    (type: NotificationType, message: string, title?: string) => {
      const id = `notif-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      setNotifications((prev) => [...prev, { id, type, message, title }]);

      setTimeout(() => {
        dismiss(id);
      }, 4500);
    },
    [dismiss]
  );

  const success = useCallback((message: string, title?: string) => notify('success', message, title), [notify]);
  const error = useCallback((message: string, title?: string) => notify('error', message, title), [notify]);
  const info = useCallback((message: string, title?: string) => notify('info', message, title), [notify]);

  return (
    <NotificationContext.Provider value={{ notifications, notify, success, error, info, dismiss }}>
      {children}
      {/* Toast container floating at bottom right */}
      <div
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none"
        aria-live="polite"
        role="region"
        aria-label="Admin Notifications"
      >
        {notifications.map((n) => {
          const typeConfig = {
            success: {
              icon: CheckCircle2,
              border: 'border-emerald-200 dark:border-emerald-800/80',
              bg: 'bg-emerald-50 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100',
              iconColor: 'text-emerald-600 dark:text-emerald-400',
            },
            error: {
              icon: AlertCircle,
              border: 'border-rose-200 dark:border-rose-800/80',
              bg: 'bg-rose-50 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100',
              iconColor: 'text-rose-600 dark:text-rose-400',
            },
            info: {
              icon: Info,
              border: 'border-sky-200 dark:border-sky-800/80',
              bg: 'bg-sky-50 dark:bg-sky-950/90 text-sky-900 dark:text-sky-100',
              iconColor: 'text-sky-600 dark:text-sky-400',
            },
          }[n.type];

          const Icon = typeConfig.icon;

          return (
            <div
              key={n.id}
              className={`pointer-events-auto p-4 rounded-xl border shadow-lg backdrop-blur-md transition-all duration-200 flex items-start gap-3 ${typeConfig.bg} ${typeConfig.border}`}
              role="status"
            >
              <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${typeConfig.iconColor}`} />
              <div className="flex-1 min-w-0">
                {n.title && <div className="text-xs font-bold leading-tight mb-0.5">{n.title}</div>}
                <div className="text-xs font-medium leading-relaxed opacity-95">{n.message}</div>
              </div>
              <button
                type="button"
                onClick={() => dismiss(n.id)}
                className="p-1 rounded-md opacity-70 hover:opacity-100 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 cursor-pointer"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </NotificationContext.Provider>
  );
};

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';

export interface RouteMatch {
  pathname: string;
  route: string;
  params: Record<string, string>;
  search: string;
}

interface RouterContextType {
  pathname: string;
  navigate: (path: string) => void;
  match: RouteMatch;
  isAdminRoute: boolean;
}

const RouterContext = createContext<RouterContextType | null>(null);

function parseRoute(pathname: string): RouteMatch {
  // Support pathname or hash-based routing (#/services/slug)
  let raw = pathname;
  if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
    raw = window.location.hash.slice(1);
  }

  const cleanPath = raw.split('?')[0].replace(/\/+$/, '') || '/';
  const params: Record<string, string> = {};

  // Check /services/:slug
  const serviceMatch = cleanPath.match(/^\/services\/([^/?#]+)$/);
  if (serviceMatch) {
    params.slug = decodeURIComponent(serviceMatch[1]);
    return { pathname: cleanPath, route: '/services/:slug', params, search: window.location.search };
  }

  // Check /doctors/:slug
  const doctorMatch = cleanPath.match(/^\/doctors\/([^/?#]+)$/);
  if (doctorMatch) {
    params.slug = decodeURIComponent(doctorMatch[1]);
    return { pathname: cleanPath, route: '/doctors/:slug', params, search: window.location.search };
  }

  return { pathname: cleanPath, route: cleanPath, params, search: window.location.search };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    if (typeof window !== 'undefined' && window.location.hash && window.location.hash.startsWith('#/')) {
      return window.location.hash.slice(1);
    }
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handleUrlChange = () => {
      if (window.location.hash && window.location.hash.startsWith('#/')) {
        setPathname(window.location.hash.slice(1));
      } else {
        setPathname(window.location.pathname || '/');
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, []);

  const navigate = (to: string) => {
    if (to === pathname) return;
    try {
      window.history.pushState({}, '', to);
    } catch {
      window.location.hash = to;
    }
    setPathname(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const match = useMemo(() => parseRoute(pathname), [pathname]);
  const isAdminRoute = pathname.startsWith('/dashboard-admin');

  return (
    <RouterContext.Provider value={{ pathname, navigate, match, isAdminRoute }}>
      {children}
    </RouterContext.Provider>
  );
};

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) {
    throw new Error('useRouter must be used within a RouterProvider');
  }
  return context;
}

export function Link({
  href,
  children,
  className = '',
  activeClassName = '',
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  activeClassName?: string;
  onClick?: () => void;
}) {
  const { pathname, navigate } = useRouter();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <a
      href={href}
      className={`${className} ${isActive ? activeClassName : ''}`}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        navigate(href);
      }}
    >
      {children}
    </a>
  );
}

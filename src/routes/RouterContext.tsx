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
  const cleanPath = pathname.replace(/\/+$/, '') || '/';
  const params: Record<string, string> = {};

  // Check /services/:slug
  const serviceMatch = cleanPath.match(/^\/services\/([a-zA-Z0-9_-]+)$/);
  if (serviceMatch) {
    params.slug = serviceMatch[1];
    return { pathname: cleanPath, route: '/services/:slug', params, search: window.location.search };
  }

  // Check /doctors/:slug
  const doctorMatch = cleanPath.match(/^\/doctors\/([a-zA-Z0-9_-]+)$/);
  if (doctorMatch) {
    params.slug = doctorMatch[1];
    return { pathname: cleanPath, route: '/doctors/:slug', params, search: window.location.search };
  }

  return { pathname: cleanPath, route: cleanPath, params, search: window.location.search };
}

export const RouterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pathname, setPathname] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (to: string) => {
    if (to === pathname) return;
    window.history.pushState({}, '', to);
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

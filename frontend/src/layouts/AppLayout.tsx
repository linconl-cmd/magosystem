import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useTelemetria } from '../hooks/useTelemetria';

const SHORTCUT_ROUTES: Record<string, string> = {
  '1': '/',
  '2': '/dashboard',
  '3': '/soundcraft',
};

export default function AppLayout() {
  const { data, connected } = useTelemetria();
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!e.altKey) return;
      const route = SHORTCUT_ROUTES[e.key];
      if (!route) return;
      e.preventDefault();
      navigate(route);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return <Outlet context={{ data, connected }} />;
}

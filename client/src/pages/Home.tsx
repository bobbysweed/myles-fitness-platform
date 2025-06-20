import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect based on user role
    if (user?.role === 'admin') {
      setLocation('/admin-dashboard');
    } else if (user?.role === 'business') {
      setLocation('/business-dashboard');
    } else {
      setLocation('/search');
    }
  }, [user, setLocation]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
    </div>
  );
}

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { JarvisInterface } from "@/components/jarvis/JarvisInterface";
import { WelcomeSequence } from "@/components/jarvis/WelcomeSequence";

const Index = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    } else if (user && !welcomeComplete) {
      const hasSeenWelcome = sessionStorage.getItem('welcomeShown');
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        sessionStorage.setItem('welcomeShown', 'true');
      } else {
        setWelcomeComplete(true);
      }
    }
  }, [user, loading, isAuthenticated, navigate, welcomeComplete]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setWelcomeComplete(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-jarvis-primary animate-pulse text-lg">Initializing J.A.R.V.I.S...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (showWelcome) {
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sir';
    return <WelcomeSequence userName={displayName} onComplete={handleWelcomeComplete} />;
  }

  return (
    <div className="min-h-screen bg-black text-foreground overflow-hidden">
      <div className="container mx-auto p-4 h-screen">
        <JarvisInterface />
      </div>
    </div>
  );
};

export default Index;
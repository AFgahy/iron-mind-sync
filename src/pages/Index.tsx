import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { JarvisInterface } from "@/components/jarvis/JarvisInterface";
import { WelcomeSequence } from "@/components/jarvis/WelcomeSequence";
import { EdexWelcomeSequence } from "@/components/jarvis/EdexWelcomeSequence";

const Index = () => {
  const { user, loading, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeComplete, setWelcomeComplete] = useState(false);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/auth');
    } else if (user && !welcomeComplete) {
      const hasSeenWelcome = sessionStorage.getItem(`welcomeShown-${theme}`);
      if (!hasSeenWelcome) {
        setShowWelcome(true);
        sessionStorage.setItem(`welcomeShown-${theme}`, 'true');
      } else {
        setWelcomeComplete(true);
      }
    }
  }, [user, loading, isAuthenticated, navigate, welcomeComplete, theme]);

  const handleWelcomeComplete = () => {
    setShowWelcome(false);
    setWelcomeComplete(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-jarvis-primary animate-pulse text-lg">Initializing System...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (showWelcome) {
    const displayName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Sir';
    
    if (theme === 'edex') {
      return <EdexWelcomeSequence userName={displayName} onComplete={handleWelcomeComplete} />;
    }
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
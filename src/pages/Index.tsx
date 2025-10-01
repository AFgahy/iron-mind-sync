import { JarvisInterface } from "@/components/jarvis/JarvisInterface";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

const Index = () => {
  const { user, loading, signOut, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-jarvis-dark">
        <div className="text-jarvis-primary animate-pulse">Lade J.A.R.V.I.S...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background/50 backdrop-blur-sm border border-jarvis-primary/30">
          <User className="w-4 h-4 text-jarvis-primary" />
          <span className="text-sm text-muted-foreground">{user?.email}</span>
        </div>
        <Button
          onClick={signOut}
          variant="outline"
          size="icon"
          className="border-jarvis-primary/30 hover:border-jarvis-primary hover:bg-jarvis-primary/10"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
      <JarvisInterface />
    </div>
  );
};

export default Index;
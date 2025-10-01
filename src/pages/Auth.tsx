import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { ArcReactor } from "@/components/jarvis/ArcReactor";

export default function Auth() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            username: username,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) throw error;

      toast.success("Account erstellt! Du wirst eingeloggt...");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Fehler bei der Registrierung");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Willkommen zurück!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Fehler beim Login");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-jarvis-dark p-4">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <ArcReactor size="lg" />
        </div>
        
        <Card className="jarvis-panel">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold jarvis-glow">J.A.R.V.I.S.</CardTitle>
            <CardDescription>Just A Rather Very Intelligent System</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Login</TabsTrigger>
                <TabsTrigger value="signup">Registrieren</TabsTrigger>
              </TabsList>

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="E-Mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Passwort"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-jarvis hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Lädt..." : "Einloggen"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Vollständiger Name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Benutzername"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      className="bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="email"
                      placeholder="E-Mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      type="password"
                      placeholder="Passwort (min. 6 Zeichen)"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="bg-background/50 border-jarvis-primary/30 focus:border-jarvis-primary"
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full bg-gradient-jarvis hover:opacity-90"
                    disabled={isLoading}
                  >
                    {isLoading ? "Lädt..." : "Registrieren"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
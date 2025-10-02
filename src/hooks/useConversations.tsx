import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant";
  content: string;
  ai_model: string | null;
  created_at: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  // Load conversations
  useEffect(() => {
    if (!user) return;

    const loadConversations = async () => {
      const { data, error } = await supabase
        .from("conversations")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error loading conversations:", error);
        toast.error("Fehler beim Laden der Konversationen");
        return;
      }

      setConversations(data || []);
      if (data && data.length > 0 && !currentConversation) {
        setCurrentConversation(data[0]);
      }
      setLoading(false);
    };

    loadConversations();
  }, [user]);

  // Load messages for current conversation
  useEffect(() => {
    if (!currentConversation) return;

    const loadMessages = async () => {
      const { data, error } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", currentConversation.id)
        .order("created_at", { ascending: true });

      if (error) {
        console.error("Error loading messages:", error);
        toast.error("Fehler beim Laden der Nachrichten");
        return;
      }

      setMessages(
        (data || []).map((msg) => ({
          ...msg,
          role: msg.role as "user" | "assistant",
        }))
      );
    };

    loadMessages();
  }, [currentConversation]);

  const createConversation = async (title = "Neue Konversation") => {
    if (!user) return null;

    const { data, error } = await supabase
      .from("conversations")
      .insert([{ user_id: user.id, title }])
      .select()
      .single();

    if (error) {
      console.error("Error creating conversation:", error);
      toast.error("Fehler beim Erstellen der Konversation");
      return null;
    }

    setConversations((prev) => [data, ...prev]);
    setCurrentConversation(data);
    return data;
  };

  const deleteConversation = async (id: string) => {
    const { error } = await supabase
      .from("conversations")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Fehler beim Löschen der Konversation");
      return;
    }

    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (currentConversation?.id === id) {
      setCurrentConversation(conversations[0] || null);
    }
    toast.success("Konversation gelöscht");
  };

  const addMessage = async (content: string, role: "user" | "assistant", aiModel?: string) => {
    if (!currentConversation) {
      const newConv = await createConversation();
      if (!newConv) return null;
    }

    const { data, error } = await supabase
      .from("messages")
      .insert([{
        conversation_id: currentConversation?.id,
        role,
        content,
        ai_model: aiModel || null,
      }])
      .select()
      .single();

    if (error) {
      console.error("Error adding message:", error);
      toast.error("Fehler beim Speichern der Nachricht");
      return null;
    }

    setMessages((prev) => [
      ...prev,
      { ...data, role: data.role as "user" | "assistant" },
    ]);
    return data;
  };

  return {
    conversations,
    currentConversation,
    messages,
    loading,
    setCurrentConversation,
    createConversation,
    deleteConversation,
    addMessage,
  };
};
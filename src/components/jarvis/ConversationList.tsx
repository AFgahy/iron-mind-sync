import { Plus, Trash2, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { Conversation } from "@/hooks/useConversations";

interface ConversationListProps {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onCreateConversation: () => void;
  onDeleteConversation: (id: string) => void;
  className?: string;
}

export const ConversationList = ({
  conversations,
  currentConversation,
  onSelectConversation,
  onCreateConversation,
  onDeleteConversation,
  className,
}: ConversationListProps) => {
  return (
    <div className={cn("jarvis-panel h-full flex flex-col", className)}>
      <div className="p-4 border-b border-border/30">
        <Button
          onClick={onCreateConversation}
          className="w-full bg-gradient-jarvis hover:opacity-90"
          size="sm"
        >
          <Plus className="w-4 h-4 mr-2" />
          Neue Konversation
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={cn(
                "group relative p-3 rounded-lg cursor-pointer transition-all",
                "hover:bg-jarvis-primary/10 border border-transparent",
                currentConversation?.id === conversation.id &&
                  "bg-jarvis-primary/20 border-jarvis-primary/30"
              )}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-start gap-2">
                <MessageSquare className="w-4 h-4 text-jarvis-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{conversation.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(conversation.updated_at).toLocaleDateString("de-DE")}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="text-center p-8 text-muted-foreground">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">Noch keine Konversationen</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
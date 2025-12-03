import { Settings } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';

export const ThemeSwitcher = () => {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-muted-foreground hover:text-foreground transition-colors"
        >
          <Settings className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem 
          onClick={() => setTheme('jarvis')}
          className={theme === 'jarvis' ? 'bg-accent' : ''}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(200,100%,60%)]" />
            <span>J.A.R.V.I.S. Theme</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('edex')}
          className={theme === 'edex' ? 'bg-accent' : ''}
        >
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[hsl(175,100%,50%)]" />
            <span>eDEX-UI Theme</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};


import { Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";

export function ThemeToggle() {
  const { theme } = useTheme();

  return (
    <Button
      variant="ghost"
      size="icon"
      className="w-9 h-9 rounded-full transition-colors hover:bg-accent"
    >
      <Moon className="h-4 w-4" />
      <span className="sr-only">Dark theme</span>
    </Button>
  );
}

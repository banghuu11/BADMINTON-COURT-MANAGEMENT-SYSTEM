import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../contexts/ThemeContext";

const ThemeToggle = () => {
  const { isDark, toggleTheme } = useTheme();
  const Icon = isDark ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="w-10 h-10 rounded-full bg-slate-100 text-slate-700 border border-slate-200 hover:bg-slate-200 dark:bg-primary/10 dark:text-primary dark:border-primary/30 dark:hover:bg-primary/20 flex items-center justify-center transition-all active:scale-95 shadow-sm"
      title={isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
      aria-label={isDark ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
    >
      <Icon className="w-5 h-5" />
    </button>
  );
};

export default ThemeToggle;

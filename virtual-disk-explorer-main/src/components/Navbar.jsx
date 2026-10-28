import { Link, NavLink } from "react-router-dom";
import { BarChart3, Disc3, FolderOpen, HardDrive, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { to: "/disk-scheduling", label: "Scheduling", icon: Disc3 },
  { to: "/file-allocation", label: "File allocation", icon: FolderOpen },
  { to: "/dashboard", label: "History", icon: BarChart3 },
];

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = window.localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : true;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-2xl">
      <div className="container mx-auto flex min-h-16 flex-wrap items-center justify-between gap-3 px-4 py-2">
        <Link to="/" className="flex items-center gap-2.5 font-bold tracking-tight">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-lg shadow-primary/20">
            <HardDrive className="h-5 w-5 text-primary-foreground" />
          </span>
          <span className="text-base sm:text-lg">Virtual Disk <span className="text-primary">Manager</span></span>
        </Link>

        <nav aria-label="Main navigation" className="order-3 flex w-full items-center gap-1 overflow-x-auto sm:order-none sm:w-auto">
          {links.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted/70 hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden items-center gap-1.5 rounded-full border border-border px-2.5 py-1 text-[11px] font-medium text-muted-foreground md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            SAVED ON THIS DEVICE
          </span>
          <button
            type="button"
            aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
            onClick={() => setDark(!dark)}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

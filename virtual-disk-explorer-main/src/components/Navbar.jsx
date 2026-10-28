import { Link, NavLink } from "react-router-dom";
import { BarChart3, Disc3, FolderOpen, HardDrive, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  { to: "/disk-scheduling", label: "Scheduling", mobileLabel: "Disk", icon: Disc3 },
  { to: "/file-allocation", label: "File allocation", mobileLabel: "Files", icon: FolderOpen },
  { to: "/dashboard", label: "History", mobileLabel: "History", icon: BarChart3 },
];

export default function Navbar() {
  const [dark, setDark] = useState(() => {
    if (typeof window === "undefined") return true;
    const savedTheme = window.localStorage.getItem("theme");
    return savedTheme ? savedTheme === "dark" : false;
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark);
    window.localStorage.setItem("theme", dark ? "dark" : "light");
  }, [dark]);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background">
      <div className="container mx-auto flex min-h-14 flex-wrap items-center justify-between gap-2 px-4 py-2">
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary">
            <HardDrive className="h-4 w-4 text-primary-foreground" />
          </span>
          <span className="text-base sm:text-lg">Virtual Disk <span className="text-primary">Manager</span></span>
        </Link>

        <nav aria-label="Main navigation" className="order-3 flex w-full items-center justify-between gap-1 sm:order-none sm:w-auto sm:justify-start">
          {links.map(({ to, label, mobileLabel, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `flex shrink-0 items-center gap-2 border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
              <span className="sm:hidden">{mobileLabel}</span>
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <span className="hidden text-[11px] font-medium text-muted-foreground md:flex">
            HISTORY STORED LOCALLY
          </span>
          <button
            type="button"
            aria-label={`Switch to ${dark ? "light" : "dark"} theme`}
            onClick={() => setDark(!dark)}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </header>
  );
}

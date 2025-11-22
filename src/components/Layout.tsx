import React, { useState, useEffect } from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Languages,
  Book,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';

const navigation = [
  { name: 'Translator', href: '/translator', icon: Languages },
  { name: 'Vocabulary', href: '/vocabulary', icon: Book },
  { name: 'Review', href: '/review', icon: GraduationCap },
  { name: 'Sentences', href: '/sentences', icon: Sparkles },
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
];

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [focusMode, setFocusMode] = useState(false);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle Focus Mode with Cmd+Shift+F
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'f') {
        e.preventDefault();
        setFocusMode(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-background flex transition-colors duration-500">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      {!focusMode && (
        <div
          className={cn(
            "fixed inset-y-0 left-0 z-50 bg-card/50 backdrop-blur-xl border-r border-white/5 transform transition-all duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-auto lg:flex lg:flex-col",
            sidebarOpen ? "translate-x-0 w-72" : "-translate-x-full lg:translate-x-0",
            'w-72' // Always show full width
          )}
        // onMouseEnter={() => setIsHovered(true)} // Removed hover functionality
        // onMouseLeave={() => setIsHovered(false)} // Removed hover functionality
        >
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 h-16 border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center shadow-lg shadow-primary/20">
                <Languages className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-lg">Vocabulary App</span>
            </div>

            {/* Close button - mobile only */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/5"
            >
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              const Icon = item.icon;
              return (
                <RouterLink
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                  )}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span>{item.name}</span>
                </RouterLink>
              );
            })}
          </nav>

          {/* Footer Actions */}
          <div className="px-3 pb-6 border-t border-white/5 pt-4">
            {/* Focus Mode Toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-white/5 hover:text-foreground transition-all duration-200 w-full"
              title="Toggle Focus Mode (Cmd+Shift+F)"
            >
              <Maximize2 className="w-5 h-5 shrink-0" />
              <span>Focus Mode</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Focus Mode Exit Button */}
        {focusMode && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setFocusMode(false)}
            className="absolute top-4 left-4 z-50 bg-background/50 backdrop-blur-md border border-white/10 hover:bg-background/80 text-muted-foreground hover:text-primary transition-all"
            title="Exit Focus Mode"
          >
            <Minimize2 className="w-5 h-5" />
          </Button>
        )}

        {/* Mobile Header */}
        <div className={cn(
          "lg:hidden flex items-center justify-between h-16 px-4 border-b border-white/5 bg-card/50 backdrop-blur-xl sticky top-0 z-30",
          focusMode ? "hidden" : ""
        )}>
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="-ml-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 scroll-smooth">
          <div className={cn(
            "mx-auto space-y-8 animate-in fade-in duration-500 transition-all",
            focusMode ? "max-w-5xl" : "max-w-7xl"
          )}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

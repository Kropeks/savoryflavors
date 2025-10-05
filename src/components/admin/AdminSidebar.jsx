'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Utensils, ShieldCheck, BarChart2, Bell, Settings } from 'lucide-react';

const navItems = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Manage Recipes', href: '/admin/recipes', icon: Utensils },
  { name: 'Manage Users', href: '/admin/users', icon: Users },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: ShieldCheck },
  { name: 'Analytics', href: '/admin/analytics', icon: BarChart2 },
  { name: 'Reports', href: '/admin/reports', icon: Bell },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-background border-r border-border h-screen sticky top-0 flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-xl font-bold text-foreground">Admin Dashboard</h1>
      </div>
      <nav className="p-4 flex-1 overflow-y-auto min-h-0">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-foreground/80 hover:bg-accent hover:text-foreground'}`}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
      <div className="mt-auto p-4 border-t border-border bg-background">
        <Link
          href="/"
          className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-muted text-foreground/80 hover:text-foreground hover:bg-accent transition-colors px-3 py-3 font-medium"
        >
          Back to Main Site
        </Link>
      </div>
    </div>
  );
}

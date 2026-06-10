"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, ComponentType } from 'react';
import {
  BookOpen,
  Search,
  Menu,
  X,
  PlusCircle,
  User,
} from 'lucide-react';

interface NavLink {
  href: string;
  label: string;
  icon?: ComponentType<{ size?: number }>;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: NavLink[] = [
    { href: '/', label: 'Home' },
    { href: '/explore', label: 'Explore' },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/40 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Left: Logo + Nav Links */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="flex items-center gap-2.5 group shrink-0"
              title="Home"
            >
              <span className="text-base font-semibold text-white">
                My<span className="text-purple-500">Blogs</span>
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href;
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-white/10 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    {Icon && <Icon size={16} />}
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Search, User, Mobile Toggle */}
          <div className="flex items-center gap-2">
            {/* Search Bar (desktop) */}
            {/* <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-transparent hover:border-white/10 focus-within:border-white/20 transition-all">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search blogs..."
                className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-32 lg:w-48"
              />
            </div> */}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/5 py-4 space-y-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {Icon && <Icon size={16} />}
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Search */}
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/5">
              <Search size={16} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none w-full"
              />
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
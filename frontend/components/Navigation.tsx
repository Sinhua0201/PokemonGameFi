'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Home, Swords, Search, ShoppingBag, User, MessageSquare, Trophy, Baby, Map } from 'lucide-react';
import { WalletConnect } from './WalletConnect';

export function Navigation() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/battle', label: 'Battle', icon: Swords },
    { href: '/explore', label: 'Map', icon: Map },
    { href: '/encounter', label: 'Quick', icon: Search },
    { href: '/breeding', label: 'Breeding', icon: Baby },
    { href: '/marketplace', label: 'Market', icon: ShoppingBag },
    { href: '/quests', label: 'Quests', icon: Trophy },
    { href: '/trainer-dialogue', label: 'Trainer', icon: MessageSquare },
    { href: '/profile', label: 'Profile', icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Menu Button - Left Top */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-3 rounded-xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-md shadow-lg hover:shadow-xl transition-all hover:scale-110 border border-gray-200/50 dark:border-gray-700/50"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <X className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>

          {/* Wallet Connect - Right Top */}
          <div className="hidden sm:block">
            <WalletConnect />
          </div>
        </div>
      </div>

      {/* Menu Dropdown - Beautiful slide-in panel */}
      {isOpen && (
        <div className="fixed top-16 left-4 w-64 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 animate-slide-in-left overflow-hidden">
          <div className="p-3 space-y-1">
            {/* Logo in menu */}
            <div className="flex items-center space-x-2 px-3 py-3 border-b border-gray-200 dark:border-gray-700 mb-2">
              <span className="text-2xl">⚡</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                PokéChain
              </span>
            </div>

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-xl text-base font-medium transition-all
                    ${
                      isActive(item.href)
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg scale-105'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            
            {/* Mobile wallet connect */}
            <div className="pt-3 mt-2 border-t border-gray-200 dark:border-gray-700 sm:hidden">
              <WalletConnect />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}

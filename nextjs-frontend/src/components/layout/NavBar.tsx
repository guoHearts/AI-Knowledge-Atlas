'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/', label: '学习路径' },
  { href: '/graph', label: '知识图谱' },
  { href: '/cms', label: '内容管理' },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="glass-panel shrink-0 z-50 sticky top-0">
      <nav className="flex items-center gap-6 px-6 py-3 max-w-7xl mx-auto">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 group">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
            style={{
              background: 'linear-gradient(135deg, rgba(91,156,245,0.25), rgba(167,139,250,0.2))',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5b9cf5" strokeWidth="1.8">
              <circle cx="12" cy="12" r="3" />
              <path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-cosmos-text font-display tracking-tight leading-tight">
              AI 开发者实训平台
            </h1>
            <p className="text-[10px] text-cosmos-dim font-display tracking-wider">
              DEVELOPER TRAINING PLATFORM
            </p>
          </div>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1 ml-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-stellar-blue/10 text-stellar-blue'
                    : 'text-cosmos-dim hover:text-cosmos-text hover:bg-white/[0.03]'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* Right spacer */}
        <div className="flex-1" />

        {/* User placeholder */}
        <div className="flex items-center gap-2 text-xs text-cosmos-dim font-display">
          <div className="w-6 h-6 rounded-full bg-stellar-blue/20 flex items-center justify-center text-stellar-blue text-[10px] font-bold">
            U
          </div>
          <span className="hidden sm:inline">学习者</span>
        </div>
      </nav>
    </header>
  );
}

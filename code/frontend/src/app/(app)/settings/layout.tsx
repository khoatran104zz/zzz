'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Sliders, Shield, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { t } = useTranslation('settings');

  // Sidebar Settings page tabs: Preferences, Security, Notifications
  const settingsTabs = [
    { name: t('tabs.preferences', { defaultValue: 'Tùy chọn' }), href: '/settings', icon: Sliders },
    { name: t('tabs.security', { defaultValue: 'Bảo mật' }), href: '/settings/security', icon: Shield },
    { name: t('tabs.notifications', { defaultValue: 'Thông báo' }), href: '/settings/notifications', icon: Bell },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="border-b border-surface-border pb-4">
        <h1 className="text-xl font-bold tracking-tight text-text-primary font-heading">
          {t('title', { defaultValue: 'Cài đặt & Tùy chọn' })}
        </h1>
        <p className="text-xs text-text-secondary mt-1">
          {t('subtitle', { defaultValue: 'Quản lý tùy chọn ứng dụng, giao diện, bảo mật và thông báo' })}
        </p>
      </div>

      {/* Settings Navigation Bar */}
      <div className="flex border-b border-surface-border overflow-x-auto space-x-1">
        {settingsTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href || (tab.href === '/settings' && pathname === '/settings/preferences');

          return (
            <Link
              key={tab.href}
              href={tab.href as any}
              className={`flex items-center space-x-2 border-b-2 px-4 py-2.5 text-xs font-semibold transition ${
                isActive
                  ? 'border-primary text-primary bg-menu-active rounded-t-xl font-bold shadow-xs'
                  : 'border-transparent text-text-secondary hover:border-surface-border hover:text-text-primary'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Active Tab Content */}
      <div className="pt-2">{children}</div>
    </div>
  );
}

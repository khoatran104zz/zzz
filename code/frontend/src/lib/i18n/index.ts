import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import commonVi from '@/locales/vi/common.json';
import authVi from '@/locales/vi/auth.json';
import navigationVi from '@/locales/vi/navigation.json';
import settingsVi from '@/locales/vi/settings.json';
import workspaceVi from '@/locales/vi/workspace.json';
import projectVi from '@/locales/vi/project.json';
import taskVi from '@/locales/vi/task.json';
import teamVi from '@/locales/vi/team.json';
import wikiVi from '@/locales/vi/wiki.json';
import whiteboardVi from '@/locales/vi/whiteboard.json';
import timelineVi from '@/locales/vi/timeline.json';
import calendarVi from '@/locales/vi/calendar.json';
import notificationVi from '@/locales/vi/notification.json';
import searchVi from '@/locales/vi/search.json';
import validationVi from '@/locales/vi/validation.json';
import errorVi from '@/locales/vi/error.json';
import dashboardVi from '@/locales/vi/dashboard.json';

import commonEn from '@/locales/en/common.json';
import authEn from '@/locales/en/auth.json';
import navigationEn from '@/locales/en/navigation.json';
import settingsEn from '@/locales/en/settings.json';
import workspaceEn from '@/locales/en/workspace.json';
import projectEn from '@/locales/en/project.json';
import taskEn from '@/locales/en/task.json';
import teamEn from '@/locales/en/team.json';
import wikiEn from '@/locales/en/wiki.json';
import whiteboardEn from '@/locales/en/whiteboard.json';
import timelineEn from '@/locales/en/timeline.json';
import calendarEn from '@/locales/en/calendar.json';
import notificationEn from '@/locales/en/notification.json';
import searchEn from '@/locales/en/search.json';
import validationEn from '@/locales/en/validation.json';
import errorEn from '@/locales/en/error.json';
import dashboardEn from '@/locales/en/dashboard.json';

export const resources = {
  vi: {
    common: commonVi,
    auth: authVi,
    navigation: navigationVi,
    settings: settingsVi,
    workspace: workspaceVi,
    project: projectVi,
    task: taskVi,
    team: teamVi,
    wiki: wikiVi,
    whiteboard: whiteboardVi,
    timeline: timelineVi,
    calendar: calendarVi,
    notification: notificationVi,
    search: searchVi,
    validation: validationVi,
    error: errorVi,
    dashboard: dashboardVi,
  },
  en: {
    common: commonEn,
    auth: authEn,
    navigation: navigationEn,
    settings: settingsEn,
    workspace: workspaceEn,
    project: projectEn,
    task: taskEn,
    team: teamEn,
    wiki: wikiEn,
    whiteboard: whiteboardEn,
    timeline: timelineEn,
    calendar: calendarEn,
    notification: notificationEn,
    search: searchEn,
    validation: validationEn,
    error: errorEn,
    dashboard: dashboardEn,
  },
} as const;

let initialLang = 'vi';
if (typeof window !== 'undefined') {
  try {
    const storedSettings = localStorage.getItem('taskflow-user-settings-storage');
    if (storedSettings) {
      const parsed = JSON.parse(storedSettings);
      if (parsed?.state?.language === 'en' || parsed?.state?.language === 'vi') {
        initialLang = parsed.state.language;
      }
    }
  } catch {
    // fallback to 'vi'
  }
}

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: initialLang,
    fallbackLng: 'vi',
    defaultNS: 'common',
    ns: [
      'common',
      'auth',
      'navigation',
      'settings',
      'workspace',
      'project',
      'task',
      'team',
      'wiki',
      'whiteboard',
      'timeline',
      'calendar',
      'notification',
      'search',
      'validation',
      'error',
      'dashboard',
    ],
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;

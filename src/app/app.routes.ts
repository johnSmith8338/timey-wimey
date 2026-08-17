import { Routes } from '@angular/router';
import { Stopwatch } from './pages/stopwatch/stopwatch';
import { Timer } from './pages/timer/timer';
import { Welcome } from './pages/welcome/welcome';
import { NotFound } from './pages/not-found/not-found';
import { Settings } from './pages/settings/settings';
import { AlarmPage } from './pages/alarm/alarm';
import { Dashboard } from './pages/dashboard/dashboard';
import { appInitGuard } from './utils/app.guard';
import { About } from './pages/about/about';

export const routes: Routes = [
    {
        path: '',
        component: Welcome,
        data: {
            title: 'welcome',
            showInMenu: false,
        }
    },
    {
        path: 'dashboard',
        component: Dashboard,
        canMatch: [appInitGuard],
        data: {
            title: 'dashboard',
            showInMenu: true,
            icon: '',
            order: 1
        }
    },
    {
        path: 'stopwatch',
        component: Stopwatch,
        canMatch: [appInitGuard],
        data: {
            title: 'stopwatch',
            showInMenu: true,
            icon: '',
            order: 4
        }
    },
    {
        path: 'timer',
        component: Timer,
        canMatch: [appInitGuard],
        data: {
            title: 'timer',
            showInMenu: true,
            icon: '',
            order: 3
        }
    },
    {
        path: 'alarm',
        component: AlarmPage,
        canMatch: [appInitGuard],
        data: {
            title: 'alarm',
            showInMenu: true,
            icon: '',
            order: 2
        }
    },
    {
        path: 'settings',
        component: Settings,
        canMatch: [appInitGuard],
        data: {
            title: 'settings',
            showInMenu: true,
            icon: '',
            order: 5
        }
    },
    {
        path: 'about',
        component: About,
        canMatch: [appInitGuard],
        data: {
            title: 'about',
            showInMenu: true,
            icon: '',
            order: 6
        }
    },
    {
        path: '404',
        component: NotFound,
        data: {
            title: '404',
            showInMenu: false,
        }
    },
    {
        path: '**',
        redirectTo: '404'
    }
];

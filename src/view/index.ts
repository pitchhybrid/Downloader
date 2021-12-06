import { Zazhitaotou } from './view.zazhitaotu';
import { Xinmeitulu } from './view.xinmeitulu';
import { _8hko } from './view.8hko';
import { Abstract } from './view'

export type Route = {
    View: (new () => Abstract);
    path: string[];
    enabled?: boolean;
};

export const routes: Route[] = [
    {
        View: Zazhitaotou,
        path: ['https://zazhitaotu.cc', 'https://tu.acgbox.org'],
        enabled: true
    },
    {
        View: _8hko,
        path: ['https://www.shenzhenyezi.com', 'https://8hko.com', 'https://palaxe.com'],
        enabled: true
    },
    {
        View: Xinmeitulu,
        path: ['https://www.xinmeitulu.com', 'https://www.twlegs.com'],
        enabled: true
    }
];
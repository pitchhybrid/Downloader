
import { Abstract } from './view';
import { Zazhitaotou } from './view.zazhitaotu';
import { Xinmeitulu } from './view.xinmeitulu';
import { Dongtimini } from './view.dongtimimi';
import { Quxiezhen } from './view.quxiezhen';
import { Asiansister } from './view.asiansister';
import { Cyberdrop } from './view.cyberdrop';
import { _8hko } from './view.8hko';
import { Ryuryu } from './view.ryuryu';
import { Everia } from './view.everia';

export type Route = {
    View: (new () => Abstract);
    path: string[];
    enabled?: boolean;
};

export const routes: Route[] = [
    {
        View: Zazhitaotou,
        path: [],
        enabled: true
    },
    {
        View: _8hko,
        path: [],
        enabled: true
    },
    {
        View: Xinmeitulu,
        path: [],
        enabled: true
    },
    {
        View: Dongtimini,
        path: [],
        enabled: true
    },
    {
        View: Quxiezhen,
        path: [],
        enabled: true
    },
    {
        View: Asiansister,
        path: [],
        enabled: true
    },
    {
        View: Cyberdrop,
        path: [],
        enabled: true
    },
    {
        View: Ryuryu,
        path: [],
        enabled: true
    },
    {
        View: Everia,
        path: [],
        enabled: true
    },
];


import { Zazhitaotou } from './view.zazhitaotu';
import { Xinmeitulu } from './view.xinmeitulu';
import { Dongtimini } from './view.dongtimimi';
import { Quxiezhen } from './view.quxiezhen';
import { Asiansister } from './view.asiansister';
import { Cyberdrop } from './view.cyberdrop';
import { _8hko } from './view.8hko';
import { Ryuryu } from './view.ryuryu';
import { Abstract } from './view';
const view = ( (ext) => {
    let keys = ext.keys();
    let values = keys.map(ext);
    return values.reduce((accumulator:any,key:any,index) => ({
       ...accumulator,
       [key]:values[index]
    }),{});
})(require.context('./',true,/\*.ts/))

console.log(view)

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
        path: ['https://www.shenzhenyezi.com', 'https://8hko.com', 'https://palaxe.com','https://www.92saobao.com','https://www.wooden-specialties.com','https://www.nrvjeepclub.com'],
        enabled: true
    },
    {
        View: Xinmeitulu,
        path: ['https://www.xinmeitulu.com', 'https://www.twlegs.com'],
        enabled: true
    },
    {
        View: Dongtimini,
        path: ['https://dongtimimi.com'],
        enabled: true
    },
    {
        View: Quxiezhen,
        path: ['https://www.quxiezhen.com'],
        enabled: true
    },
    {
        View: Asiansister,
        path: ['https://asiansister.com'],
        enabled: true
    },
    {
        View: Cyberdrop,
        path: ['https://cyberdrop.me','https://bunkr.is'],
        enabled: true
    },
    {
        View: Ryuryu,
        path: ['http://ryuryu.tw'],
        enabled: true
    },
];

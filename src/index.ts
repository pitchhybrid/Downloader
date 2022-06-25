import { routes, Route } from './view/index';

var route: Route = routes.filter((item) => item.path.includes(window.origin))[0];

if (route && route.enabled) {
    debugger;
    const { View } = route;
    const view = new View();
    view.queryLinksImages();
    view.render();
}
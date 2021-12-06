import { routes, Route } from './view/index';

var route: Route = routes.filter((item) => item.path.includes(window.origin))[0];

if (route && route.enabled) {
    const view = new route.View();
    view.queryLinksImages();
    view.render();
}
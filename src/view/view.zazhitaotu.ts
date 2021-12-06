import { Image } from '../model/image';
import { Abstract } from './view';

export class Zazhitaotou extends Abstract {

    constructor() {
        super();
    }

    public queryLinksImages(): void {
        document.querySelectorAll<HTMLElement>('img.post-item-img').forEach((item:HTMLElement,index:number)=> {
            this.images.push(new Image(item.title, item.dataset.original,index));
        });
    }

    public name(): string {
        var t: HTMLElement = document.querySelector('span.post-info-text');
        return t.innerText;
    }

}
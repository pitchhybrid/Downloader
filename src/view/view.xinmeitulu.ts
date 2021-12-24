import { Image } from '../model/image';
import { Abstract } from './view';

export class Xinmeitulu extends Abstract{

    public name(): string {
        return document.querySelector<HTMLElement>('.container>h1.h3').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        document.querySelectorAll<HTMLElement>('.figure-img.img-fluid.rounded').forEach((item:HTMLElement,index:number) =>{
            this.images.push(new Image(name,item.dataset.original,index));
        });
    }

}
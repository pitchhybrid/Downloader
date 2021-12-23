import { Image } from '../model/image';
import { Abstract } from './view';

export class Everia extends Abstract {
    
    public name(): string {
        return document.querySelector<HTMLElement>('.title.entry-title').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        document.querySelectorAll<HTMLImageElement>('.blocks-gallery-item>figure>img').forEach((item:HTMLImageElement,index:number) =>{
            this.images.push(new Image(name,item.src,index));
        });
    }

}
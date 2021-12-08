import { Image } from '../model/image';
import { Abstract } from './view'
export class Quxiezhen extends Abstract {
    
    constructor(){
        super();
    }
    
    public name(): string {
        var a:HTMLElement = document.querySelector<HTMLElement>('.item_title>h1');
        if(a == null || undefined){
            return document.querySelector<HTMLElement>('title').innerText;
        }
        return a.innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        document.querySelectorAll<HTMLImageElement>('.imageclick-imgbox>img').forEach((item:HTMLImageElement, index:number) => {
            this.images.push(new Image( name, item.dataset.src, index));
        })
    }

}
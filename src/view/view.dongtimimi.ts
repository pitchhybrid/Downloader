import { Image } from '../model/image';
import { Abstract } from './view';

export class Dongtimini extends Abstract{
    
    constructor(){
        super();
    }

    public name(): string {
        return document.querySelector<HTMLElement>('header.entry-header>h1').innerText;
    }
    public queryLinksImages(): void | [Image] {
        var name:string = this.name();
        document.querySelectorAll<HTMLImageElement>('div.entry-content figure > img').forEach((item:HTMLImageElement, index:number) => {
            this.images.push(new Image(name,item.src,index));
        })
    }

}